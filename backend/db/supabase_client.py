import os
import requests
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("drishti.db")

def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip()
                    if k not in os.environ:
                        os.environ[k] = v

load_env_file()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

# Local in-memory session log fallback for hackathon demos/evaluations
LOCAL_FARM_SESSIONS = []


def log_farm_session(session_data: Dict[str, Any]) -> bool:
    """
    Logs farm recommendation session to Supabase Postgres `farm_sessions` table.
    Gracefully logs locally if Supabase credentials are not provided or network fails.
    """
    # Always keep in local session cache
    LOCAL_FARM_SESSIONS.append(session_data)
    
    url = os.getenv("SUPABASE_URL", SUPABASE_URL).rstrip("/")
    key = os.getenv("SUPABASE_KEY", SUPABASE_KEY)

    if not url or not key or "your-project" in url:
        logger.info("Supabase credentials not configured. Session saved to local in-memory log.")
        return True

    table_url = f"{url}/rest/v1/farm_sessions"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    payload = {
        "crop_type": str(session_data.get("crop_type", "")),
        "soil_moisture": float(session_data.get("soil_moisture", 0.0)),
        "temperature": float(session_data.get("temperature", 0.0)),
        "rainfall": float(session_data.get("rainfall", 0.0)),
        "language": str(session_data.get("language", "hi")),
        "irrigation_recommendation": json.dumps(session_data.get("irrigation_recommendation", {})),
        "fertilizer_recommendation": json.dumps(session_data.get("fertilizer_recommendation", {})),
        "explanation": str(session_data.get("explanation", "")),
        "alert_level": str(session_data.get("alert_level", "")),
        "water_saved_liters": float(session_data.get("water_saved_liters", 0.0)),
        "cost_saved_rupees": float(session_data.get("cost_saved_rupees", 0.0))
    }

    try:
        res = requests.post(table_url, json=payload, headers=headers, timeout=3.0)
        if res.status_code in [200, 201]:
            logger.info("Successfully logged session to Supabase farm_sessions.")
            return True
        else:
            logger.warning(f"Supabase logging returned status {res.status_code}: {res.text}")
            return False
    except Exception as e:
        logger.warning(f"Supabase logging network exception: {e}. Graceful fallback active.")
        return False

def get_recent_sessions():
    return LOCAL_FARM_SESSIONS[-50:]
