"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface AlertBannerProps {
  level: string;
  message: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ level, message }) => {
  const config = {
    green: {
      bg: "bg-[var(--alert-green-bg)]",
      border: "border-[var(--alert-green)]/30",
      text: "text-[#145C2E]",
      icon: <CheckCircle2 className="w-4 h-4 text-[var(--alert-green)]" />,
    },
    yellow: {
      bg: "bg-[var(--alert-yellow-bg)]",
      border: "border-[var(--alert-yellow)]/30",
      text: "text-[#9A5B00]",
      icon: <AlertTriangle className="w-4 h-4 text-[var(--alert-yellow)]" />,
    },
    red: {
      bg: "bg-[var(--alert-red-bg)]",
      border: "border-[var(--alert-red)]/30",
      text: "text-[#9B1D22]",
      icon: <AlertTriangle className="w-4 h-4 text-[var(--alert-red)]" />,
    },
  };

  const c = config[level as keyof typeof config] || config.green;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-3 flex items-start gap-2.5`}>
      <span className="shrink-0 mt-0.5">{c.icon}</span>
      <p className={`text-[13px] font-medium ${c.text} leading-relaxed`}>
        {message}
      </p>
    </div>
  );
};
