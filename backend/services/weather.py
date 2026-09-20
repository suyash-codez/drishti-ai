import requests
from typing import Optional, Tuple

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def get_forecast_48h(latitude: Optional[float], longitude: Optional[float], language: str = "hi") -> Tuple[Optional[float], Optional[str]]:
    """
    Fetches 48-72h rainfall lookahead from Open-Meteo API.
    Returns (precipitation_sum_48h, forecast_note).
    Falls back gracefully if lat/lon is missing or API fails.
    """
    if latitude is None or longitude is None:
        return None, None

    lang = (language or "hi").lower()

    try:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": ["precipitation_sum"],
            "forecast_days": 3,
            "timezone": "auto"
        }
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=3.0)
        if resp.status_code != 200:
            return None, None

        data = resp.json()
        daily = data.get("daily", {})
        precip_list = daily.get("precipitation_sum", [])
        
        if not precip_list:
            return 0.0, None

        # Next 48 hours is approximately day 1 + day 2 (or day 0 + day 1)
        rain_48h = sum(precip_list[:2]) if len(precip_list) >= 2 else sum(precip_list)
        rain_48h = round(float(rain_48h), 1)

        forecast_note = None
        if rain_48h >= 10.0:
            if lang == "hi":
                forecast_note = f"अगले 48 घंटों में भारी बारिश (~{rain_48h} मिमी) की संभावना है — जलभराव और उर्वरक बहने से बचने के लिए सिंचाई टालें।"
            elif lang == "mr":
                forecast_note = f"पुढील 48 तासांत मुसळधार पाऊस (~{rain_48h} मिमी) अपेक्षित आहे — पाणी साचणे टाळण्यासाठी सिंचन पुढे ढकला."
            else:
                forecast_note = f"Heavy rain (~{rain_48h} mm) expected within 48 hours — delay irrigation to avoid waterlogging and runoff."
        elif rain_48h >= 3.0:
            if lang == "hi":
                forecast_note = f"अगले 48 घंटों में मध्यम बारिश (~{rain_48h} मिमी) का अनुमान है — सिंचाई कुछ समय के लिए टालने पर विचार करें।"
            elif lang == "mr":
                forecast_note = f"पुढील 48 तासांत मध्यम पाऊस (~{rain_48h} मिमी) अपेक्षित आहे — सिंचन पुढे ढकलण्याचा विचार करा."
            else:
                forecast_note = f"Moderate rain (~{rain_48h} mm) expected in next 48 hours — consider postponing irrigation."
        elif rain_48h > 0.0:
            if lang == "hi":
                forecast_note = f"हल्की बारिश (~{rain_48h} मिमी) की संभावना — सामान्य सिंचाई नियम लागू होता है।"
            elif lang == "mr":
                forecast_note = f"हलका पाऊस (~{rain_48h} मिमी) अपेक्षित — नियमित सिंचन वेळापत्रक पाळा."
            else:
                forecast_note = f"Light rain (~{rain_48h} mm) forecast — standard irrigation schedule applies."
        else:
            if lang == "hi":
                forecast_note = "अगले 48 घंटों में मौसम साफ रहेगा — अनुशंसित सिंचाई जारी रखें।"
            elif lang == "mr":
                forecast_note = "पुढील 48 तास हवामान कोरडे राहील — शिफारस केलेले सिंचन करा."
            else:
                forecast_note = "Clear weather forecast for next 48 hours — proceed with recommended irrigation."

        return rain_48h, forecast_note
    except Exception as e:
        # Graceful fallback: return None, don't crash
        return None, None
