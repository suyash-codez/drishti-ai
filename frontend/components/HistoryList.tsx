"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Sprout, Droplets } from "lucide-react";
import Image from "next/image";

export interface SessionItem {
  id?: string;
  crop_type: string;
  summary?: string;
  water_saved_liters?: number;
  cost_saved_rupees?: number;
  alert_level?: string;
  created_at: string;
  image?: string;
}

interface HistoryListProps {
  sessions: SessionItem[];
  onBack?: () => void;
  onSelectSession?: (item: SessionItem) => void;
}

const DEFAULT_HISTORY_ITEMS: SessionItem[] = [
  {
    id: "h1",
    crop_type: "Wheat",
    summary: "25 mm • Urea 12 kg/ha",
    created_at: "16 Sep 2025",
    image: "/images/crop_wheat.jpg",
  },
  {
    id: "h2",
    crop_type: "Soybean",
    summary: "18 mm • DAP 10 kg/ha",
    created_at: "10 Sep 2025",
    image: "/images/crop_soybean.jpg",
  },
  {
    id: "h3",
    crop_type: "Maize",
    summary: "22 mm • Urea 8 kg/ha",
    created_at: "02 Sep 2025",
    image: "/images/crop_maize.jpg",
  },
  {
    id: "h4",
    crop_type: "Rice",
    summary: "30 mm • Urea 15 kg/ha",
    created_at: "25 Aug 2025",
    image: "/images/crop_rice.jpg",
  },
];

const getCropImage = (crop: string) => {
  const c = crop.toLowerCase();
  if (c.includes("wheat") || c.includes("गेहूं") || c.includes("गेहू")) return "/images/crop_wheat.jpg";
  if (c.includes("soy") || c.includes("सोयाबीन")) return "/images/crop_soybean.jpg";
  if (c.includes("maize") || c.includes("मक्का") || c.includes("corn")) return "/images/crop_maize.jpg";
  if (c.includes("rice") || c.includes("चावल") || c.includes("धान") || c.includes("paddy")) return "/images/crop_rice.jpg";
  return null;
};

export const HistoryList: React.FC<HistoryListProps> = ({ sessions, onBack, onSelectSession }) => {
  const [selectedItem, setSelectedItem] = useState<SessionItem | null>(null);

  // Combine runtime sessions with default sample history if runtime sessions is empty
  const displayItems = sessions.length > 0
    ? sessions.map((s, idx) => ({
        ...s,
        id: s.id || `sess_${idx}`,
        summary: s.summary || `${s.water_saved_liters ? `~${s.water_saved_liters}L Saved` : "Recommendation"} • ₹${s.cost_saved_rupees || 0} Saved`,
        image: s.image || getCropImage(s.crop_type) || undefined,
      }))
    : DEFAULT_HISTORY_ITEMS;

  return (
    <div className="flex flex-col h-full bg-[#F4F7F5]">
      {/* Header */}
      <div className="p-4 bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">History</h1>
            <p className="text-[12px] text-gray-500 font-medium">Your past recommendations</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-3 pb-28 overflow-y-auto">
        {displayItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (onSelectSession) {
                onSelectSession(item);
              } else {
                setSelectedItem(item);
              }
            }}
            className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer active:scale-[0.99]"
          >
            {/* Left side: Crop graphic and details */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-50/70 border border-orange-100/50 flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.crop_type}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🌾</span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-[16px] capitalize leading-tight">
                  {item.crop_type}
                </h3>
                <p className="text-[13px] text-gray-600 font-medium mt-0.5">
                  {item.summary}
                </p>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                  {item.created_at}
                </p>
              </div>
            </div>

            {/* Right side: Chevron */}
            <div className="text-gray-400 pl-2">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Sheet */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-5 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedItem.image ? (
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.crop_type}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🌾</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
                    {selectedItem.crop_type} Advisory
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">{selectedItem.created_at}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Summary:</span>
                <span className="font-bold text-gray-900">{selectedItem.summary}</span>
              </div>
              {selectedItem.cost_saved_rupees !== undefined && selectedItem.cost_saved_rupees > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Estimated Savings:</span>
                  <span className="font-bold text-[#1B7A3D]">₹{selectedItem.cost_saved_rupees}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
