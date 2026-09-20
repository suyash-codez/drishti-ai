"use client";

import React from "react";
import { Sprout } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";

interface NavbarProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  labels: Record<string, string>;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  labels,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-xl mx-auto h-14 flex items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[var(--text-primary)] leading-tight tracking-tight">
              DRISHTI
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)] leading-none">
              स्मार्ट कृषि सलाहकार
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <LanguageToggle
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </header>
  );
};
