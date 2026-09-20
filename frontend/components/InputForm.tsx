"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, RotateCcw, MapPin, Navigation, Search } from "lucide-react";
import { RecommendRequest } from "../lib/api";

interface InputFormProps {
  currentLanguage: string;
  labels: Record<string, string>;
  isLoading: boolean;
  onSubmit: (data: RecommendRequest) => void;
  onOpenVoiceSheet: () => void;
  initialData?: {
    crop_type?: string;
    soil_moisture?: number;
    temperature?: number;
    rainfall?: number;
  };
}

const CROPS = [
  { id: "wheat", icon: "🌾", label: "गेहूं" },
  { id: "rice", icon: "🌱", label: "धान" },
  { id: "cotton", icon: "☁️", label: "कपास" },
  { id: "maize", icon: "🌽", label: "मक्का" },
  { id: "sugarcane", icon: "🎋", label: "गन्ना" },
  { id: "potato", icon: "🥔", label: "आलू" },
  { id: "tomato", icon: "🍅", label: "टमाटर" },
];

const POPULAR_REGIONS = [
  { name: "Indore", nameHi: "इंदौर", lat: 22.7179, lon: 75.8333 },
  { name: "Ludhiana", nameHi: "लुधियाना", lat: 30.9010, lon: 75.8573 },
  { name: "Nashik", nameHi: "नासिक", lat: 19.9975, lon: 73.7898 },
  { name: "Nagpur", nameHi: "नागपुर", lat: 21.1458, lon: 79.0882 },
  { name: "Karnal", nameHi: "करनाल", lat: 29.6857, lon: 76.9905 },
];

export const InputForm: React.FC<InputFormProps> = ({
  currentLanguage,
  labels,
  isLoading,
  onSubmit,
  onOpenVoiceSheet,
  initialData,
}) => {
  const [cropType, setCropType] = useState<string>(initialData?.crop_type || "wheat");
  const [soilMoisture, setSoilMoisture] = useState<number>(initialData?.soil_moisture ?? 15);
  const [temperature, setTemperature] = useState<number>(initialData?.temperature ?? 31.0);
  const [rainfall, setRainfall] = useState<number>(initialData?.rainfall ?? 4.0);

  // Location
  const [latitude, setLatitude] = useState<number | null>(22.7179);
  const [longitude, setLongitude] = useState<number | null>(75.8333);
  const [locationName, setLocationName] = useState<string>("इंदौर");
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [locationMsg, setLocationMsg] = useState<string | null>(null);
  const [showLocationPanel, setShowLocationPanel] = useState<boolean>(false);

  useEffect(() => {
    if (initialData?.crop_type) setCropType(initialData.crop_type);
    if (initialData?.soil_moisture !== undefined) {
      // Snap to closest option: 15 (Dry), 45 (Moist), 80 (Wet)
      const sm = initialData.soil_moisture;
      if (sm < 30) setSoilMoisture(15);
      else if (sm < 60) setSoilMoisture(45);
      else setSoilMoisture(80);
    }
    if (initialData?.temperature !== undefined) setTemperature(initialData.temperature);
    if (initialData?.rainfall !== undefined) setRainfall(initialData.rainfall);
  }, [initialData]);

  const fetchWeatherForLocation = async (lat: number, lon: number) => {
    try {
      setLocationMsg("मौसम का डेटा ला रहे हैं...");
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`);
      const data = await res.json();
      if (data.current) {
        setTemperature(data.current.temperature_2m);
        setRainfall(data.current.precipitation);
        setLocationMsg("✓ मौसम डेटा सेट!");
      } else {
        setLocationMsg("✓ स्थान सेट, मौसम नहीं मिला");
      }
    } catch {
      setLocationMsg("✓ स्थान सेट, मौसम नहीं मिला");
    }
    setTimeout(() => setLocationMsg(null), 3000);
  };

  const handleAutoLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationMsg("GPS उपलब्ध नहीं है");
      return;
    }
    setIsDetecting(true);
    setLocationMsg("GPS खोज रहे हैं...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lon);
        setLocationName(`📍 ${lat}°N, ${lon}°E`);
        setIsDetecting(false);
        setShowLocationPanel(false);
        fetchWeatherForLocation(lat, lon);
      },
      () => {
        setIsDetecting(false);
        setLocationMsg("GPS अनुमति नहीं मिली");
        setTimeout(() => setLocationMsg(null), 3000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity.trim())}&count=1&language=hi`
      );
      const data = await res.json();
      if (data.results?.length > 0) {
        const r = data.results[0];
        setLatitude(parseFloat(r.latitude.toFixed(4)));
        setLongitude(parseFloat(r.longitude.toFixed(4)));
        setLocationName(r.name);
        setSearchCity("");
        setShowLocationPanel(false);
        fetchWeatherForLocation(r.latitude, r.longitude);
      } else {
        setLocationMsg("शहर नहीं मिला");
        setTimeout(() => setLocationMsg(null), 3000);
      }
    } catch {
      setLocationMsg("खोज में त्रुटि");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRegion = (region: typeof POPULAR_REGIONS[0]) => {
    setLatitude(region.lat);
    setLongitude(region.lon);
    setLocationName(region.nameHi);
    setShowLocationPanel(false);
    fetchWeatherForLocation(region.lat, region.lon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      crop_type: cropType,
      soil_moisture: Number(soilMoisture),
      temperature: Number(temperature),
      rainfall: Number(rainfall),
      latitude: latitude !== null ? Number(latitude) : undefined,
      longitude: longitude !== null ? Number(longitude) : undefined,
      language: currentLanguage,
    });
  };

  const handleReset = () => {
    setCropType("wheat");
    setSoilMoisture(15);
    setTemperature(31.0);
    setRainfall(4.0);
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border)]">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
            {labels.form_title || "खेत की जानकारी दर्ज करें"}
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
            {labels.form_desc || "फसल, मिट्टी और मौसम की स्थिति"}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenVoiceSheet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-blue-light)] text-[var(--accent-blue)] text-[12px] font-bold hover:bg-[var(--accent-blue)] hover:text-white transition-all duration-200"
        >
          🎙️ बोलें
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Section 1: Crop Selection */}
        <div>
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
            {labels.crop_label || "फसल चुनें"}
          </label>
          <div className="flex flex-wrap gap-2">
            {CROPS.map((c) => {
              const active = cropType === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCropType(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200 ${
                    active
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                      : "bg-[var(--bg-muted)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Field Conditions — 3 compact inputs in a row */}
        <div>
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
            खेत की स्थिति
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Soil Moisture */}
            <div className="space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
                💧 {labels.soil_moisture_label || "नमी"}
              </span>
              <div className="relative">
                <select
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(parseFloat(e.target.value))}
                  className="w-full h-11 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] px-2 text-[13px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 transition-all appearance-none"
                  required
                >
                  <option value={15}>सूखी (Dry)</option>
                  <option value={45}>हल्की नमी (Moist)</option>
                  <option value={80}>गीली (Wet)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                  ▾
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
                🌡️ {labels.temperature_label || "तापमान"}
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] px-3 pr-9 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  required
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--border)] px-1.5 py-0.5 rounded-md">
                  °C
                </span>
              </div>
            </div>

            {/* Rainfall */}
            <div className="space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
                🌧️ {labels.rainfall_label || "वर्षा"}
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={rainfall}
                  onChange={(e) => setRainfall(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] px-3 pr-11 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  required
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--border)] px-1.5 py-0.5 rounded-md">
                  mm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Location — Compact inline display with expandable panel */}
        <div>
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
            📍 खेत का क्षेत्र
          </label>

          <div className="flex items-center gap-2">
            {/* Current location display */}
            <button
              type="button"
              onClick={() => setShowLocationPanel(!showLocationPanel)}
              className="flex-1 h-11 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] px-3 flex items-center gap-2 text-left hover:border-[var(--primary)] transition-all"
            >
              <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                {locationName}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] ml-auto shrink-0">बदलें ▾</span>
            </button>

            {/* Quick GPS button */}
            <button
              type="button"
              onClick={handleAutoLocation}
              disabled={isDetecting}
              className="h-11 px-3 rounded-xl bg-[var(--primary)] text-white text-[12px] font-bold flex items-center gap-1.5 hover:bg-[var(--primary-dark)] active:scale-[0.97] transition-all shrink-0 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetecting ? "animate-spin" : ""}`} />
              GPS
            </button>
          </div>

          {/* Location status message */}
          {locationMsg && (
            <p className="text-[12px] font-medium text-[var(--primary)] mt-1.5 px-1">
              {locationMsg}
            </p>
          )}

          {/* Expandable Location Panel */}
          {showLocationPanel && (
            <div className="mt-2 p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] space-y-2.5 animate-in slide-in-from-top-1 duration-200">
              {/* Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCitySearch(e)}
                  placeholder="शहर / जिला खोजें..."
                  className="flex-1 h-9 rounded-lg bg-white border border-[var(--border)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={handleCitySearch}
                  disabled={isSearching || !searchCity.trim()}
                  className="h-9 px-3 rounded-lg bg-white border border-[var(--border)] text-[var(--text-primary)] text-[12px] font-semibold hover:border-[var(--primary)] flex items-center gap-1 disabled:opacity-40"
                >
                  <Search className="w-3.5 h-3.5" />
                  खोजें
                </button>
              </div>

              {/* Quick Region Chips */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_REGIONS.map((reg) => (
                  <button
                    key={reg.name}
                    type="button"
                    onClick={() => handleSelectRegion(reg)}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-all ${
                      locationName === reg.nameHi
                        ? "bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)] font-bold"
                        : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {reg.nameHi}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="h-12 w-12 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--primary)] transition-all flex items-center justify-center shrink-0"
            title="रीसेट"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>

          <button
            type="submit"
            id="submit-recommend-btn"
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] active:scale-[0.98] transition-all text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>गणना जारी...</span>
              </>
            ) : (
              <>
                <span>सलाह प्राप्त करें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
