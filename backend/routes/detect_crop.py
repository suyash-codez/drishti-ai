import io
import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from PIL import Image
import torch
import torchvision.transforms as transforms
from transformers import AutoModelForImageClassification

router = APIRouter(tags=["vision-prototype"])

MODEL_ID = "mesabo/agri-plant-disease-resnet50"

class DiseaseDetectionResponse(BaseModel):
    prediction: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    inference_time_ms: float
    note: str = "V1 prototype — pretrained model, not fine-tuned on India-specific imagery"
    treatment_suggestion: Optional[str] = None
    prediction_hi: Optional[str] = None
    prediction_en: Optional[str] = None
    treatment_hi: Optional[str] = None
    treatment_en: Optional[str] = None
    note_hi: Optional[str] = None
    note_en: Optional[str] = None

# Preprocessing pipeline for ResNet-50
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Common Hindi mappings for 38 plant pathology classes
HINDI_CLASS_NAMES = {
    "Apple___Apple_scab": "सेब — स्कैब रोग (Apple Scab)",
    "Apple___Black_rot": "सेब — काला सड़न रोग (Black Rot)",
    "Apple___Cedar_apple_rust": "सेब — जंग रोग (Cedar Apple Rust)",
    "Apple___healthy": "सेब — स्वस्थ पत्ता (Healthy)",
    "Blueberry___healthy": "ब्लूबेरी — स्वस्थ पत्ता (Healthy)",
    "Cherry_(including_sour)___Powdery_mildew": "चेरी — चूर्णिल फफूंद (Powdery Mildew)",
    "Cherry_(including_sour)___healthy": "चेरी — स्वस्थ पत्ता (Healthy)",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "मक्का — सर्कोस्पोरा पत्ती धब्बा रोग",
    "Corn_(maize)___Common_rust_": "मक्का — सामान्य रस्ट / जंग रोग",
    "Corn_(maize)___Northern_Leaf_Blight": "मक्का — उत्तरी लीफ ब्लाइट झुलसा रोग",
    "Corn_(maize)___healthy": "मक्का — स्वस्थ पत्ता (Healthy)",
    "Grape___Black_rot": "अंगूर — ब्लैक रॉट सड़न रोग",
    "Grape___Esca_(Black_Measles)": "अंगूर — एस्का रोग (Black Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "अंगूर — लीफ ब्लाइट धब्बा रोग",
    "Grape___healthy": "अंगूर — स्वस्थ पत्ता (Healthy)",
    "Orange___Haunglongbing_(Citrus_greening)": "संतरा — साइट्रस ग्रीनिंग रोग",
    "Peach___Bacterial_spot": "आड़ू — जीवाणु धब्बा रोग (Bacterial Spot)",
    "Peach___healthy": "आड़ू — स्वस्थ पत्ता (Healthy)",
    "Pepper,_bell___Bacterial_spot": "शिमला मिर्च — जीवाणु पत्ती धब्बा",
    "Pepper,_bell___healthy": "शिमला मिर्च — स्वस्थ पत्ता (Healthy)",
    "Potato___Early_blight": "आलू — अगेती झुलसा (Early Blight)",
    "Potato___Late_blight": "आलू — पछेती झुलसा (Late Blight)",
    "Potato___healthy": "आलू — स्वस्थ पत्ता (Healthy)",
    "Raspberry___healthy": "रसभरी — स्वस्थ पत्ता (Healthy)",
    "Soybean___healthy": "सोयाबीन — स्वस्थ पत्ता (Healthy)",
    "Squash___Powdery_mildew": "कद्दू / स्क्वैश — चूर्णिल फफूंद",
    "Strawberry___Leaf_scorch": "स्ट्रॉबेरी — लीफ स्कॉर्च (पत्ती झुलसन)",
    "Strawberry___healthy": "स्ट्रॉबेरी — स्वस्थ पत्ता (Healthy)",
    "Tomato___Bacterial_spot": "टमाटर — जीवाणु धब्बा रोग (Bacterial Spot)",
    "Tomato___Early_blight": "टमाटर — अगेती झुलसा (Early Blight)",
    "Tomato___Late_blight": "टमाटर — पछेती झुलसा (Late Blight)",
    "Tomato___Leaf_Mold": "टमाटर — लीफ मोल्ड फफूंद",
    "Tomato___Septoria_leaf_spot": "टमाटर — सेप्टोरिया पत्ती धब्बा रोग",
    "Tomato___Spider_mites Two-spotted_spider_mite": "टमाटर — दो-धब्बे वाली लाल मकड़ी",
    "Tomato___Target_Spot": "टमाटर — टारगेट स्पॉट रोग",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "टमाटर — लीफ कर्ल पर्ण कुंचन वायरस",
    "Tomato___Tomato_mosaic_virus": "टमाटर — मोज़ेक वायरस रोग",
    "Tomato___healthy": "टमाटर — स्वस्थ पत्ता (Healthy)",
}

# Load model once at startup
print(f"[detect_crop] Loading model {MODEL_ID}...")
try:
    model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
    model.eval()

    # Quick warmup inference
    _dummy = Image.new("RGB", (224, 224), color=(100, 150, 50))
    _tensor = transform(_dummy).unsqueeze(0)
    with torch.no_grad():
        _ = model(_tensor)
    print(f"[detect_crop] Model {MODEL_ID} loaded and warmed up successfully.")
except Exception as e:
    print(f"[detect_crop] Warning: Error loading model {MODEL_ID}: {e}")
    model = None

@router.post("/detect-crop", response_model=DiseaseDetectionResponse)
async def detect_crop_disease(
    file: UploadFile = File(...),
    language: Optional[str] = "hi"
):
    # 1. Validate file content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid file type '{file.content_type}'. Please upload an image file (JPEG, PNG, WEBP)."
        )

    # 2. Read and validate content bytes
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read uploaded file: {str(e)}")

    if len(content) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    # 3. Decode image with PIL
    try:
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Cannot decode file as an image: {str(e)}"
        )

    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model is not initialized."
        )

    # 4. Preprocess
    img_tensor = transform(image).unsqueeze(0)

    # 5. Measure inference time
    start_time = time.time()
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs.logits, dim=1)[0]
        top_idx = torch.argmax(probs).item()
        confidence = round(float(probs[top_idx].item()), 4)

    inference_time_ms = round((time.time() - start_time) * 1000, 2)
    prediction = model.config.id2label.get(top_idx, str(top_idx))

    # Clean label formatting
    clean_label_en = prediction.replace("___", " - ").replace("_", " ")
    clean_label_hi = HINDI_CLASS_NAMES.get(prediction, clean_label_en)

    is_healthy = "healthy" in prediction.lower()
    if is_healthy:
        treatment_en = "Crop foliage appears healthy. Continue scheduled irrigation and balanced nutrition."
        treatment_hi = "फसल की पत्ती स्वस्थ दिख रही है। निर्धारित सिंचाई और संतुलित पोषण जारी रखें।"
    else:
        treatment_en = f"Symptoms indicate {clean_label_en}. Isolate affected foliage and consult local Krishi Vigyan Kendra (KVK) for certified fungicide/pesticide dosage."
        treatment_hi = f"लक्षण {clean_label_hi} दर्शाते हैं। प्रभावित पत्तियों को अलग करें और प्रमाणित दवा/कीटनाशक खुराक के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"

    note_en = "V1 prototype — pretrained model, not fine-tuned on India-specific imagery"
    note_hi = "V1 प्रोटोटाइप — प्रीट्रेन्ड मॉडल, भारतीय कृषि छवियों पर फाइन-ट्यून नहीं है"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "inference_time_ms": inference_time_ms,
        "note": note_en,
        "treatment_suggestion": treatment_en if language == "en" else treatment_hi,
        "prediction_en": clean_label_en,
        "prediction_hi": clean_label_hi,
        "treatment_en": treatment_en,
        "treatment_hi": treatment_hi,
        "note_en": note_en,
        "note_hi": note_hi,
    }
