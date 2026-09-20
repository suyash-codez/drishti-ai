import io
import sys
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

sys.stdout.reconfigure(encoding="utf-8")
client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    print("PASS: /health returned 200 OK:", data)

def test_detect_crop_valid_image():
    # Create synthetic test leaf image in memory (RGB)
    img = Image.new("RGB", (300, 300), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_leaf.jpg", buf, "image/jpeg")}
    response = client.post("/detect-crop", files=files)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    print("PASS: /detect-crop returned 200 OK:", data)
    
    assert "prediction" in data, "Missing prediction field"
    assert "confidence" in data, "Missing confidence field"
    assert "inference_time_ms" in data, "Missing inference_time_ms field"
    assert "note" in data, "Missing note field"
    assert 0.0 <= data["confidence"] <= 1.0, "Confidence out of range"
    assert data["inference_time_ms"] > 0, "Inference time must be positive"
    print(f"Prediction: {data['prediction']}, Confidence: {data['confidence']}, Time: {data['inference_time_ms']}ms")

def test_detect_crop_invalid_file():
    # Non-image file (plain text)
    txt_content = b"This is not an image file"
    files = {"file": ("notes.txt", io.BytesIO(txt_content), "text/plain")}
    response = client.post("/detect-crop", files=files)
    assert response.status_code == 422, f"Expected 422 for non-image, got {response.status_code}"
    print("PASS: /detect-crop invalid file returned 422:", response.json())

def test_detect_crop_empty_file():
    files = {"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")}
    response = client.post("/detect-crop", files=files)
    assert response.status_code == 422, f"Expected 422 for empty file, got {response.status_code}"
    print("PASS: /detect-crop empty file returned 422:", response.json())

if __name__ == "__main__":
    test_health()
    test_detect_crop_valid_image()
    test_detect_crop_invalid_file()
    test_detect_crop_empty_file()
    print("\nALL DETECT CROP INTEGRATION TESTS PASSED SUCCESSFULLY!")
