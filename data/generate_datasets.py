import os
import json
import numpy as np
import pandas as pd

def generate_datasets():
    os.makedirs("data", exist_ok=True)
    with open("backend/ml/crop_ranges.json", "r") as f:
        crop_ranges = json.load(f)

    np.random.seed(42)
    crops = list(crop_ranges.keys())
    
    # 1. Crop Irrigation Dataset
    irrigation_records = []
    for crop in crops:
        cfg = crop_ranges[crop]
        # Generate 400 samples per crop across diverse moisture, temp, rainfall
        for _ in range(400):
            moisture = np.random.uniform(10.0, 70.0)
            temp = np.random.uniform(10.0, 45.0)
            rainfall = np.random.exponential(scale=15.0) # mm
            
            # Irrigation physics: if soil moisture is below optimal min, more water needed.
            # If rainfall is high, less water needed. If temp is high (evapotranspiration), more water needed.
            moist_deficit = max(0.0, cfg["optimal_moisture_max"] - moisture)
            heat_factor = max(0.0, temp - cfg["optimal_temp_min"]) * 0.4
            rain_offset = min(rainfall * 0.5, 30.0)
            
            base = (cfg["irrigation_min"] + cfg["irrigation_max"]) / 2.0
            irrigation = base + (moist_deficit * 0.45) + heat_factor - rain_offset
            # Add small realistic natural variance
            irrigation += np.random.normal(0, 1.5)
            # Bound within crop realistic regime
            irrigation = max(cfg["irrigation_min"] * 0.8, min(cfg["irrigation_max"] * 1.2, irrigation))
            
            irrigation_records.append({
                "crop_type": crop,
                "soil_moisture": round(float(moisture), 2),
                "temperature": round(float(temp), 2),
                "rainfall": round(float(rainfall), 2),
                "irrigation_amount_mm": round(float(irrigation), 2)
            })

    df_irr = pd.DataFrame(irrigation_records)
    irr_path = "data/Crop_recommendation.csv"
    df_irr.to_csv(irr_path, index=False)
    print(f"Generated {len(df_irr)} samples for {irr_path}")

    # 2. Fertilizer Prediction Dataset
    fert_records = []
    fertilizer_types_by_crop = {
        "wheat": ["Urea", "DAP", "NPK 10-26-26"],
        "rice": ["Urea", "NPK 14-35-14", "DAP"],
        "cotton": ["DAP", "Potash (MOP)", "Urea"],
        "maize": ["NPK 14-35-14", "Urea", "DAP"],
        "sugarcane": ["Urea", "Potash (MOP)", "NPK 10-26-26"],
        "potato": ["NPK 10-26-26", "DAP", "Urea"],
        "tomato": ["NPK 19-19-19", "Calcium Nitrate", "Urea"]
    }

    for crop in crops:
        cfg = crop_ranges[crop]
        fert_choices = fertilizer_types_by_crop.get(crop, ["Urea", "DAP"])
        for _ in range(400):
            moisture = np.random.uniform(10.0, 70.0)
            temp = np.random.uniform(10.0, 45.0)
            rainfall = np.random.exponential(scale=15.0)
            
            # Select fertilizer based on soil conditions
            if moisture < cfg["optimal_moisture_min"]:
                chosen_fert = fert_choices[0]
            elif temp > cfg["optimal_temp_max"]:
                chosen_fert = fert_choices[min(1, len(fert_choices)-1)]
            else:
                chosen_fert = np.random.choice(fert_choices)
                
            # Amount calculation
            base_amt = (cfg["fertilizer_min"] + cfg["fertilizer_max"]) / 2.0
            amt = base_amt + np.random.normal(0, 3.0)
            amt = max(cfg["fertilizer_min"], min(cfg["fertilizer_max"], amt))

            fert_records.append({
                "crop_type": crop,
                "soil_moisture": round(float(moisture), 2),
                "temperature": round(float(temp), 2),
                "rainfall": round(float(rainfall), 2),
                "fertilizer_type": chosen_fert,
                "fertilizer_amount_kg": round(float(amt), 2)
            })

    df_fert = pd.DataFrame(fert_records)
    fert_path = "data/Fertilizer_Prediction.csv"
    df_fert.to_csv(fert_path, index=False)
    print(f"Generated {len(df_fert)} samples for {fert_path}")

if __name__ == "__main__":
    generate_datasets()
