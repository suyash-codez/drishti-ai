import json
import os
from typing import Dict, Any, Tuple

# Multilingual explanation templates
EXPLANATION_TEMPLATES = {
    "en": {
        "moisture_low": "soil moisture ({val}%, which is {diff}% below optimal for {crop})",
        "moisture_high": "adequate soil moisture ({val}%, {diff}% above minimal threshold for {crop})",
        "temp_high": "elevated temperature ({val}°C increasing evapotranspiration)",
        "temp_normal": "moderate temperature ({val}°C)",
        "rain_recent": "recent rainfall ({val} mm keeping root zone moist)",
        "rain_dry": "dry conditions with only {val} mm rain",
        "crop_factor": "{crop} specific growth stage water requirements",
        "sentence": "Recommendation driven mainly by: {factor1} and {factor2}."
    },
    "hi": {
        "moisture_low": "मिट्टी की नमी ({val}%, जो {crop} के लिए आदर्श नमी से {diff}% कम है)",
        "moisture_high": "मिट्टी में पर्याप्त नमी ({val}%, जो {crop} की जरूरत से {diff}% अधिक है)",
        "temp_high": "अधिक तापमान ({val}°C, जिससे वाष्पीकरण बढ़ रहा है)",
        "temp_normal": "अनुकूल तापमान ({val}°C)",
        "rain_recent": "हालिया वर्षा ({val} मिमी, जिससे जड़ों में नमी बनी हुई है)",
        "rain_dry": "शुष्क मौसम (केवल {val} मिमी वर्षा)",
        "crop_factor": "{crop} फसल की पानी की विशिष्ट आवश्यकता",
        "sentence": "सलाह मुख्य रूप से इन दो कारणों पर आधारित है: {factor1} तथा {factor2}।"
    },
    "mr": {
        "moisture_low": "मातीतील ओलावा ({val}%, जे {crop} पिकाच्या आवश्यकतेपेक्षा {diff}% कमी आहे)",
        "moisture_high": "मातीत पुरेसा ओलावा ({val}%, जे {crop} साठी योग्य आहे)",
        "temp_high": "जास्त तापमान ({val}°C, ज्यामुळे बाष्पीभवन वाढत आहे)",
        "temp_normal": "अनुकूल तापमान ({val}°C)",
        "rain_recent": "नुकताच झालेला पाऊस ({val} मिमी)",
        "rain_dry": "कोरडे वातावरण (केवळ {val} मिमी पाऊस)",
        "crop_factor": "{crop} पिकाची पाण्याची विशिष्ट गरज",
        "sentence": "ही शिफारस मुख्यत्वे या दोन घटकांवर आधारित आहे: {factor1} आणि {factor2}."
    }
}

CROP_NAMES = {
    "wheat": {"en": "wheat", "hi": "गेहूं", "mr": "गहू"},
    "rice": {"en": "rice (paddy)", "hi": "धान (चावल)", "mr": "भात (तांदूळ)"},
    "cotton": {"en": "cotton", "hi": "कपास", "mr": "कापूस"},
    "maize": {"en": "maize", "hi": "मक्का", "mr": "मका"},
    "sugarcane": {"en": "sugarcane", "hi": "गन्ना", "mr": "ऊस"},
    "potato": {"en": "potato", "hi": "आलू", "mr": "बटाटा"},
    "tomato": {"en": "tomato", "hi": "टमाटर", "mr": "टोमॅटो"},
    "soybean": {"en": "soybean", "hi": "सोयाबीन", "mr": "सोयाबीन"},
    "mustard": {"en": "mustard", "hi": "सरसों", "mr": "मोहरी"},
    "gram": {"en": "gram (chana)", "hi": "चना", "mr": "हरभरा"},
    "onion": {"en": "onion", "hi": "प्याज", "mr": "कांदा"},
    "bajra": {"en": "pearl millet (bajra)", "hi": "बाजरा", "mr": "बाजरी"},
    "groundnut": {"en": "groundnut", "hi": "मूंगफली", "mr": "भुईमूग"}
}

ALERT_TEMPLATES = {
    "en": {
        "green": "Optimal usage: Your resource plan matches ideal agronomic levels perfectly.",
        "yellow": "Mild resource nudge: Consider reducing water or fertilizer by 10-15% to safeguard soil biology.",
        "red": "Excessive resource alert: High water/fertilizer application risks nutrient leaching, root rot, and wasted money."
    },
    "hi": {
        "green": "संतुलित उपयोग: आपका संसाधन उपयोग फसल के आदर्श स्तर के बिल्कुल अनुकूल है।",
        "yellow": "संसाधन चेतावनी: मिट्टी की सेहत बनाए रखने के लिए पानी या उर्वरक 10-15% कम करने पर विचार करें।",
        "red": "अत्यधिक संसाधन चेतावनी: ज्यादा पानी और खाद से पोषक तत्व बह सकते हैं, फसल को नुकसान और पैसे की बर्बादी होगी।"
    },
    "mr": {
        "green": "संतुलित वापर: तुमचा पाण्याचा आणि खताचा वापर पिकाच्या गरजेनुसार अगदी योग्य आहे.",
        "yellow": "संसाधन इशारा: जमिनीचे आरोग्य जपण्यासाठी पाणी किंवा खत 10-15% कमी करण्याचा विचार करा.",
        "red": "अतिवापर इशारा: अति पाणी आणि खतामुळे पिकाचे नुकसान आणि नाहक खर्च होऊ शकतो."
    }
}

def generate_explanation_and_alert(
    crop_type: str,
    soil_moisture: float,
    temperature: float,
    rainfall: float,
    irrigation_mm: float,
    crop_ranges: Dict[str, Any],
    feature_importances: Dict[str, float],
    language: str = "hi"
) -> Tuple[str, str, str]:
    """
    Returns (explanation, alert_level, alert_message)
    Takes feature_importances, input factors, maps to localized templates.
    """
    lang = language.lower() if language and language.lower() in EXPLANATION_TEMPLATES else "hi"
    crop_cfg = crop_ranges.get(crop_type.lower(), {})
    crop_display = CROP_NAMES.get(crop_type.lower(), {}).get(lang, crop_type)

    tmpl = EXPLANATION_TEMPLATES[lang]

    # Calculate input deviance and importance weight
    opt_moist = crop_cfg.get("optimal_moisture_min", 25.0)
    moist_diff = abs(round(soil_moisture - opt_moist, 1))

    candidate_factors = []

    # Moisture factor
    if soil_moisture < opt_moist:
        f_moist = tmpl["moisture_low"].format(val=soil_moisture, diff=moist_diff, crop=crop_display)
    else:
        f_moist = tmpl["moisture_high"].format(val=soil_moisture, diff=moist_diff, crop=crop_display)
    weight_moist = feature_importances.get("soil_moisture", 0.4) * (1.0 + moist_diff / 20.0)
    candidate_factors.append((weight_moist, f_moist))

    # Temperature factor
    opt_temp = crop_cfg.get("optimal_temp_max", 30.0)
    if temperature > opt_temp:
        f_temp = tmpl["temp_high"].format(val=temperature)
    else:
        f_temp = tmpl["temp_normal"].format(val=temperature)
    weight_temp = feature_importances.get("temperature", 0.25) * (1.0 + max(0, temperature - opt_temp) / 10.0)
    candidate_factors.append((weight_temp, f_temp))

    # Rainfall factor
    if rainfall > 15.0:
        f_rain = tmpl["rain_recent"].format(val=rainfall)
    else:
        f_rain = tmpl["rain_dry"].format(val=rainfall)
    weight_rain = feature_importances.get("rainfall", 0.2) * (1.0 + rainfall / 20.0)
    candidate_factors.append((weight_rain, f_rain))

    # Crop specific factor
    f_crop = tmpl["crop_factor"].format(crop=crop_display)
    weight_crop = feature_importances.get(f"crop_{crop_type.lower()}", 0.15)
    candidate_factors.append((weight_crop, f_crop))

    # Sort to pick top 2 factors
    candidate_factors.sort(key=lambda x: x[0], reverse=True)
    factor1 = candidate_factors[0][1]
    factor2 = candidate_factors[1][1]

    explanation = tmpl["sentence"].format(factor1=factor1, factor2=factor2)

    # 5.3 Alert System
    # 🟢 Green: Usage within 10% of optimal
    # 🟡 Yellow: 10–20% above optimal
    # 🔴 Red: >20% above optimal
    irr_max = crop_cfg.get("irrigation_max", 45.0)
    irr_mid = (crop_cfg.get("irrigation_min", 15.0) + irr_max) / 2.0

    if irrigation_mm <= irr_mid * 1.1:
        alert_level = "green"
    elif irrigation_mm <= irr_mid * 1.25:
        alert_level = "yellow"
    else:
        alert_level = "red"

    alert_message = ALERT_TEMPLATES[lang].get(alert_level, ALERT_TEMPLATES["en"][alert_level])

    return explanation, alert_level, alert_message
