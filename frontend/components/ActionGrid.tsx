"use client";

import React from "react";
import { Droplet, Sparkles, Camera, History, ShieldAlert } from "lucide-react";

interface ActionGridProps {
  onSelectAction: (actionId: "recommend" | "voice" | "scanner" | "history") => void;
  labels: Record<string, string>;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ onSelectAction, labels }) => {
  const actions = [
    {
      id: "recommend" as const,
      title: "नई स्मार्ट सलाह (Advisory)",
      subtitle: "सिंचाई एवं खाद की सटीक गणना",
      icon: <Droplet className="w-5 h-5 text-[#2563EB]" />,
      iconBg: "bg-[#DCE9FE]",
    },
    {
      id: "voice" as const,
      title: "बोलकर दर्ज करें (Voice)",
      subtitle: "हिन्दी / English आवाज पहचान",
      icon: <Sparkles className="w-5 h-5 text-[#1B7A3D]" />,
      iconBg: "bg-[#E6F4EA]",
    },
    {
      id: "scanner" as const,
      title: "पत्ता रोग स्कैनर (V1)",
      subtitle: "फोटो से रोग लक्षण पहचान",
      icon: <Camera className="w-5 h-5 text-[#F5A623]" />,
      iconBg: "bg-[#FFF6E5]",
    },
    {
      id: "history" as const,
      title: "पिछली बचत एवं लॉग्स",
      subtitle: "Supabase सुरक्षित डेटाबेस",
      icon: <History className="w-5 h-5 text-[#1B7A3D]" />,
      iconBg: "bg-[#E6F4EA]",
    },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-[18px] font-semibold text-[#1A1D1A]">
        खेत प्रबंधन (Field Quick Actions)
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => onSelectAction(act.id)}
            className="flex flex-col items-center justify-center p-4 bg-[#FFFFFF] border border-[#E5E7E3] rounded-[16px] text-center hover:border-[#1B7A3D] hover:shadow-sm transition-all duration-150 active:scale-[0.97]"
          >
            <div className={`w-10 h-10 rounded-full ${act.iconBg} flex items-center justify-center shrink-0 mb-2.5`}>
              {act.icon}
            </div>
            <span className="text-[15px] font-semibold text-[#1A1D1A] leading-snug">
              {act.title}
            </span>
            <span className="text-[13px] text-[#6B716B] mt-0.5 hidden sm:block">
              {act.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
