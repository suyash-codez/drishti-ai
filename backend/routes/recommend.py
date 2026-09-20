import os
import json
import joblib
import pandas as pd
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.services.weather import get_forecast_48h
from backend.services.savings import calculate_savings
from backend.services.explain import generate_explanation_and_alert
from backend.db.supabase_client import log_farm_session

router = APIRouter(tags=["recommendation"])

# Load models and guardrails once on startup
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
ML_DIR = os.path.join(os.path.dirname(__file__), "..", "ml")

ranges_path = os.path.join(ML_DIR, "crop_ranges.json")
with open(ranges_path, "r", encoding="utf-8") as f:
    CROP_RANGES: Dict[str, Any] = json.load(f)

irr_model_path = os.path.join(MODELS_DIR, "irrigation_model.pkl")
fert_model_path = os.path.join(MODELS_DIR, "fertilizer_model.pkl")

irr_bundle = joblib.load(irr_model_path)
fert_bundle = joblib.load(fert_model_path)

irrigation_pipeline = irr_bundle["model"]
fertilizer_pipeline = fert_bundle["model"]
irr_feature_importances = irr_bundle["feature_importances"]

# Schemas
class RecommendRequest(BaseModel):
    crop_type: str = Field(..., example="wheat", description="Crop name")
    soil_moisture: float = Field(..., ge=0.0, le=100.0, example=22.5, description="Soil moisture percentage")
    temperature: float = Field(..., example=31.0, description="Temperature in Celsius")
    rainfall: float = Field(0.0, ge=0.0, example=4.0, description="Recent rainfall in mm")
    latitude: Optional[float] = Field(None, example=22.71)
    longitude: Optional[float] = Field(None, example=75.86)
    language: Optional[str] = Field("hi", example="hi", description="Output language (en, hi, mr)")

class IrrigationRecommendation(BaseModel):
    amount_mm: float
    timing: str

class FertilizerRecommendation(BaseModel):
    type: str
    amount_kg_per_acre: float

class RecommendResponse(BaseModel):
    irrigation_recommendation: IrrigationRecommendation
    fertilizer_recommendation: FertilizerRecommendation
    explanation: str
    alert_level: str
    alert_message: str
    water_saved_liters: float
    cost_saved_rupees: float
    forecast_note: Optional[str] = None

TIMING_TRANSLATIONS = {
    "immediate": {
        "en": "Immediate (within 12-24 hours)",
        "hi": "तुरंत (12-24 घंटे के भीतर)",
        "mr": "तातडीने (12-24 तासांच्या आत)"
    },
    "normal": {
        "en": "within 24 to 48 hours",
        "hi": "24 से 48 घंटे के भीतर",
        "mr": "24 ते 48 तासांच्या आत"
    },
    "delayed_rain": {
        "en": "Postpone by 48 hours (rain expected)",
        "hi": "48 घंटे के लिए टालें (बारिश की संभावना)",
        "mr": "48 तासांसाठी पुढे ढकला (पावसाची शक्यता)"
    },
    "delayed_light": {
        "en": "Postpone by 24 hours (moderate rain forecast)",
        "hi": "24 घंटे के लिए टालें (हल्की/मध्यम बारिश अनुमानित)",
        "mr": "24 तासांसाठी पुढे ढकला (हलका पाऊस अंदाज)"
    }
}

@router.post("/recommend", response_model=RecommendResponse)
def get_recommendation(req: RecommendRequest):
    crop_key = req.crop_type.strip().lower()
    
    # 1. Validation check for crop
    if crop_key not in CROP_RANGES:
        supported = ", ".join(CROP_RANGES.keys())
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported crop_type '{req.crop_type}'. Supported crops are: {supported}."
        )

    crop_cfg = CROP_RANGES[crop_key]
    lang = (req.language or "hi").strip().lower()
    if lang not in ["en", "hi", "mr"]:
        lang = "hi"

    # 2. ML Predictions (RandomForest per Section 12.3 constraint)
    input_df = pd.DataFrame([{
        "crop_type": crop_key,
        "soil_moisture": req.soil_moisture,
        "temperature": req.temperature,
        "rainfall": req.rainfall
    }])

    raw_irrigation_mm = float(irrigation_pipeline.predict(input_df)[0])
    raw_fertilizer_type = str(fertilizer_pipeline.predict(input_df)[0])

    # 3. Agronomic Safety Guardrail Clamping (CRITICAL Section 12.3 constraint)
    # Clamp both outputs against the crop's known min/max safe range
    clamped_irrigation_mm = max(
        crop_cfg["irrigation_min"],
        min(crop_cfg["irrigation_max"], raw_irrigation_mm)
    )

    # Base fertilizer amount clamped between safe agronomic limits
    base_fert_kg = (crop_cfg["fertilizer_min"] + crop_cfg["fertilizer_max"]) / 2.0
    if req.soil_moisture < crop_cfg["optimal_moisture_min"]:
        # Increase nutrient availability slightly when stressed
        est_fert_kg = base_fert_kg * 0.95
    else:
        est_fert_kg = base_fert_kg

    clamped_fertilizer_kg = max(
        crop_cfg["fertilizer_min"],
        min(crop_cfg["fertilizer_max"], est_fert_kg)
    )

    # 4. Weather forecast lookahead (Open-Meteo)
    rain_48h, forecast_note = get_forecast_48h(req.latitude, req.longitude, language=lang)

    # 5. Timing logic
    if rain_48h is not None and rain_48h >= 10.0:
        timing_key = "delayed_rain"
    elif rain_48h is not None and rain_48h >= 3.0:
        timing_key = "delayed_light"
    elif req.soil_moisture < crop_cfg["optimal_moisture_min"]:
        timing_key = "immediate"
    else:
        timing_key = "normal"

    timing_str = TIMING_TRANSLATIONS[timing_key].get(lang, TIMING_TRANSLATIONS[timing_key]["en"])

    # 6. Savings calculation
    water_saved_l, cost_saved_rs = calculate_savings(
        crop_key,
        clamped_irrigation_mm,
        clamped_fertilizer_kg
    )

    # 7. Explanation and alert system
    explanation, alert_level, alert_msg = generate_explanation_and_alert(
        crop_type=crop_key,
        soil_moisture=req.soil_moisture,
        temperature=req.temperature,
        rainfall=req.rainfall,
        irrigation_mm=clamped_irrigation_mm,
        crop_ranges=CROP_RANGES,
        feature_importances=irr_feature_importances,
        language=lang
    )

    response_data = {
        "irrigation_recommendation": {
            "amount_mm": round(clamped_irrigation_mm, 1),
            "timing": timing_str
        },
        "fertilizer_recommendation": {
            "type": raw_fertilizer_type,
            "amount_kg_per_acre": round(clamped_fertilizer_kg, 1)
        },
        "explanation": explanation,
        "alert_level": alert_level,
        "alert_message": alert_msg,
        "water_saved_liters": water_saved_l,
        "cost_saved_rupees": cost_saved_rs,
        "forecast_note": forecast_note
    }

    # 8. Log session to Supabase
    log_farm_session({
        **response_data,
        "crop_type": crop_key,
        "soil_moisture": req.soil_moisture,
        "temperature": req.temperature,
        "rainfall": req.rainfall,
        "language": lang
    })

    return response_data
