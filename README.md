# 🌾 DRISHTI AI — Smart Krishi Sahayak
> **"Drishti" (दृष्टि)** means *foresight and vision*. DRISHTI empowers Indian smallholder farmers with forecast-aware precision farming, explainable ML advisories, instant crop disease vision diagnosis, and voice-first vernacular assistance.

[![Live Backend](https://img.shields.io/badge/Render-Backend%20Live-brightgreen.svg)](https://drishti-backend-xm3m.onrender.com/health)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110-009688.svg)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/Vision-PyTorch%20ResNet50-EE4C2C.svg)](https://pytorch.org)
[![Sarvam AI](https://img.shields.io/badge/Voice-Sarvam%20AI%20(Indic)-blueviolet.svg)](https://sarvam.ai)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E.svg)](https://supabase.com)
[![Open-Meteo](https://img.shields.io/badge/Weather-Open--Meteo%2048h-sky.svg)](https://open-meteo.com)

---

## 📌 1. Problem & Innovation

Over 86% of Indian farmers are smallholders without access to expensive soil sensors or agricultural consultants. They rely on guesswork for watering and synthetic fertilizer application, leading to severe groundwater depletion, soil degradation, and high financial losses.

| Capability | DRISHTI AI | Traditional Agri-Apps |
| :--- | :--- | :--- |
| **Hardware Dependency** | **Zero hardware** (Voice, GPS & Camera inputs) | Requires expensive IoT probes ($150+) |
| **Weather Foresight** | **48-Hour Lookahead** (postpones watering/spraying if rain is coming) | Static rulebooks ignoring live weather |
| **Disease Diagnosis** | **Real-time leaf scan** (38+ plant diseases + regional remedies) | Text-based search or delayed human review |
| **Accessibility** | **Voice-first in native tongues** (Hindi / Marathi / English) | Text-heavy forms & English-first UI |
| **Decision Transparency** | **Explainable AI (XAI)** (shows *why* the advice is given) | Black-box outputs with zero explanation |
| **Economic ROI** | Calculates **Liters of water & ₹ saved** per cycle | Vague tips without financial tracking |

---

## 🚀 2. Core Features

- 🌦️ **Forecast-Aware Irrigation & Spraying Guardrails:** Cross-references hyper-local 48h live rain forecasts via Open-Meteo to halt unnecessary watering and prevent expensive chemical runoff.
- 🍃 **Computer Vision Crop Pathology:** Instant deep-learning leaf diagnosis using fine-tuned ResNet-50 across 38+ plant diseases, paired with trusted regional treatments and organic alternatives.
- 🎙️ **Indic Voice AI (Powered by Sarvam AI):** Hands-free voice recognition and speech synthesis tailored for Indian farmers. Speak naturally in Hindi/Marathi to get immediate spoken guidance.
- 🧠 **Explainable Agronomic Intelligence:** Feature-importance attribution explains recommendations in transparent language, bounded by safety ranges to prevent harmful over-application.
- 📊 **Real-Time ROI & Savings Tracker:** Directly quantifies groundwater conserved and monetary savings (₹) on every advisory session.
- 📱 **Clean Mobile-First PWA Interface:** Ultra-responsive dashboard with dark-mode elegance, one-tap city geocoding, and persistent farm history.

---

## 🏗️ 3. System Architecture

```
                               ┌────────────────────────────────┐
                               │   Farmer Interaction (Voice)   │
                               │   • Native Indic Speech Input  │
                               │   • Leaf Photo Upload (Camera) │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           Next.js 16 Client (Vercel)                                    │
│   • Multilingual Toggle (hi / mr / en)    • Auto-GPS Geocoding via Open-Meteo           │
│   • Interactive Recommendation Wizard     • Real-Time ROI & Saved Resource Metrics      │
└──────────────────────────────────────────────┬──────────────────────────────────────────┘
                                               │ HTTP REST
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Microservices (Render)                                │
│                                                                                         │
│  ┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────┐  │
│  │   Voice Engine        │   │   Forecast-Aware ML       │   │   Crop Leaf Vision    │  │
│  │   • Sarvam AI STT/TTS │   │   • Random Forest (Water) │   │   • PyTorch ResNet-50 │  │
│  │   • Query Parsing     │   │   • Random Forest (NPK)   │   │   • 38 Pathology Cls  │  │
│  │   • Conversational AI │   │   • Safety Guardrails     │   │   • Regional Remedies │  │
│  └───────────────────────┘   └─────────────┬─────────────┘   └───────────────────────┘  │
└────────────────────────────────────────────┼────────────────────────────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │   Open-Meteo Weather API     │              │  Supabase Postgres Database  │
       │   48h Precipitation & Radar  │              │  Session Logs & Farm History │
       └──────────────────────────────┘              └──────────────────────────────┘
```

---

## 🛠️ 4. Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, Lucide Icons.
- **Backend:** FastAPI (Python 3.11), Uvicorn, Pydantic v2.
- **Machine Learning & Vision:** Scikit-Learn (Random Forest Regressor & Classifier), PyTorch & Torchvision (ResNet-50).
- **Indic Voice AI:** Sarvam AI Speech-to-Text (`saaras:v1`) & Text-to-Speech (`bulbul:v1`).
- **Cloud & Deployment:** Render (Backend API), Vercel (Frontend UI), Supabase (PostgreSQL Database).
- **Weather Telemetry:** Open-Meteo Geocoding & Hyper-Local Weather APIs.

---

## 📡 5. Key API Endpoints

### `GET /health`
Returns live system health.
```json
{"status": "ok", "app": "DRISHTI"}
```

### `POST /recommend`
Evaluates soil, crop, and 48-hour live precipitation to output precision irrigation, fertilizer dosage, explanation, and economic savings.

**Request:**
```json
{
  "crop_type": "wheat",
  "soil_moisture": 22.5,
  "temperature": 31.0,
  "rainfall": 4.0,
  "latitude": 22.71,
  "longitude": 75.86,
  "language": "hi"
}
```

**Response:**
```json
{
  "irrigation_recommendation": {
    "amount_mm": 42.4,
    "timing": "48 घंटे के लिए टालें (बारिश की संभावना)"
  },
  "fertilizer_recommendation": {
    "type": "Urea",
    "amount_kg_per_acre": 27.5
  },
  "explanation": "सलाह मुख्य रूप से इन दो कारणों पर आधारित है: मिट्टी की नमी तथा अधिक तापमान।",
  "alert_level": "yellow",
  "alert_message": "मध्यम संसाधन स्तर: संतुलित सिंचाई और पोषक तत्व प्रबंधन बनाए रखें।",
  "water_saved_liters": 1320.0,
  "cost_saved_rupees": 145.0,
  "forecast_note": "Moderate rain (~11.1 mm) expected in next 48 hours — postponing recommended."
}
```

### `POST /detect-crop`
Accepts a multipart leaf image and returns the disease diagnosis, confidence score, and tailored regional treatment plan.

### `POST /voice/chat`
Conversational Indic Krishi assistant that answers farming queries, parses crop parameters, and suggests actionable next steps.

### `POST /voice/transcribe` & `POST /voice/speak`
High-speed speech-to-text and natural voice audio playback for zero-literacy farmers.

---

## ⚡ 6. Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Run Backend
```bash
# Clone the repository
git clone https://github.com/suyash-codez/drishti-ai.git
cd drishti-ai

# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at: `http://127.0.0.1:8000` (Swagger docs: `http://127.0.0.1:8000/docs`)*

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:3000`*

---

## 🌍 7. Impact & Sustainability

- **Groundwater Preservation:** Eliminates unnecessary flood irrigation cycles, conserving 20–35% of water per acre.
- **Soil Regeneration:** Regulated NPK recommendations prevent chemical runoffs and soil salinity buildup.
- **Farmer Prosperity (UN SDGs 1, 2, 6, 12, 13):** Saves ₹4,000–₹6,000 per acre annually, helping lift marginal farm families out of seasonal debt traps.

---

## 👥 8. Team Hyphen_OG
Developed with ❤️ for **Hack Indore 4.0** (SGSITS / SARTHI / IIC).
