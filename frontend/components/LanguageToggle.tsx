"use client";

import React from "react";

interface LanguageToggleProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const options = [
    { code: "hi", label: "हिं" },
    { code: "en", label: "EN" },
    { code: "mr", label: "मरा" },
  ];

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-0.5"
    >
      {options.map((opt) => {
        const isActive = currentLanguage === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => onLanguageChange(opt.code)}
            className={`px-2.5 py-1.5 text-[12px] font-bold rounded-[10px] transition-all duration-200 ${
              isActive
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
