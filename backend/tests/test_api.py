import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json().get("status") == "ok"

def test_recommend_endpoint():
    payload = {
        "crop_type": "wheat",
        "soil_moisture": 22.5,
        "temperature": 31.0,
        "rainfall": 4.0,
        "latitude": 22.71,
        "longitude": 75.86,
        "language": "hi"
    }
    res = client.post("/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "irrigation_recommendation" in data
    assert "fertilizer_recommendation" in data
    assert "explanation" in data
    assert data["alert_level"] in ["green", "yellow", "red"]

def test_recommend_invalid_crop():
    payload = {
        "crop_type": "invalid_crop_xyz",
        "soil_moisture": 20.0,
        "temperature": 25.0,
        "rainfall": 5.0
    }
    res = client.post("/recommend", json=payload)
    assert res.status_code == 422

def test_detect_crop_leaf():
    dummy_img = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4")
    files = {"file": ("test_leaf.png", dummy_img, "image/png")}
    res = client.post("/detect-crop", files=files)
    assert res.status_code == 200
    data = res.json()
    assert "prediction" in data
    assert "confidence" in data

def test_detect_crop_invalid_file():
    text_file = io.BytesIO(b"this is plain text, not an image")
    files = {"file": ("notes.txt", text_file, "text/plain")}
    res = client.post("/detect-crop", files=files)
    assert res.status_code == 422

def test_voice_chat_conversational():
    res = client.post("/voice/chat", json={"message": "गेहूं की खेती कैसे करें?", "language": "hi"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "गेहूं" in data["answer"] or "सिंचाई" in data["answer"]
    assert data.get("is_conversational") is True

def test_voice_chat_feature_redirect():
    res = client.post("/voice/chat", json={"message": "पत्ता रोग स्कैनर खोलो", "language": "hi"})
    assert res.status_code == 200
    data = res.json()
    assert data.get("action") == "scanner"
    assert "स्कैनर" in data.get("action_label", "")

def test_voice_chat_schemes_redirect():
    res = client.post("/voice/chat", json={"message": "ड्रिप सिंचाई सब्सिडी योजना बताओ", "language": "hi"})
    assert res.status_code == 200
    data = res.json()
    assert data.get("action") == "schemes"
    assert "सब्सिडी" in data.get("answer", "") or "योजना" in data.get("answer", "")
