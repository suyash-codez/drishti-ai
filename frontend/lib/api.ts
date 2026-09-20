export interface RecommendRequest {
  crop_type: string;
  growth_stage?: string;
  soil_moisture: number;
  temperature: number;
  rainfall: number;
  latitude?: number | null;
  longitude?: number | null;
  language?: string;
}

export interface IrrigationRecommendation {
  amount_mm: number;
  timing: string;
}

export interface FertilizerRecommendation {
  type: string;
  amount_kg_per_acre: number;
}

export interface RecommendResponse {
  irrigation_recommendation: IrrigationRecommendation;
  fertilizer_recommendation: FertilizerRecommendation;
  explanation: string;
  alert_level: "green" | "yellow" | "red";
  alert_message: string;
  water_saved_liters: number;
  cost_saved_rupees: number;
  forecast_note?: string | null;
}

export interface DiseaseDetectionResponse {
  prediction: string;
  confidence: number;
  treatment_suggestion: string;
  note: string;
  prediction_hi?: string;
  prediction_en?: string;
  treatment_hi?: string;
  treatment_en?: string;
  note_hi?: string;
  note_en?: string;
}

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://127.0.0.1:8000";
}

export async function fetchRecommendation(req: RecommendRequest): Promise<RecommendResponse> {
  const res = await fetch(`${getApiBaseUrl()}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let errorDetail = "Failed to fetch recommendation";
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function uploadLeafPhoto(file: File, language: string = "hi"): Promise<DiseaseDetectionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${getApiBaseUrl()}/detect-crop?language=${encodeURIComponent(language)}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = "Failed to analyze leaf image";
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function checkBackendHealth(): Promise<{ status: string; app: string }> {
  const res = await fetch(`${getApiBaseUrl()}/health`);
  if (!res.ok) throw new Error("Backend offline");
  return res.json();
}

export interface TranscribeResponse {
  success: boolean;
  language: string;
  transcript: string;
  extracted_fields: {
    crop_type?: string;
    soil_moisture?: number;
    temperature?: number;
    rainfall?: number;
  };
  missing_fields: string[];
  confidence: Record<string, number>;
}

export async function transcribeAudio(file: Blob, language: string): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const res = await fetch(`${getApiBaseUrl()}/voice/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = "Failed to process voice input";
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function speakText(text: string, language: string): Promise<Blob> {
  const res = await fetch(`${getApiBaseUrl()}/voice/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) {
    let errorDetail = "Failed to synthesize speech";
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.blob();
}

export interface ChatVoiceResponse {
  query: string;
  answer: string;
  action?: "advisory" | "scanner" | "schemes" | "learn" | "fields" | "alerts";
  action_label?: string;
  is_conversational?: boolean;
  extracted_fields?: {
    crop_type?: string;
    soil_moisture?: number;
    temperature?: number;
    rainfall?: number;
  };
}

export async function chatWithVoiceAgent(message: string, language: string = "hi"): Promise<ChatVoiceResponse> {
  const res = await fetch(`${getApiBaseUrl()}/voice/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, language }),
  });

  if (!res.ok) {
    let errorDetail = "Failed to chat with voice agent";
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}
