"use client";

import React from "react";
import { Home, Sprout, Bell, BookOpen, User } from "lucide-react";

export type TabType = "home" | "advisory" | "history" | "scanner" | "fields" | "alerts" | "learn" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentLanguage?: string;
}

const tabs: { id: TabType; label: string; labelHi: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", labelHi: "होम", icon: Home },
  { id: "fields", label: "Fields", labelHi: "खेत", icon: Sprout },
  { id: "alerts", label: "Alerts", labelHi: "अलर्ट", icon: Bell },
  { id: "learn", label: "Learn", labelHi: "ज्ञान", icon: BookOpen },
  { id: "profile", label: "Profile", labelHi: "प्रोफ़ाइल", icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, currentLanguage = "hi" }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-[var(--border)] safe-area-pb">
      <div className="max-w-xl mx-auto h-16 flex items-center justify-around px-4">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          const tabLabel = currentLanguage === "en" ? t.label : t.labelHi;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[var(--primary)] bg-[var(--primary-light)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className={`text-[11px] leading-none ${isActive ? "font-bold" : "font-medium"}`}>
                {tabLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
