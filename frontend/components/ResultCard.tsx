"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronLeft, 
  Droplets, 
  Sprout, 
  Share2, 
  Download, 
  Calendar, 
  IndianRupee, 
  ShieldCheck, 
  HelpCircle, 
  MapPin, 
  CloudRain, 
  Clock, 
  Sparkles, 
  Thermometer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Loader2
} from "lucide-react";
import { RecommendResponse, speakText } from "../lib/api";

interface ResultCardProps {
  data: RecommendResponse;
  cropName: string;
  labels: Record<string, string>;
  currentLanguage?: string;
  onBack: () => void;
}

const CROP_NAMES: Record<string, { hi: string; en: string; mr: string }> = {
  wheat: { hi: "गेहूं", en: "Wheat", mr: "गहू" },
  rice: { hi: "धान (चावल)", en: "Rice", mr: "भात / तांदूळ" },
  maize: { hi: "मक्का", en: "Maize", mr: "मका" },
  soybean: { hi: "सोयाबीन", en: "Soybean", mr: "सोयाबीन" },
  cotton: { hi: "कपास", en: "Cotton", mr: "कापूस" },
  sugarcane: { hi: "गन्ना", en: "Sugarcane", mr: "ऊस" },
  mustard: { hi: "सरसों", en: "Mustard", mr: "मोहरी" },
  gram: { hi: "चना", en: "Chickpea (Chana)", mr: "हरभरा" },
  potato: { hi: "आलू", en: "Potato", mr: "बटाटा" },
  tomato: { hi: "टमाटर", en: "Tomato", mr: "टोमॅटो" },
  onion: { hi: "प्याज", en: "Onion", mr: "कांदा" },
  bajra: { hi: "बाजरा", en: "Pearl Millet", mr: "बाजरी" },
  groundnut: { hi: "मूंगफली", en: "Groundnut", mr: "भुईमूग" },
};

const FERTILIZER_NAMES: Record<string, { hi: string; en: string; mr: string }> = {
  urea: { hi: "यूरिया (Urea)", en: "Urea", mr: "युरिया (Urea)" },
  dap: { hi: "डीएपी (DAP)", en: "DAP", mr: "डीएपी (DAP)" },
  npk: { hi: "एनपीके (NPK)", en: "NPK", mr: "एनपीके (NPK)" },
  mop: { hi: "एमओपी (पोटाश)", en: "MOP (Potash)", mr: "एमओपी (पोटॅश)" },
  ssp: { hi: "एसएसपी (SSP)", en: "SSP", mr: "एसएसपी (SSP)" },
};

export const ResultCard: React.FC<ResultCardProps> = ({ 
  data, 
  cropName, 
  currentLanguage = "hi", 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<"irrigation" | "fertilizer">("irrigation");
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getLocalizedCropName = (crop: string) => {
    const key = crop.toLowerCase();
    const entry = CROP_NAMES[key];
    if (entry) {
      return currentLanguage === "en" ? entry.en : currentLanguage === "mr" ? entry.mr : entry.hi;
    }
    return crop;
  };

  const getLocalizedFertilizerName = (fert: string) => {
    const key = fert.toLowerCase().trim();
    const entry = FERTILIZER_NAMES[key];
    if (entry) {
      return currentLanguage === "en" ? entry.en : currentLanguage === "mr" ? entry.mr : entry.hi;
    }
    return fert;
  };

  const localizedCrop = getLocalizedCropName(cropName);
  const localizedFertilizer = getLocalizedFertilizerName(data.fertilizer_recommendation.type);

  // Status mapping
  const statusColor = data.alert_level === "red" ? "bg-red-100 text-red-700" : 
                      data.alert_level === "yellow" ? "bg-yellow-100 text-yellow-700" : 
                      "bg-green-100 text-[#1B7A3D]";
  
  const statusText = data.alert_level === "red" 
    ? (currentLanguage === "en" ? "Critical" : "अत्यंत आवश्यक") 
    : data.alert_level === "yellow" 
    ? (currentLanguage === "en" ? "Warning" : "सावधानी") 
    : (currentLanguage === "en" ? "Optimal" : "अनुकूल");

  // Parse Explanation into bullets
  const explanationBullets = data.explanation.split(/(?<=[.।])\s+/).filter(s => s.trim().length > 0);

  // Download PDF Report function
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DRISHTI_Advisory_${cropName}_${new Date().toISOString().split('T')[0]}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1f2937; margin: 0; padding: 32px; background: #fff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1B7A3D; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 800; color: #1B7A3D; margin: 0; }
            .tagline { font-size: 12px; color: #6b7280; margin: 2px 0 0 0; }
            .meta { text-align: right; font-size: 12px; color: #4b5563; }
            .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 18px; }
            .card-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
            .metric-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; }
            .metric-val { font-size: 24px; font-weight: 800; color: #15803d; }
            .metric-lbl { font-size: 12px; color: #4b5563; font-weight: 600; margin-top: 4px; }
            .rec-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; font-size: 14px; }
            .rec-row:last-child { border-bottom: none; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #15803d; }
            .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
            @media print {
              body { padding: 16px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand">🌾 DRISHTI</h1>
              <p class="tagline">Sustainable Precision Agriculture Advisory Report</p>
            </div>
            <div class="meta">
              <p style="margin: 0; font-weight: 700;">Farmer: Ram Kishan (राम किशन)</p>
              <p style="margin: 2px 0;">Location: Indore, Madhya Pradesh</p>
              <p style="margin: 2px 0;">Date: ${new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="grid">
            <div class="metric-box">
              <div class="card-title" style="color: #15803d;">💧 Irrigation Prescription (सिंचाई सलाह)</div>
              <div class="metric-val">${data.irrigation_recommendation.amount_mm} mm</div>
              <div class="metric-lbl">Timing: ${data.irrigation_recommendation.timing}</div>
            </div>
            <div class="metric-box" style="background: #fdfaf0; border-color: #fef08a;">
              <div class="card-title" style="color: #854d0e;">🌱 Fertilizer Prescription (खाद मात्रा)</div>
              <div class="metric-val" style="color: #854d0e;">${data.fertilizer_recommendation.type}</div>
              <div class="metric-lbl">${data.fertilizer_recommendation.amount_kg_per_acre} kg per acre</div>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">Crop & Field Summary</h3>
            <div class="rec-row">
              <span>Target Crop:</span>
              <span style="font-weight: 700; text-transform: capitalize;">${localizedCrop} (${cropName})</span>
            </div>
            <div class="rec-row">
              <span>Safety & Guardrail Status:</span>
              <span class="badge">Verified Safe for ${localizedCrop}</span>
            </div>
            <div class="rec-row">
              <span>Estimated Cost Savings:</span>
              <span style="font-weight: 700; color: #15803d;">₹ ${data.cost_saved_rupees} per hectare</span>
            </div>
            <div class="rec-row">
              <span>Water Conserved:</span>
              <span style="font-weight: 700; color: #2563eb;">${data.water_saved_liters.toLocaleString()} Liters</span>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">Agronomic Explanation & Logic</h3>
            <p style="font-size: 13px; line-height: 1.6; color: #374151; margin: 0;">
              ${data.explanation}
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">Generated by DRISHTI AI Engine (Sarvam Voice + Multilingual Agronomy Engine) • For a Greener Tomorrow</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  // Share Result function
  const handleShareResult = async () => {
    const shareText = `🌾 DRISHTI Farm Advisory for ${localizedCrop.toUpperCase()}\n\n` +
      `💧 Irrigation: ${data.irrigation_recommendation.amount_mm} mm (${data.irrigation_recommendation.timing})\n` +
      `🌱 Fertilizer: ${data.fertilizer_recommendation.type} (${data.fertilizer_recommendation.amount_kg_per_acre} kg/acre)\n` +
      `💰 Savings: ₹${data.cost_saved_rupees}/ha | Water Saved: ${data.water_saved_liters}L\n\n` +
      `Generated by DRISHTI Sustainable Agriculture Assistant.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `DRISHTI Farm Advisory - ${localizedCrop}`,
          text: shareText,
        });
      } catch (e) {
        console.log("Share cancelled or failed", e);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setToastMessage(currentLanguage === "en" ? "Report copied to clipboard!" : "रिपोर्ट कॉपी हो गई!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Playback / TTS function
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    // Spoken advisory script
    const spokenText = currentLanguage === "en"
      ? `Here is your crop advisory for ${cropName}. ` +
        `For irrigation, apply ${data.irrigation_recommendation.amount_mm} millimeters of water. Best timing is: ${data.irrigation_recommendation.timing}. ` +
        `For fertilizer, apply ${data.fertilizer_recommendation.amount_kg_per_acre} kilograms per acre of ${data.fertilizer_recommendation.type}. ` +
        `Summary: ${data.explanation}. Estimated cost savings: ${data.cost_saved_rupees} rupees.`
      : `${localizedCrop} के लिए आपकी कृषि सलाह: ` +
        `सिंचाई के लिए ${data.irrigation_recommendation.amount_mm} मिलीमीटर पानी दें। सही समय है: ${data.irrigation_recommendation.timing}। ` +
        `खाद के लिए प्रति एकड़ ${data.fertilizer_recommendation.amount_kg_per_acre} किलो ${data.fertilizer_recommendation.type} डालें। ` +
        `${data.explanation}। अनुमानित लागत बचत: ${data.cost_saved_rupees} रुपए।`;

    setIsLoadingAudio(true);

    try {
      // 1. Fetch audio from backend Sarvam TTS
      const blob = await speakText(spokenText, currentLanguage);
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
      };
      audio.onerror = () => {
        fallbackSpeech(spokenText);
      };

      await audio.play();
      setIsPlayingAudio(true);
    } catch (err) {
      console.warn("Sarvam TTS request failed, using browser Web Speech synthesis", err);
      fallbackSpeech(spokenText);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const fallbackSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setToastMessage("Audio not supported / आवाज़ समर्थित नहीं है");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === "hi" ? "hi-IN" : currentLanguage === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 0.92;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F4F7F5] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center p-4 bg-white sticky top-0 z-10 border-b border-gray-100 shadow-xs">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg ml-2">
          {currentLanguage === "en" ? "Your Recommendation" : "आपकी सलाह"}
        </h1>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Top Crop Info Card */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-xl shadow-inner">
              🌾
            </div>
            <div>
              <h2 className="font-bold text-gray-900 capitalize text-base">{localizedCrop}</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                {currentLanguage === "en" ? "Based on your field data" : "आपके खेत के आंकड़ों के आधार पर"}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${statusColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${data.alert_level === 'red' ? 'bg-red-500' : data.alert_level === 'yellow' ? 'bg-yellow-500' : 'bg-[#1B7A3D]'}`} />
            {statusText}
          </div>
        </div>

        {/* Audio Advisory Voice Player Bar */}
        <div className="bg-gradient-to-r from-emerald-50 via-green-50/80 to-emerald-50 rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isPlayingAudio ? "bg-[#1B7A3D] text-white animate-pulse" : "bg-white text-[#1B7A3D] shadow-xs"
            }`}>
              {isLoadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlayingAudio ? (
                <Volume2 className="w-5 h-5 animate-bounce" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 pr-2">
              <h3 className="font-bold text-gray-900 text-[14px] leading-tight flex items-center gap-1.5">
                {currentLanguage === "en" ? "Listen to Advisory" : "सलाह बोलकर सुनें"}
                <span className="px-1.5 py-0.5 rounded-full bg-[#1B7A3D] text-white text-[9px] font-bold uppercase tracking-wider">
                  AI Voice
                </span>
              </h3>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5 truncate">
                {isPlayingAudio
                  ? (currentLanguage === "en" ? "Playing audio..." : "सलाह चल रही है...")
                  : (currentLanguage === "en" ? "Tap to listen in English" : "सरवम AI आवाज़ में पूरी सलाह सुनें")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAudio}
            disabled={isLoadingAudio}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md active:scale-95 ${
              isPlayingAudio
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                : "bg-[#1B7A3D] hover:bg-[#156030] text-white shadow-green-900/20"
            }`}
            title={isPlayingAudio ? "Stop Audio" : "Play Audio"}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlayingAudio ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm">
          <button 
            onClick={() => setActiveTab("irrigation")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${activeTab === "irrigation" ? "bg-[#1B7A3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Droplets className={`w-4 h-4 ${activeTab === "irrigation" ? "fill-white" : ""}`} />
            {currentLanguage === "en" ? "Irrigation" : "सिंचाई"}
          </button>
          <button 
            onClick={() => setActiveTab("fertilizer")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${activeTab === "fertilizer" ? "bg-[#1B7A3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Sprout className="w-4 h-4" />
            {currentLanguage === "en" ? "Fertilizer" : "खाद व पोषण"}
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-5 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${activeTab === "irrigation" ? "bg-blue-400" : "bg-green-400"}`} />

          {activeTab === "irrigation" ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 relative z-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Droplets className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">
                    {currentLanguage === "en" ? "Irrigation Recommendation" : "अनुशंसित सिंचाई मात्रा"}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">{data.irrigation_recommendation.amount_mm}</span>
                    <span className="text-lg font-bold text-gray-600">mm ({currentLanguage === "en" ? "mm" : "मिमी"})</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-1">
                    {currentLanguage === "en"
                      ? `(About ${(data.irrigation_recommendation.amount_mm * 10000).toLocaleString()} liters per hectare)`
                      : `(लगभग ${(data.irrigation_recommendation.amount_mm * 10000).toLocaleString()} लीटर प्रति हेक्टेयर)`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 border-t border-gray-100 pt-4">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-blue-900">
                    {currentLanguage === "en" ? "Best time: " : "सही समय: "}
                    <span className="font-semibold text-blue-800">
                      {data.irrigation_recommendation.timing}
                    </span>
                  </p>
                </div>
              </div>

              {data.forecast_note && (
                <div className="mt-4 bg-blue-50/50 rounded-2xl p-4 text-[13px] text-blue-900/80 leading-relaxed font-medium">
                  {data.forecast_note}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E5F3E9] flex items-center justify-center shrink-0">
                  <Sprout className="w-6 h-6 text-[#1B7A3D]" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">
                    {currentLanguage === "en" ? "Recommended Fertilizer" : "अनुशंसित खाद व पोषण"}
                  </p>
                  <div className="text-2xl font-black text-gray-900 leading-tight">
                    {localizedFertilizer}
                  </div>
                  <p className="text-[13px] font-bold text-gray-600 mt-1">
                    {currentLanguage === "en" 
                      ? `${data.fertilizer_recommendation.amount_kg_per_acre} kg per acre` 
                      : `${data.fertilizer_recommendation.amount_kg_per_acre} किलो प्रति एकड़`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 border-t border-gray-100 pt-4">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-0.5">
                    {currentLanguage === "en" ? "Application Time" : "खाद देने का सही समय"}
                  </p>
                  <p className="text-[14px] font-bold text-gray-900">
                    {currentLanguage === "en" ? "Within next 7 days" : "अगले 7 दिनों के भीतर"}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-blue-50/50 rounded-2xl p-4 text-[13px] text-blue-900/80 leading-relaxed font-medium">
                {currentLanguage === "en" 
                  ? "Apply after light irrigation for better absorption and to prevent fertilizer burn." 
                  : "बेहतर अवशोषण और फसल सुरक्षा के लिए हल्की सिंचाई के बाद खाद डालें।"}
              </div>

              <div className="mt-4 bg-[#F2F9F4] rounded-2xl p-4 flex gap-3 border border-[#E5F3E9]">
                <ShieldCheck className="w-5 h-5 text-[#1B7A3D] shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-[#1B7A3D] mb-0.5">
                    {currentLanguage === "en" ? "Safety Check" : "फसल सुरक्षा जांच (Safety Check)"}
                  </p>
                  <p className="text-[12px] text-gray-700 font-medium">
                    {currentLanguage === "en" 
                      ? `Recommended dose is within the safe range for ${localizedCrop}.` 
                      : `अनुशंसित मात्रा ${localizedCrop} के लिए पूर्णतः सुरक्षित सीमा में है।`}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Why This Recommendation Button */}
          <button 
            onClick={() => setShowWhyModal(true)}
            className="w-full mt-2 py-3 rounded-xl border border-gray-200 text-[#1B7A3D] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            {currentLanguage === "en" ? "Why This Recommendation?" : "यह सलाह क्यों दी गई? (वैज्ञानिक कारण)"}
          </button>
        </div>

        {/* Bottom Savings Cards (Side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <IndianRupee className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-1.5 mb-1 text-gray-500">
              <IndianRupee className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {currentLanguage === "en" ? "Estimated Savings" : "अनुमानित लागत बचत"}
              </span>
            </div>
            <div className="text-xl font-black text-gray-900">₹ {data.cost_saved_rupees}</div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {currentLanguage === "en" ? "per hectare" : "प्रति हेक्टेयर"}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Droplets className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-1.5 mb-1 text-blue-500">
              <Droplets className="w-4 h-4 fill-blue-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {currentLanguage === "en" ? "Water Saved" : "पानी की बचत"}
              </span>
            </div>
            <div className="text-xl font-black text-gray-900">{(data.water_saved_liters).toLocaleString()} L</div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
              {currentLanguage === "en" ? "per hectare" : "प्रति हेक्टेयर"}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 flex gap-3 max-w-xl mx-auto z-40">
        <button 
          type="button"
          onClick={handleShareResult}
          className="flex-1 h-14 rounded-full border-2 border-[#1B7A3D] text-[#1B7A3D] font-bold flex items-center justify-center gap-2 hover:bg-[#F2F9F4] transition-colors active:scale-95 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>{currentLanguage === "en" ? "Share Result" : "परिणाम शेयर करें"}</span>
        </button>
        <button 
          type="button"
          onClick={handleDownloadPDF}
          className="flex-1 h-14 rounded-full bg-[#1B7A3D] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#156030] transition-colors shadow-lg shadow-[#1B7A3D]/30 active:scale-95 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>{currentLanguage === "en" ? "Download PDF" : "PDF रिपोर्ट डाउनलोड"}</span>
        </button>
      </div>

      {/* "Why This Recommendation" Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center p-4 border-b border-gray-100 shadow-sm sticky top-0 bg-white z-10">
            <button onClick={() => setShowWhyModal(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h2 className="font-bold text-gray-900 text-lg ml-2">
              {currentLanguage === "en" ? "Why This Recommendation?" : "यह सलाह क्यों दी गई? (वैज्ञानिक कारण)"}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F8FAF9]">
            <div className="space-y-4">
              {explanationBullets.map((bullet, idx) => {
                const isWeather = bullet.toLowerCase().includes('rain') || bullet.toLowerCase().includes('weather') || bullet.includes('बारिश');
                const isSoil = bullet.toLowerCase().includes('moisture') || bullet.toLowerCase().includes('soil') || bullet.includes('नमी');
                const isTemp = bullet.toLowerCase().includes('temperature') || bullet.toLowerCase().includes('heat') || bullet.includes('तापमान');
                
                const icon = isWeather ? <CloudRain className="w-5 h-5 text-blue-500 fill-blue-500" /> :
                             isSoil ? <Droplets className="w-5 h-5 text-orange-500 fill-orange-500" /> :
                             isTemp ? <Thermometer className="w-5 h-5 text-red-500" /> :
                             <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
                
                const bgColor = isWeather ? "bg-blue-50" : isSoil ? "bg-orange-50" : isTemp ? "bg-red-50" : "bg-yellow-50";

                return (
                  <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium mt-1">
                      {bullet}.
                    </p>
                  </div>
                );
              })}
            </div>

            {/* AI Insight Box */}
            <div className="bg-[#F0F7FE] border border-[#D0E5FA] rounded-2xl p-5 mt-8 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                  <Droplets className="w-4 h-4 text-white fill-white" />
                </div>
                <h3 className="font-bold text-blue-900">
                  {currentLanguage === "en" ? "AI Agronomy Insight" : "AI वैज्ञानिक विश्लेषण"}
                </h3>
              </div>
              <p className="text-[13px] text-blue-900/80 leading-relaxed font-medium">
                {currentLanguage === "en"
                  ? "This recommendation is generated using our trained ML model, real-time weather data, and crop-specific safety ranges."
                  : "यह सलाह प्रशिक्षित AI/ML मॉडल, लाइव मौसम पूर्वानुमान और भारतीय कृषि सुरक्षा नियमों के आधार पर तैयार की गई है।"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
