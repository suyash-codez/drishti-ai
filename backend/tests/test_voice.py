import pytest
import io
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.voice_parser import extract_fields, parse_number

client = TestClient(app)

def test_parse_number():
    assert parse_number("बाईस") == 22
    assert parse_number("इकतीस") == 31
    assert parse_number("twenty two") == 22
    assert parse_number("100") == 100
    assert parse_number("invalid") is None

def test_extract_fields_hindi():
    transcript = "मेरे खेत में गेहूं है, मिट्टी में नमी बाईस प्रतिशत है, तापमान इकतीस डिग्री है और बारिश चार मिलीमीटर हुई है।"
    res = extract_fields(transcript)
    
    fields = res["extracted_fields"]
    assert fields.get("crop_type") == "wheat"
    assert fields.get("soil_moisture") == 22
    assert fields.get("temperature") == 31
    assert fields.get("rainfall") == 4
    assert len(res["missing_fields"]) == 0

def test_extract_fields_english():
    transcript = "I have a cotton farm. The moisture is 35 percent. Temperature is around 28 degrees and rain was 10 mm."
    res = extract_fields(transcript)
    
    fields = res["extracted_fields"]
    assert fields.get("crop_type") == "cotton"
    assert fields.get("soil_moisture") == 35
    assert fields.get("temperature") == 28
    assert fields.get("rainfall") == 10

def test_extract_fields_missing():
    transcript = "मेरे खेत में धान है, तापमान तीस डिग्री है।"
    res = extract_fields(transcript)
    
    fields = res["extracted_fields"]
    assert fields.get("crop_type") == "rice"
    assert fields.get("temperature") == 30
    assert "soil_moisture" not in fields
    assert "rainfall" not in fields
    assert "soil_moisture" in res["missing_fields"]
    assert "rainfall" in res["missing_fields"]

def test_transcribe_missing_file():
    response = client.post("/voice/transcribe")
    assert response.status_code == 422 # FastAPI built-in validation for missing file

def test_transcribe_invalid_file():
    files = {'file': ('test.txt', b'this is text', 'text/plain')}
    response = client.post("/voice/transcribe", files=files)
    assert response.status_code == 422
    assert "audio" in response.json()["detail"].lower()

def test_speak_empty_text():
    response = client.post("/voice/speak", json={"text": "", "language": "hi"})
    assert response.status_code == 422
    assert "required" in response.json()["detail"].lower()
