"use client";

import React from "react";
import { CloudRain, Sun, Droplets, Thermometer, Wind } from "lucide-react";

interface WeatherConditionsCardProps {
  temperature: number;
  soilMoisture: number;
  rainfall: number;
  forecastNote?: string | null;
  cropName: string;
}

export const WeatherConditionsCard: React.FC<WeatherConditionsCardProps> = ({
  temperature,
  soilMoisture,
  rainfall,
  forecastNote,
  cropName,
}) => {
  // Determine moisture pill status
  let moistureStatus = { label: "Good (अनुकूल)", bg: "bg-[#EAFBF0]", text: "text-[#22C55E]" };
  if (soilMoisture < 20) {
    moistureStatus = { label: "Low (कम नमी)", bg: "bg-[#FDEBEC]", text: "text-[#E5484D]" };
  } else if (soilMoisture < 30) {
    moistureStatus = { label: "Moderate (मध्यम)", bg: "bg-[#FFF6E5]", text: "text-[#F5A623]" };
  } else if (soilMoisture > 65) {
    moistureStatus = { label: "High (अत्यधिक)", bg: "bg-[#FDEBEC]", text: "text-[#E5484D]" };
  }

  return (
    <div className="w-full bg-[#E6F4EA] border border-[#1B7A3D]/20 rounded-[16px] p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Large Temp + Condition text + Icon */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#1B7A3D] shadow-xs shrink-0">
            {rainfall > 0 || forecastNote ? (
              <CloudRain className="w-7 h-7 text-[#2563EB]" />
            ) : (
              <Sun className="w-7 h-7 text-[#F5A623]" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#1A1D1A] leading-none">
                {temperature}°C
              </span>
              <span className="text-[13px] font-semibold text-[#1B7A3D] uppercase tracking-wide">
                खेत मौसम स्थिति
              </span>
            </div>
            <p className="text-[15px] text-[#1A1D1A] font-medium mt-1">
              {forecastNote || "आगामी 48 घंटे शुष्क मौसम — नियमित सिंचाई चक्र लागू"}
            </p>
          </div>
        </div>

        {/* Right: 3 Stacked Mini-Stats in Rounded Chips */}
        <div className="grid grid-cols-3 sm:flex sm:flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-2 bg-[#FFFFFF] px-3 py-1.5 rounded-full border border-[#E5E7E3]">
            <span className="text-[13px] text-[#6B716B]">नमी (Moisture)</span>
            <span className={`text-[13px] font-semibold px-2 py-0.5 rounded-full ${moistureStatus.bg} ${moistureStatus.text}`}>
              {soilMoisture}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#FFFFFF] px-3 py-1.5 rounded-full border border-[#E5E7E3]">
            <span className="text-[13px] text-[#6B716B]">तापमान (Temp)</span>
            <span className="text-[13px] font-semibold text-[#1A1D1A] px-2 py-0.5 rounded-full bg-[#F7F8F6]">
              {temperature}°C
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#FFFFFF] px-3 py-1.5 rounded-full border border-[#E5E7E3]">
            <span className="text-[13px] text-[#6B716B]">वर्षा (Rain)</span>
            <span className="text-[13px] font-semibold text-[#2563EB] px-2 py-0.5 rounded-full bg-[#DCE9FE]">
              {rainfall} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
