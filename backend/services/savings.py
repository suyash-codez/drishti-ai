import json
import os
from typing import Dict, Tuple

def load_crop_ranges() -> Dict:
    path = os.path.join(os.path.dirname(__file__), "..", "ml", "crop_ranges.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def calculate_savings(
    crop_type: str,
    recommended_irrigation_mm: float,
    recommended_fertilizer_kg: float
) -> Tuple[float, float]:
    """
    Computes water saved (liters) and cost saved (₹) against typical farmer baseline.
    Never returns negative values (clamped at 0.0 minimum).
    """
    crop_ranges = load_crop_ranges()
    crop_data = crop_ranges.get(crop_type.lower())
    
    if not crop_data:
        return 0.0, 0.0

    # 1 mm irrigation on 1 acre = ~4,047 liters of water (approx 100 liters per 1 mm per 100 sq.m)
    # Baseline typical flood irrigation in liters for Indian marginal plots (~0.5 - 1 acre)
    baseline_water_liters = crop_data.get("baseline_water_liters_acre", 3500.0)
    baseline_fertilizer_kg = crop_data.get("baseline_fertilizer_kg_acre", 45.0)
    
    water_cost_per_liter = crop_data.get("water_cost_per_liter", 0.05) # ₹/L pumping/electricity/canal cost
    fertilizer_cost_per_kg = crop_data.get("fertilizer_cost_per_kg", 10.0) # ₹/kg

    # Recommended water in liters: 1 mm ~ 100 liters per standard small farmer demo plot (~100 sq.m)
    # Or 1 mm ~ 80-120 liters for a standard test plot unit
    recommended_water_liters = recommended_irrigation_mm * 120.0

    water_saved_liters = max(0.0, baseline_water_liters - recommended_water_liters)
    fertilizer_saved_kg = max(0.0, baseline_fertilizer_kg - recommended_fertilizer_kg)

    cost_saved_rupees = (water_saved_liters * water_cost_per_liter) + (fertilizer_saved_kg * fertilizer_cost_per_kg)
    
    return round(float(water_saved_liters), 1), round(float(cost_saved_rupees), 1)
