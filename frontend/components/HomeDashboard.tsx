"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Bell, 
  MapPin, 
  Sun, 
  Cloud, 
  CloudRain, 
  Droplets, 
  Sprout, 
  Camera, 
  History, 
  BellRing, 
  BookOpen, 
  Mic, 
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { FarmerProfile } from "../lib/supabase";

interface HomeDashboardProps {
  onAction: (action: "advisory" | "fields" | "scanner" | "history" | "alerts" | "learn" | "voice" | "profile") => void;
  labels: Record<string, string>;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  farmerProfile?: FarmerProfile | null;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onAction,
  labels,
  currentLanguage = "hi",
  onLanguageChange,
  farmerProfile,
}) => {
  const [temperature, setTemperature] = useState<number>(28);
  const [humidity, setHumidity] = useState<number>(62);
  const [soilMoisture, setSoilMoisture] = useState<number>(28);
  const [rainfall, setRainfall] = useState<number>(12);
  const [weatherDesc, setWeatherDesc] = useState<string>("Partly Cloudy");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString("hi-IN", { weekday: "short", day: "numeric", month: "short" });
    setDateStr(formatted || "आज");

    // Fetch actual weather for Indore
    const lat = 22.7179;
    const lon = 75.8333;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`)
      .then(res => res.json())
      .then(data => {
        if (data.current) {
          setTemperature(Math.round(data.current.temperature_2m));
          setHumidity(Math.round(data.current.relative_humidity_2m));
          setRainfall(data.current.precipitation);
          if (data.current.precipitation > 0) {
            setWeatherDesc(currentLanguage === "en" ? "Rainy" : "वर्षा / बारिश");
          } else {
            setWeatherDesc(currentLanguage === "en" ? "Clear / Sunny" : "साफ़ व धूप");
          }
        }
      })
      .catch(e => console.warn("Weather fetch fallback:", e));
  }, [currentLanguage]);

  const displayName = farmerProfile?.full_name || (currentLanguage === "en" ? "Ram Kishan" : "राम किशन जी");
  const displayLocation = farmerProfile?.village_district || (currentLanguage === "en" ? "My Farm, Indore" : "मेरा खेत, इंदौर");

  return (
    <div className="flex flex-col w-full h-full bg-[#F4F7F5] overflow-y-auto">
      
      {/* Top Main Navbar Matching Screenshot */}
      <header className="px-4 pt-4 pb-3 bg-white sticky top-0 z-20 border-b border-gray-100 flex items-center justify-between shadow-xs">
        {/* Left: DRISHTI Logo + Slogan */}
        <div className="flex items-center gap-2.5">
          {/* App Logo Circular Badge */}
          <div className="w-11 h-11 rounded-full bg-[#E5F3E9] border border-green-200/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            <Image
              src="/images/logo.jpg"
              alt="DRISHTI Logo"
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-black text-[#14532D] text-[18px] tracking-tight leading-none block">
              DRISHTI
            </span>
            <span className="text-[11px] font-medium text-gray-500 leading-tight block mt-0.5">
              For a Greener Tomorrow
            </span>
          </div>
        </div>

        {/* Right: Language Pill Switch + Bell Button */}
        <div className="flex items-center gap-2.5">
          {/* HI / EN Toggle Pill */}
          <div className="bg-[#EAEFEA] border border-gray-200/90 rounded-full p-1 flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => onLanguageChange && onLanguageChange("hi")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentLanguage === "hi"
                  ? "bg-[#1B7A3D] text-white shadow-sm scale-100"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              HI
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange && onLanguageChange("en")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentLanguage === "en"
                  ? "bg-[#1B7A3D] text-white shadow-sm scale-100"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              EN
            </button>
          </div>

          {/* Notification Bell Button */}
          <button 
            type="button"
            onClick={() => onAction("alerts")}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-90 transition-all relative cursor-pointer"
            title="View Alerts"
          >
            <Bell className="w-5 h-5 text-gray-700 stroke-[2]" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF6B35] rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-4 space-y-4 pb-28">

        {/* Farmer Profile Strip */}
        <div className="bg-white rounded-3xl p-3.5 border border-gray-100 shadow-xs flex items-center justify-between">
          <button 
            onClick={() => onAction("profile")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1B7A3D]/30 bg-[#E5F3E9] shrink-0 shadow-xs group-hover:border-[#1B7A3D] transition-colors">
                <Image src="/images/avatar.jpg" alt={displayName} width={48} height={48} className="object-cover" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-gray-900 text-[15px] leading-tight group-hover:text-[#1B7A3D] transition-colors">
                  {displayName}
                </h2>
                <span className="text-xs">👋</span>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-gray-500 font-medium mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#1B7A3D]" />
                <span>{displayLocation}</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onAction("profile")}
            className="px-3 py-1.5 rounded-full bg-green-50 text-[#1B7A3D] text-xs font-bold hover:bg-green-100 transition-colors cursor-pointer"
          >
            {currentLanguage === "en" ? "Profile" : "प्रोफ़ाइल"}
          </button>
        </div>

        {/* Hero Climate & Field Condition Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#125B2D] via-[#1B7A3D] to-[#259B4F] text-white p-5 shadow-lg shadow-green-900/15">
          {/* Subtle background glow circle */}
          <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Top Info */}
          <div className="flex items-center justify-between text-xs font-semibold text-green-100 mb-3">
            <span className="flex items-center gap-1.5 bg-black/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {currentLanguage === "en" ? "Live Farm Weather" : "लाइव मौसम व खेत स्थिति"}
            </span>
            <span>{dateStr}</span>
          </div>

          {/* Temperature & Weather Condition */}
          <div className="flex items-center justify-between my-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">{temperature}°</span>
                <span className="text-lg font-bold text-green-200">C</span>
              </div>
              <p className="text-sm font-semibold text-green-100 mt-0.5">{weatherDesc}</p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              {weatherDesc.includes("बारिश") ? (
                <CloudRain className="w-9 h-9 text-blue-200" />
              ) : temperature > 30 ? (
                <Sun className="w-9 h-9 text-yellow-300" />
              ) : (
                <Cloud className="w-9 h-9 text-white" />
              )}
            </div>
          </div>

          {/* Micro Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15">
            <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 text-center">
              <span className="text-[11px] text-green-200 block font-medium">
                {currentLanguage === "en" ? "Soil Moisture" : "मिट्टी नमी"}
              </span>
              <span className="text-[15px] font-bold block mt-0.5">{soilMoisture}%</span>
            </div>
            <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 text-center">
              <span className="text-[11px] text-green-200 block font-medium">
                {currentLanguage === "en" ? "Humidity" : "हवा में नमी"}
              </span>
              <span className="text-[15px] font-bold block mt-0.5">{humidity}%</span>
            </div>
            <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 text-center">
              <span className="text-[11px] text-green-200 block font-medium">
                {currentLanguage === "en" ? "Rainfall (24h)" : "बारिश (24h)"}
              </span>
              <span className="text-[15px] font-bold block mt-0.5">{rainfall} mm</span>
            </div>
          </div>

          {/* Smart AI Recommendation Pill */}
          <div className="mt-3.5 bg-white/95 text-gray-900 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-[#1B7A3D]">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-[12px] font-semibold text-gray-800 leading-snug">
              {currentLanguage === "en" 
                ? "Wheat (CRI Stage): Moisture optimal, schedule 20mm irrigation in 2 days." 
                : "गेहूं (CRI स्टेज): मिट्टी में नमी पर्याप्त है, 2 दिन बाद 20mm सिंचाई दें।"}
            </p>
          </div>
        </div>

        {/* Primary Voice Action Card */}
        <button
          onClick={() => onAction("voice")}
          className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white p-4 shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-between text-left group"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-white">
                  {currentLanguage === "en" ? "Ask by Voice" : "बोलकर सलाह पूछें"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">AI Voice</span>
              </div>
              <p className="text-[12px] text-blue-100 font-medium mt-0.5">
                {currentLanguage === "en" 
                  ? 'e.g. "When should I water my wheat?"' 
                  : 'उदा: "गेहूं में यूरिया कब डालना है?"'}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

        {/* Quick Actions Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <h3 className="font-bold text-gray-900 text-[15px]">
            {currentLanguage === "en" ? "Farm Services" : "मुख्य सुविधाएं (Services)"}
          </h3>
        </div>

        {/* Core Services Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: New Recommendation (Highlighted) */}
          <button
            onClick={() => onAction("advisory")}
            className="bg-white rounded-3xl p-4 border border-green-100 shadow-sm hover:shadow-md hover:border-[#1B7A3D] transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#1B7A3D] group-hover:bg-[#1B7A3D] group-hover:text-white transition-all shadow-xs">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-[#1B7A3D] group-hover:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[15px] leading-tight">
                {currentLanguage === "en" ? "New Advisory" : "नई फसल सलाह"}
              </h4>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                {currentLanguage === "en" ? "Water & Fertilizer" : "सिंचाई व खाद गणना"}
              </p>
            </div>
          </button>

          {/* Card 2: Disease Scanner */}
          <button
            onClick={() => onAction("scanner")}
            className="bg-white rounded-3xl p-4 border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-600 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <span className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[15px] leading-tight">
                {currentLanguage === "en" ? "Disease Check" : "पत्ता रोग स्कैनर"}
              </h4>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                {currentLanguage === "en" ? "Detect with camera" : "फोटो खींचकर जांचें"}
              </p>
            </div>
          </button>

          {/* Card 3: My Fields */}
          <button
            onClick={() => onAction("fields")}
            className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1B7A3D] transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {currentLanguage === "en" ? "3 Fields" : "3 खेत"}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[15px] leading-tight">
                {currentLanguage === "en" ? "My Fields" : "मेरे खेत (Fields)"}
              </h4>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                {currentLanguage === "en" ? "Wheat • Soy • Maize" : "गेहूं • सोयाबीन • मक्का"}
              </p>
            </div>
          </button>

          {/* Card 4: Alerts */}
          <button
            onClick={() => onAction("alerts")}
            className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-500 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs">
                <BellRing className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {currentLanguage === "en" ? "1 Warning" : "1 चेतावनी"}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[15px] leading-tight">
                {currentLanguage === "en" ? "Alerts" : "मौसम अलर्ट"}
              </h4>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                {currentLanguage === "en" ? "Heavy rain forecast" : "भारी बारिश की संभावना"}
              </p>
            </div>
          </button>

          {/* Card 5: History */}
          <button
            onClick={() => onAction("history")}
            className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <History className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[15px] leading-tight">
                {currentLanguage === "en" ? "History" : "पिछली सलाह"}
              </h4>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                {currentLanguage === "en" ? "View past records" : "बचत व इतिहास देखें"}
              </p>
            </div>
          </button>

          {/* Card 6: Govt Schemes & Subsidies */}
          <button
            onClick={() => onAction("learn")}
            className="bg-gradient-to-br from-[#0F4C81]/5 via-blue-50/60 to-[#1B7A3D]/5 rounded-3xl p-4 border border-blue-100/80 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/80 flex items-center justify-center text-xl group-hover:scale-105 transition-all shadow-xs">
                🏛️
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {currentLanguage === "en" ? "Subsidies" : "अनुदान व ऋण"}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[15px] leading-tight">
                {currentLanguage === "en" ? "Govt Schemes" : "सरकारी योजनाएं"}
              </h4>
              <p className="text-[12px] text-gray-500 font-medium mt-1">
                {currentLanguage === "en" ? "Drip, Solar & PM-Kisan" : "ड्रिप, सोलर व PM-किसान"}
              </p>
            </div>
          </button>

        </div>

        {/* Govt Scheme Highlight Banner on Home */}
        <div 
          onClick={() => onAction("learn")}
          className="bg-gradient-to-r from-[#0F4C81] to-[#1E6091] rounded-3xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-yellow-300">
                  {currentLanguage === "en" ? "PM-KUSUM & PMKSY" : "पीएम कुसुम व सिंचाई योजना"}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-yellow-400 text-yellow-950 text-[9px] font-black">
                  55%-90% OFF
                </span>
              </div>
              <p className="text-[12px] text-blue-100 font-medium mt-0.5">
                {currentLanguage === "en" 
                  ? "Get up to 90% subsidy on Solar Pumps & Drip systems" 
                  : "सोलर पंप व ड्रिप सिंचाई पर 90% तक सरकारी सब्सिडी देखें"}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Field Status Row */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h3 className="font-bold text-gray-900 text-[15px]">
              {currentLanguage === "en" ? "Active Fields Status" : "खेतों की ताज़ा स्थिति"}
            </h3>
            <button 
              onClick={() => onAction("fields")} 
              className="text-xs font-bold text-[#1B7A3D] hover:underline"
            >
              {currentLanguage === "en" ? "View All" : "सभी देखें"}
            </button>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                <Image src="/images/crop_wheat.jpg" alt="Wheat" width={44} height={44} className="object-cover w-full h-full" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Field 1 (गेहूं)</h4>
                <p className="text-xs text-gray-500 font-medium">2.5 हेक्टेयर • इंदौर</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-[#1B7A3D] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A3D]" />
              {currentLanguage === "en" ? "Optimal" : "अनुकूल"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
