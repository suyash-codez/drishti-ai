import json
import joblib
from backend.services.explain import generate_explanation_and_alert
from backend.services.weather import get_forecast_48h
from backend.services.savings import calculate_savings

def test_explain():
    with open("backend/ml/crop_ranges.json", "r", encoding="utf-8") as f:
        ranges = json.load(f)
    irr_art = joblib.load("backend/models/irrigation_model.pkl")
    fi = irr_art["feature_importances"]

    for lang in ["en", "hi", "mr"]:
        exp, lvl, msg = generate_explanation_and_alert(
            crop_type="wheat",
            soil_moisture=22.5,
            temperature=31.0,
            rainfall=4.0,
            irrigation_mm=18.4,
            crop_ranges=ranges,
            feature_importances=fi,
            language=lang
        )
        assert isinstance(exp, str) and len(exp) > 10, f"Failed for {lang}: empty explanation"
        assert lvl in ["green", "yellow", "red"], f"Invalid alert level: {lvl}"
        assert isinstance(msg, str) and len(msg) > 10, f"Failed for {lang}: empty alert message"

    print("Task 6 Test Passed: All languages generated valid explanations & alerts!")

if __name__ == "__main__":
    test_explain()
