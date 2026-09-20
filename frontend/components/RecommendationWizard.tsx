"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ChevronLeft, 
  Droplet, 
  Thermometer, 
  CloudRain, 
  MapPin, 
  Plus, 
  Check, 
  Sparkles,
  Layers,
  Waves,
  Maximize2
} from "lucide-react";
import { RecommendRequest } from "../lib/api";
import { ParsedVoiceData } from "../lib/voiceParser";

interface WizardProps {
  currentLanguage: string;
  labels: Record<string, string>;
  isLoading: boolean;
  onSubmit: (data: RecommendRequest) => void;
  onBack: () => void;
  initialData?: ParsedVoiceData;
  onLanguageChange: (lang: string) => void;
}

const PRIMARY_CROPS = [
  { id: "wheat", label: "Wheat", labelHi: "गेहूं", img: "/images/crop_wheat.jpg", emoji: "🌾" },
  { id: "rice", label: "Rice", labelHi: "धान", img: "/images/crop_rice.jpg", emoji: "🌾" },
  { id: "maize", label: "Maize", labelHi: "मक्का", img: "/images/crop_maize.jpg", emoji: "🌽" },
  { id: "soybean", label: "Soybean", labelHi: "सोयाबीन", img: "/images/crop_soybean.jpg", emoji: "🌱" },
];

const MORE_CROPS = [
  { id: "cotton", label: "Cotton", labelHi: "कपास", emoji: "☁️" },
  { id: "sugarcane", label: "Sugarcane", labelHi: "गन्ना", emoji: "🎋" },
  { id: "mustard", label: "Mustard", labelHi: "सरसों", emoji: "🌼" },
  { id: "gram", label: "Chickpea (Chana)", labelHi: "चना", emoji: "🧆" },
  { id: "potato", label: "Potato", labelHi: "आलू", emoji: "🥔" },
  { id: "tomato", label: "Tomato", labelHi: "टमाटर", emoji: "🍅" },
  { id: "onion", label: "Onion", labelHi: "प्याज", emoji: "🧅" },
  { id: "bajra", label: "Pearl Millet", labelHi: "बाजरा", emoji: "🌾" },
  { id: "groundnut", label: "Groundnut", labelHi: "मूंगफली", emoji: "🥜" },
];

const GROWTH_STAGES = [
  { id: "sowing", label: "Sowing / Early", labelHi: "बुवाई / अंकुरण" },
  { id: "vegetative", label: "Vegetative", labelHi: "वनस्पति विकास" },
  { id: "flowering", label: "Flowering", labelHi: "फूल आना" },
  { id: "fruiting", label: "Fruiting / Pods", labelHi: "दाना / फल विकास" },
  { id: "maturity", label: "Maturity", labelHi: "परिपक्वता" },
];

const SOIL_TYPES = [
  { id: "black", label: "Black Soil", labelHi: "काली मिट्टी", desc: "High water retention" },
  { id: "alluvial", label: "Loam / Alluvial", labelHi: "दोमट मिट्टी", desc: "Balanced fertility" },
  { id: "sandy", label: "Sandy Loam", labelHi: "बलुई दोमट", desc: "Fast drainage" },
  { id: "red", label: "Red Soil", labelHi: "लाल मिट्टी", desc: "Moderate retention" },
];

const IRRIGATION_METHODS = [
  { id: "drip", label: "Drip (Micro)", labelHi: "ड्रिप (बूंद-बूंद)", emoji: "💧" },
  { id: "sprinkler", label: "Sprinkler", labelHi: "फव्वारा", emoji: "🌧️" },
  { id: "flood", label: "Flood / Canal", labelHi: "नाली / खुला पानी", emoji: "🌊" },
];

const LAND_SIZES = [
  { value: 1, label: "1 Acre", labelHi: "1 एकड़" },
  { value: 2, label: "2 Acres", labelHi: "2 एकड़" },
  { value: 5, label: "5 Acres", labelHi: "5 एकड़" },
  { value: 10, label: "10+ Acres", labelHi: "10+ एकड़" },
];

export const RecommendationWizard: React.FC<WizardProps> = ({
  currentLanguage,
  labels,
  isLoading,
  onSubmit,
  onBack,
  initialData,
  onLanguageChange
}) => {
  const [step, setStep] = useState<number>(1);
  const [showMoreCrops, setShowMoreCrops] = useState<boolean>(false);

  // Step 1 State
  const [cropType, setCropType] = useState<string>(initialData?.crop_type || "wheat");
  const [growthStage, setGrowthStage] = useState<string>("vegetative");
  const [soilType, setSoilType] = useState<string>("black");
  const [irrigationMethod, setIrrigationMethod] = useState<string>("drip");
  const [landArea, setLandArea] = useState<number>(2);

  // Step 2 State
  const [soilMoisture, setSoilMoisture] = useState<number>(initialData?.soil_moisture ?? 28);
  const [temperature, setTemperature] = useState<number>(initialData?.temperature ?? 30);
  const [rainfall, setRainfall] = useState<number>(initialData?.rainfall ?? 0);
  const [latitude, setLatitude] = useState<number | "">(22.7196);
  const [longitude, setLongitude] = useState<number | "">(75.8577);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  useEffect(() => {
    if (initialData?.crop_type) setCropType(initialData.crop_type);
    if (initialData?.soil_moisture !== undefined) {
      const sm = initialData.soil_moisture;
      if (sm < 30) setSoilMoisture(15);
      else if (sm < 60) setSoilMoisture(45);
      else setSoilMoisture(80);
    }
    if (initialData?.temperature !== undefined) setTemperature(initialData.temperature);
    if (initialData?.rainfall !== undefined) setRainfall(initialData.rainfall);
  }, [initialData]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) handleSubmit();
  };

  const handleSubmit = () => {
    onSubmit({
      crop_type: cropType,
      growth_stage: growthStage,
      soil_moisture: Number(soilMoisture),
      temperature: Number(temperature),
      rainfall: Number(rainfall),
      latitude: latitude !== "" ? Number(latitude) : undefined,
      longitude: longitude !== "" ? Number(longitude) : undefined,
      language: currentLanguage,
    });
  };

  const handleAutoLocation = () => {
    if (!("geolocation" in navigator)) return;
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lon);
        setIsDetectingGPS(false);
        // Auto-fetch weather for these coords
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`)
          .then(res => res.json())
          .then(data => {
            if (data.current) {
              setTemperature(Math.round(data.current.temperature_2m));
              setRainfall(data.current.precipitation);
            }
          })
          .catch(() => {});
      },
      () => setIsDetectingGPS(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const allCrops = [...PRIMARY_CROPS, ...MORE_CROPS];
  const selectedCropObj = allCrops.find(c => c.id === cropType) || PRIMARY_CROPS[0];

  return (
    <div className="flex flex-col h-full bg-[#F4F7F5] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-20 border-b border-gray-100 shadow-xs">
        <button 
          onClick={step === 1 ? onBack : () => setStep(step - 1)} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-gray-900 text-[17px]">
          {currentLanguage === "en" ? "New Recommendation" : "नई फसल सलाह"}
        </h1>
        <button 
          onClick={() => onLanguageChange(currentLanguage === "en" ? "hi" : "en")}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#1B7A3D] text-white text-xs font-bold"
        >
          <span>{currentLanguage === "en" ? "EN" : "HI"}</span>
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center px-8 py-5 bg-white border-b border-gray-100 mb-3">
        <div className="flex items-center w-full max-w-[280px]">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${step >= 1 ? 'bg-[#1B7A3D] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <span className={`text-[11px] font-semibold absolute -bottom-4 whitespace-nowrap ${step >= 1 ? 'text-[#1B7A3D]' : 'text-gray-400'}`}>
              {currentLanguage === "en" ? "Crop & Field" : "फसल विवरण"}
            </span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-[#1B7A3D]' : 'bg-gray-200'}`} />
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${step >= 2 ? 'bg-[#1B7A3D] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className={`text-[11px] font-semibold absolute -bottom-4 whitespace-nowrap ${step >= 2 ? 'text-[#1B7A3D]' : 'text-gray-400'}`}>
              {currentLanguage === "en" ? "Conditions" : "मौसम व मिट्टी"}
            </span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-[#1B7A3D]' : 'bg-gray-200'}`} />
          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${step >= 3 ? 'bg-[#1B7A3D] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            <span className={`text-[11px] font-semibold absolute -bottom-4 whitespace-nowrap ${step >= 3 ? 'text-[#1B7A3D]' : 'text-gray-400'}`}>
              {currentLanguage === "en" ? "Confirm" : "समीक्षा"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-44 flex-1 space-y-5">
        
        {/* STEP 1: Crop & Field Details */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
            
            {/* 1. Select Crop */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 text-base">
                  1. {currentLanguage === "en" ? "Select Crop" : "फसल चुनें"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMoreCrops(!showMoreCrops)}
                  className="text-xs font-bold text-[#1B7A3D] bg-green-50 px-3 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showMoreCrops 
                    ? (currentLanguage === "en" ? "Show Less" : "कम फसलें") 
                    : (currentLanguage === "en" ? "+ More Crops" : "+ अन्य फसलें")}
                </button>
              </div>

              {/* Primary 4 Crops */}
              <div className="grid grid-cols-4 gap-2.5">
                {PRIMARY_CROPS.map(c => {
                  const isSelected = cropType === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCropType(c.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#1B7A3D] bg-[#F2F9F4] shadow-sm' 
                          : 'border-transparent bg-white shadow-xs hover:border-gray-200'
                      }`}
                    >
                      <Image 
                        src={c.img} 
                        alt={c.label} 
                        width={44} 
                        height={44} 
                        className="object-contain mb-1.5 mix-blend-multiply" 
                      />
                      <span className={`text-[12px] font-bold text-center leading-tight ${isSelected ? 'text-[#1B7A3D]' : 'text-gray-700'}`}>
                        {currentLanguage === "en" ? c.label : c.labelHi}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Extended More Crops Grid */}
              {showMoreCrops && (
                <div className="mt-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-xs animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs font-bold text-gray-500 mb-2">
                    {currentLanguage === "en" ? "Popular Indian Crops:" : "अन्य भारतीय फसलें:"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {MORE_CROPS.map(c => {
                      const isSelected = cropType === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCropType(c.id)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-[#1B7A3D] bg-green-50 text-[#1B7A3D] font-bold' 
                              : 'border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xl">{c.emoji}</span>
                          <span className="text-xs font-bold text-center leading-tight">
                            {currentLanguage === "en" ? c.label : c.labelHi}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Select Growth Stage */}
            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2.5">
                2. {currentLanguage === "en" ? "Crop Growth Stage" : "फसल की अवस्था"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {GROWTH_STAGES.map(g => {
                  const isSelected = growthStage === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrowthStage(g.id)}
                      className={`px-3.5 py-2 rounded-xl border-2 text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'border-[#1B7A3D] bg-[#F2F9F4] text-[#1B7A3D]' 
                          : 'border-transparent bg-white text-gray-600 shadow-xs hover:border-gray-200'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D]" />}
                      {currentLanguage === "en" ? g.label : g.labelHi}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Soil Type */}
            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2.5">
                3. {currentLanguage === "en" ? "Soil Type (मिट्टी का प्रकार)" : "मिट्टी का प्रकार"}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {SOIL_TYPES.map(s => {
                  const isSelected = soilType === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSoilType(s.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#1B7A3D] bg-[#F2F9F4]' 
                          : 'border-transparent bg-white shadow-xs hover:border-gray-200'
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#1B7A3D]' : 'text-gray-800'}`}>
                        {currentLanguage === "en" ? s.label : s.labelHi}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Irrigation Method */}
            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2.5">
                4. {currentLanguage === "en" ? "Irrigation Method" : "सिंचाई का साधन"}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {IRRIGATION_METHODS.map(m => {
                  const isSelected = irrigationMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setIrrigationMethod(m.id)}
                      className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#1B7A3D] bg-[#F2F9F4] text-[#1B7A3D] font-bold' 
                          : 'border-transparent bg-white text-gray-700 shadow-xs hover:border-gray-200'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-xs font-bold text-center leading-tight">
                        {currentLanguage === "en" ? m.label : m.labelHi}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Land / Field Size */}
            <div>
              <h2 className="font-bold text-gray-900 text-base mb-2.5">
                5. {currentLanguage === "en" ? "Land Area (खेत का आकार)" : "खेत का आकार (रकबा)"}
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {LAND_SIZES.map(l => {
                  const isSelected = landArea === l.value;
                  return (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setLandArea(l.value)}
                      className={`py-2 px-1 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#1B7A3D] bg-green-50 text-[#1B7A3D]' 
                          : 'border-transparent bg-white text-gray-700 shadow-xs hover:border-gray-200'
                      }`}
                    >
                      {currentLanguage === "en" ? l.label : l.labelHi}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: Field & Weather Conditions */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
            <h2 className="font-bold text-gray-900 text-base">
              {currentLanguage === "en" ? "Field & Climate Conditions" : "मौसम व मिट्टी की स्थिति"}
            </h2>
            
            <div className="space-y-3">
              {/* Soil Moisture */}
              <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Droplet className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    {currentLanguage === "en" ? "Soil Moisture Level" : "मिट्टी में नमी का स्तर"}
                  </label>
                  <select
                    value={soilMoisture}
                    onChange={(e) => setSoilMoisture(Number(e.target.value))}
                    className="w-full text-base font-bold text-gray-900 outline-none bg-transparent"
                  >
                    <option value={15}>{currentLanguage === "en" ? "15% - Dry (सूखी)" : "15% - सूखी (Dry)"}</option>
                    <option value={45}>{currentLanguage === "en" ? "45% - Moderate (हल्की नमी)" : "45% - मध्यम नमी (Moist)"}</option>
                    <option value={80}>{currentLanguage === "en" ? "80% - Wet / Saturated (गीली)" : "80% - पर्याप्त गीली (Wet)"}</option>
                  </select>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <Thermometer className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    {currentLanguage === "en" ? "Field Temperature (°C)" : "खेत का तापमान (°C)"}
                  </label>
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full text-base font-bold text-gray-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Rainfall */}
              <div className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <CloudRain className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    {currentLanguage === "en" ? "Recent / Forecast Rainfall (mm)" : "हालिया / पूर्वानुमान बारिश (mm)"}
                  </label>
                  <input
                    type="number"
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full text-base font-bold text-gray-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Location Auto GPS */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 text-[#1B7A3D]">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {currentLanguage === "en" ? "Farm Location" : "खेत का स्थान"}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {latitude ? `Indore (${latitude}, ${longitude})` : "Location not set"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoLocation}
                    disabled={isDetectingGPS}
                    className="px-3 py-1.5 rounded-full bg-[#1B7A3D] text-white text-xs font-bold hover:bg-[#166533] transition-colors disabled:opacity-50"
                  >
                    {isDetectingGPS ? "..." : (currentLanguage === "en" ? "Auto GPS" : "जीपीएस")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm & Review */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
            <h2 className="font-bold text-gray-900 text-base">
              {currentLanguage === "en" ? "Confirm Details" : "समीक्षा व पुष्टि करें"}
            </h2>

            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                <span className="text-3xl">{selectedCropObj.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg capitalize">
                    {currentLanguage === "en" ? selectedCropObj.label : selectedCropObj.labelHi}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium capitalize">
                    {growthStage} • {landArea} Acre(s)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="text-gray-500 font-medium block">
                    {currentLanguage === "en" ? "Soil Type" : "मिट्टी का प्रकार"}
                  </span>
                  <span className="font-bold text-gray-900 mt-0.5 block capitalize">{soilType}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="text-gray-500 font-medium block">
                    {currentLanguage === "en" ? "Irrigation Method" : "सिंचाई का साधन"}
                  </span>
                  <span className="font-bold text-gray-900 mt-0.5 block capitalize">{irrigationMethod}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="text-gray-500 font-medium block">
                    {currentLanguage === "en" ? "Soil Moisture" : "मिट्टी नमी"}
                  </span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{soilMoisture}%</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="text-gray-500 font-medium block">
                    {currentLanguage === "en" ? "Weather" : "तापमान व बारिश"}
                  </span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{temperature}°C, {rainfall}mm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white/95 backdrop-blur-md border-t border-gray-200/90 max-w-xl mx-auto z-50 shadow-2xl">
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#1B7A3D] text-white font-bold text-base shadow-lg hover:bg-[#166533] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>{currentLanguage === "en" ? "Calculating Advisory..." : "सलाह तैयार हो रही है..."}</span>
            ) : step === 3 ? (
              <span>{currentLanguage === "en" ? "Get AI Recommendation ✨" : "सटीक सलाह प्राप्त करें ✨"}</span>
            ) : (
              <span>{currentLanguage === "en" ? "Next →" : "आगे बढ़ें →"}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
