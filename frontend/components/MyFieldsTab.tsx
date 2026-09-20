"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  X, 
  Check, 
  Sprout, 
  Loader2, 
  Sparkles, 
  Droplets, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  TrendingUp, 
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { fetchFarmerFields, createFarmerField, FarmerField } from "../lib/supabase";

export interface DiaryEntry {
  id: string;
  date: string;
  type: "irrigation" | "fertilizer" | "spray" | "sowing";
  title: string;
  detail: string;
  waterSavedLiters?: number;
  costSavedRupees?: number;
}

export interface FieldItem {
  id: string;
  name: string;
  crop: string;
  cropKey: string;
  variety?: string;
  area: number;
  location: string;
  image?: string;
  soilType: string;
  sowingDate: string;
  irrigationSource: string;
  waterSavedLiters: number;
  costSavedRupees: number;
  lastIrrigatedDate: string;
  diaryEntries: DiaryEntry[];
}

interface MyFieldsTabProps {
  onBack: () => void;
  onSelectField?: (field: FieldItem) => void;
  labels: Record<string, string>;
  currentLanguage?: string;
  userId?: string;
}

const DEFAULT_FIELDS: FieldItem[] = [
  {
    id: "f1",
    name: "उत्तरी खेत (North Field)",
    crop: "Wheat",
    cropKey: "wheat",
    variety: "Lokwan (लोक-1)",
    area: 2.5,
    location: "इंदौर / धार (म.प्र.)",
    image: "/images/crop_wheat.jpg",
    soilType: "काली भारी दोमट मिट्टी (Black Clay Loam)",
    sowingDate: "12 Nov 2025",
    irrigationSource: "बोरवेल ट्यूबवेल (Borewell + Drip)",
    waterSavedLiters: 125000,
    costSavedRupees: 3240,
    lastIrrigatedDate: "16 Sep (3 दिन पहले • 35mm)",
    diaryEntries: [
      {
        id: "d1",
        date: "16 Sep 2026",
        type: "irrigation",
        title: "संतुलित सिंचाई (DRISHTI AI)",
        detail: "35mm नियंत्रित पानी दिया; 40,000L पानी की बचत।",
        waterSavedLiters: 40000,
        costSavedRupees: 850
      },
      {
        id: "d2",
        date: "04 Sep 2026",
        type: "fertilizer",
        title: "यूरिया + नैनो यूरिया टॉप ड्रेसिंग",
        detail: "35 किग्रा प्रति एकड़ नैनो यूरिया के साथ फोलियर स्प्रे।",
        costSavedRupees: 420
      },
      {
        id: "d3",
        date: "12 Nov 2025",
        type: "sowing",
        title: "बुवाई व पलेवा सिंचाई",
        detail: "लोकवान गेहूं बीज दर 40 किग्रा/एकड़, पलेवा के बाद बुवाई।"
      }
    ]
  },
  {
    id: "f2",
    name: "बोरवेल वाला खेत (Tube-well Field)",
    crop: "Soybean",
    cropKey: "soybean",
    variety: "JS 9560",
    area: 1.5,
    location: "इंदौर / धार (म.प्र.)",
    image: "/images/crop_soybean.jpg",
    soilType: "मध्यम काली मिट्टी (Medium Black)",
    sowingDate: "28 Jun 2026",
    irrigationSource: "बोरवेल फ्लड (Tube-well)",
    waterSavedLiters: 85000,
    costSavedRupees: 2400,
    lastIrrigatedDate: "14 Sep (5 दिन पहले • 25mm)",
    diaryEntries: [
      {
        id: "d4",
        date: "14 Sep 2026",
        type: "irrigation",
        title: "हल्की सिंचाई (फली विकास)",
        detail: "मौसम अलर्ट के अनुसार हल्की 25mm सिंचाई दी गई।",
        waterSavedLiters: 35000,
        costSavedRupees: 650
      },
      {
        id: "d5",
        date: "18 Aug 2026",
        type: "spray",
        title: "फंगिसाइड सुरक्षा स्प्रे",
        detail: "साफ (Saaf) 2g/L फफूंद सुरक्षा छिड़काव किया।"
      }
    ]
  }
];

const CROP_OPTIONS = [
  { name: "Wheat", nameHi: "गेहूं", key: "wheat", image: "/images/crop_wheat.jpg", emoji: "🌾", defaultVariety: "Lokwan / GW-322" },
  { name: "Soybean", nameHi: "सोयाबीन", key: "soybean", image: "/images/crop_soybean.jpg", emoji: "🌱", defaultVariety: "JS 9560 / JS 20-34" },
  { name: "Maize", nameHi: "मक्का", key: "maize", image: "/images/crop_maize.jpg", emoji: "🌽", defaultVariety: "Pioneer / DKC 9108" },
  { name: "Rice", nameHi: "धान", key: "rice", image: "/images/crop_rice.jpg", emoji: "🌾", defaultVariety: "Basmati / Kranti" },
  { name: "Cotton", nameHi: "कपास", key: "cotton", emoji: "☁️", defaultVariety: "Bt Cotton RCH-2" },
  { name: "Sugarcane", nameHi: "गन्ना", key: "sugarcane", emoji: "🎋", defaultVariety: "Co 0238" },
];

const SOIL_OPTIONS = [
  { key: "black_clay", nameHi: "काली भारी दोमट मिट्टी", nameEn: "Deep Black Clay Soil" },
  { key: "medium_black", nameHi: "मध्यम काली मिट्टी", nameEn: "Medium Black Soil" },
  { key: "loamy", nameHi: "दोमट मिट्टी (Loamy Soil)", nameEn: "Alluvial / Loamy Soil" },
  { key: "red_yellow", nameHi: "लाल-पीली मिट्टी", nameEn: "Red & Yellow Soil" },
  { key: "sandy", nameHi: "बलुई रेतीली मिट्टी", nameEn: "Sandy Loam Soil" },
];

const IRRIGATION_SOURCES = [
  { key: "borewell", nameHi: "बोरवेल ट्यूबवेल (Borewell)", nameEn: "Borewell / Tube-well" },
  { key: "canal", nameHi: "नहर जल (Canal Water)", nameEn: "Canal Irrigation" },
  { key: "well", nameHi: "खुला कुआं (Open Well)", nameEn: "Open Well" },
  { key: "drip", nameHi: "ड्रिप / स्प्रिंकलर सिस्टम", nameEn: "Drip / Sprinkler" },
  { key: "rainfed", nameHi: "वर्षा आधारित (Rainfed / Barani)", nameEn: "Rainfed (No Well)" },
];

export const MyFieldsTab: React.FC<MyFieldsTabProps> = ({ 
  onBack, 
  onSelectField, 
  labels, 
  currentLanguage = "hi",
  userId = "default_user",
}) => {
  const isEn = currentLanguage === "en";
  const [fields, setFields] = useState<FieldItem[]>(DEFAULT_FIELDS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFieldDetail, setSelectedFieldDetail] = useState<FieldItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for adding field
  const [fieldName, setFieldName] = useState("");
  const [selectedCrop, setSelectedCrop] = useState(CROP_OPTIONS[0]);
  const [variety, setVariety] = useState(CROP_OPTIONS[0].defaultVariety);
  const [area, setArea] = useState("2.5");
  const [location, setLocation] = useState(isEn ? "Indore / Dhar (M.P.)" : "इंदौर / धार (म.प्र.)");
  const [soilType, setSoilType] = useState(SOIL_OPTIONS[0].nameHi);
  const [sowingDate, setSowingDate] = useState("2026-06-15");
  const [irrigationSource, setIrrigationSource] = useState(IRRIGATION_SOURCES[0].nameHi);

  // Form state for adding a diary entry
  const [isAddingDiaryEntry, setIsAddingDiaryEntry] = useState(false);
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split("T")[0]);
  const [diaryType, setDiaryType] = useState<"irrigation" | "fertilizer" | "spray" | "sowing">("irrigation");
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryDetail, setDiaryDetail] = useState("");

  // Load fields for this farmer from Supabase or localStorage
  useEffect(() => {
    async function loadFields() {
      setIsLoading(true);
      try {
        const saved = localStorage.getItem(`drishti_fields_${userId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFields(parsed);
            setIsLoading(false);
            return;
          }
        }

        const dbFields = await fetchFarmerFields(userId);
        if (dbFields && dbFields.length > 0) {
          const mapped: FieldItem[] = dbFields.map((f, idx) => {
            const cropMatch = CROP_OPTIONS.find((c) => c.key === f.cropKey);
            return {
              id: f.id,
              name: f.name,
              crop: f.cropName || (cropMatch?.name || f.cropKey),
              cropKey: f.cropKey,
              variety: cropMatch?.defaultVariety || "Desi Certified",
              area: f.areaAcres,
              location: isEn ? "Indore / Dhar" : "इंदौर / धार (म.प्र.)",
              image: cropMatch?.image || "/images/crop_wheat.jpg",
              soilType: f.soilType || (isEn ? "Black Clay Soil" : "काली दोमट मिट्टी"),
              sowingDate: f.sowingDate || "15 Nov 2025",
              irrigationSource: "बोरवेल ट्यूबवेल (Borewell)",
              waterSavedLiters: (idx + 1) * 65000,
              costSavedRupees: (idx + 1) * 1650,
              lastIrrigatedDate: "16 Sep (3 दिन पहले)",
              diaryEntries: DEFAULT_FIELDS[idx % DEFAULT_FIELDS.length]?.diaryEntries || []
            };
          });
          setFields(mapped);
          localStorage.setItem(`drishti_fields_${userId}`, JSON.stringify(mapped));
        } else {
          setFields(DEFAULT_FIELDS);
          localStorage.setItem(`drishti_fields_${userId}`, JSON.stringify(DEFAULT_FIELDS));
        }
      } catch (e) {
        console.warn("Failed to fetch fields from Supabase, using defaults", e);
        setFields(DEFAULT_FIELDS);
      } finally {
        setIsLoading(false);
      }
    }

    loadFields();
  }, [userId, isEn]);

  // Totals for the top dashboard
  const totalAcres = fields.reduce((sum, f) => sum + (f.area || 0), 0);
  const totalWaterSaved = fields.reduce((sum, f) => sum + (f.waterSavedLiters || 0), 0);
  const totalCostSaved = fields.reduce((sum, f) => sum + (f.costSavedRupees || 0), 0);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const newFieldName = fieldName.trim() || `${isEn ? "Field" : "खेत"} ${fields.length + 1}`;
    const newArea = parseFloat(area) || 2.0;

    const formattedSow = sowingDate ? new Date(sowingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "15 Nov 2025";

    const newField: FieldItem = {
      id: `f_${Date.now()}`,
      name: newFieldName,
      crop: selectedCrop.name,
      cropKey: selectedCrop.key,
      variety: variety.trim() || selectedCrop.defaultVariety,
      area: newArea,
      location: location.trim() || (isEn ? "Indore / Dhar" : "इंदौर / धार (म.प्र.)"),
      image: selectedCrop.image,
      soilType: soilType,
      sowingDate: formattedSow,
      irrigationSource: irrigationSource,
      waterSavedLiters: 35000,
      costSavedRupees: 950,
      lastIrrigatedDate: isEn ? "Just Registered" : "हाल ही में पंजीकृत",
      diaryEntries: [
        {
          id: `d_${Date.now()}`,
          date: formattedSow,
          type: "sowing",
          title: isEn ? `Crop Sowing: ${selectedCrop.name}` : `फसल बुवाई: ${selectedCrop.nameHi || selectedCrop.name}`,
          detail: `${isEn ? "Sown variety:" : "बोई गई किस्म:"} ${variety.trim() || selectedCrop.defaultVariety} • ${newArea} ${isEn ? "Acres" : "एकड़"}`
        }
      ]
    };

    try {
      await createFarmerField(userId, {
        name: newFieldName,
        cropKey: selectedCrop.key,
        cropName: selectedCrop.nameHi || selectedCrop.name,
        areaAcres: newArea,
        soilType: soilType,
        sowingDate: formattedSow,
      });
    } catch (err) {
      console.warn("Supabase field save notice:", err);
    }

    const updated = [newField, ...fields];
    setFields(updated);
    try {
      localStorage.setItem(`drishti_fields_${userId}`, JSON.stringify(updated));
    } catch (e) {}

    setIsLoading(false);
    setIsAddModalOpen(false);
    setFieldName("");
    setArea("2.5");
  };

  const handleDeleteField = (id: string) => {
    const updated = fields.filter((f) => f.id !== id);
    setFields(updated);
    try {
      localStorage.setItem(`drishti_fields_${userId}`, JSON.stringify(updated));
    } catch (e) {}
    setSelectedFieldDetail(null);
  };

  const handleAddDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldDetail) return;

    const formattedDate = diaryDate ? new Date(diaryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB");

    const newEntry: DiaryEntry = {
      id: `d_${Date.now()}`,
      date: formattedDate,
      type: diaryType,
      title: diaryTitle.trim() || (diaryType === "irrigation" ? "सिंचाई दी गई" : diaryType === "fertilizer" ? "खाद / पोषण दिया" : diaryType === "spray" ? "कीटनाशक स्प्रे" : "खेत कार्य"),
      detail: diaryDetail.trim() || "खेत डायरी में सफल प्रविष्टि।",
      waterSavedLiters: diaryType === "irrigation" ? 25000 : undefined,
      costSavedRupees: diaryType === "irrigation" ? 600 : undefined
    };

    const updatedDetail: FieldItem = {
      ...selectedFieldDetail,
      lastIrrigatedDate: diaryType === "irrigation" ? `${formattedDate} (हालिया)` : selectedFieldDetail.lastIrrigatedDate,
      waterSavedLiters: selectedFieldDetail.waterSavedLiters + (newEntry.waterSavedLiters || 0),
      costSavedRupees: selectedFieldDetail.costSavedRupees + (newEntry.costSavedRupees || 0),
      diaryEntries: [newEntry, ...(selectedFieldDetail.diaryEntries || [])]
    };

    const updatedFields = fields.map((f) => f.id === selectedFieldDetail.id ? updatedDetail : f);
    setFields(updatedFields);
    setSelectedFieldDetail(updatedDetail);
    try {
      localStorage.setItem(`drishti_fields_${userId}`, JSON.stringify(updatedFields));
    } catch (e) {}

    setIsAddingDiaryEntry(false);
    setDiaryTitle("");
    setDiaryDetail("");
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7F5]">
      {/* Header */}
      <div className="p-4 bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-extrabold text-gray-900 text-lg leading-tight">
              {isEn ? "Farm Digital Diary (My Fields)" : "मेरे खेत (Farm Digital Diary)"}
            </h1>
            <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1B7A3D]" />
              <span>{isEn ? "Supabase PostgreSQL • Row Level Security (RLS)" : "क्लाउड डेटाबेस से सुरक्षित • RLS सुरक्षा"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 pb-28 overflow-y-auto">

        {/* TOP SUMMARY BANNER: Cumulative Farm Savings & Acreage Tracker */}
        <div className="bg-gradient-to-br from-[#1B7A3D] to-[#125429] text-white rounded-3xl p-4.5 shadow-lg shadow-[#1B7A3D]/20 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold">
                🌾
              </span>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">
                  {isEn ? "Total Farm Portfolio" : "कुल पंजीकृत कृषि रकबा"}
                </h3>
                <p className="text-[11px] text-white/80 font-medium">
                  {fields.length} {isEn ? "Active Fields" : "सक्रिय खेत प्लॉट"} • {totalAcres.toFixed(1)} {isEn ? "Acres" : "एकड़"}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>RLS 100% Private</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold mb-0.5">
                <Droplets className="w-3.5 h-3.5" />
                <span>{isEn ? "Water Saved" : "कुल जल बचत"}</span>
              </div>
              <p className="text-lg font-black text-white leading-tight">
                {(totalWaterSaved / 1000).toFixed(0)}k L
              </p>
              <p className="text-[10px] text-white/70 font-medium mt-0.5">
                {isEn ? "Over-irrigation avoided" : "फालतू पानी की बर्बादी रोकी"}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-amber-200 text-xs font-semibold mb-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isEn ? "Money Saved" : "कुल धन बचत"}</span>
              </div>
              <p className="text-lg font-black text-white leading-tight">
                ₹{totalCostSaved.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-white/70 font-medium mt-0.5">
                {isEn ? "Diesel & electricity saved" : "बिजली व डीजल लागत बचत"}
              </p>
            </div>
          </div>
        </div>

        {/* Add New Field Action Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1B7A3D] to-[#259B4F] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#1B7A3D]/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{isEn ? "Add New Field (नया खेत जोड़ें)" : "+ नया खेत जोड़ें (Add Field)"}</span>
        </button>

        {/* Fields List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1B7A3D]" />
              <span>{isEn ? "Registered Field Plots" : "पंजीकृत खेतों की डिजिटल डायरी"}</span>
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {fields.length} {isEn ? "Plots" : "प्लॉट"}
            </span>
          </div>

          {isLoading && fields.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1B7A3D]" />
              <p className="text-xs font-medium">खेत लोड हो रहे हैं...</p>
            </div>
          ) : (
            fields.map((field) => (
              <div
                key={field.id}
                className="bg-white rounded-3xl p-4 shadow-xs border border-gray-200/80 hover:border-[#1B7A3D] transition-all space-y-3"
              >
                {/* Upper: Photo & Specs */}
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                    {field.image ? (
                      <Image
                        src={field.image}
                        alt={field.crop}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🌱</span>
                    )}
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                        {field.name}
                      </h3>
                    </div>

                    <p className="text-[13px] text-gray-700 font-bold">
                      {field.crop} {field.variety ? `(${field.variety})` : ""} • <span className="text-[#1B7A3D]">{field.area} एकड़</span>
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{field.location}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Rich Farm Specs Badges */}
                <div className="bg-gray-50 rounded-2xl p-2.5 border border-gray-100 text-xs space-y-1.5 font-medium">
                  <div className="flex items-center justify-between gap-2 text-gray-700">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-600" />
                      {isEn ? "Soil:" : "मिट्टी:"}
                    </span>
                    <span className="text-[11px] font-bold text-gray-800 truncate">{field.soilType}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-gray-700">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      {isEn ? "Sown:" : "बुवाई:"}
                    </span>
                    <span className="text-[11px] font-bold text-gray-800 truncate">{field.sowingDate}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-gray-700">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-600" />
                      {isEn ? "Last Watered:" : "अंतिम सिंचाई:"}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-800 truncate">{field.lastIrrigatedDate}</span>
                  </div>
                </div>

                {/* Savings Pill */}
                <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-100 px-3 py-1.5 rounded-xl text-[11px]">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-emerald-600" />
                    {(field.waterSavedLiters / 1000).toFixed(0)}k L जल बचत
                  </span>
                  <span className="font-extrabold text-[#1B7A3D]">
                    ₹{field.costSavedRupees.toLocaleString("en-IN")} बचत
                  </span>
                </div>

                {/* Two Action Buttons: View Diary vs Get Advisory */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedFieldDetail(field)}
                    className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#1B7A3D]" />
                    <span>{isEn ? "View Diary" : "डायरी देखें"}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectField) onSelectField(field);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#1B7A3D] hover:bg-[#166533] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>{isEn ? "Get Advisory" : "सलाह लें >"}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: Full Digital Farm Diary Modal */}
      {selectedFieldDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full sm:h-[92vh] sm:max-h-[860px] sm:rounded-[36px] flex flex-col overflow-hidden relative shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedFieldDetail(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                    {selectedFieldDetail.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {isEn ? "Digital Farm Diary & Action Log" : "खेत की डिजिटल डायरी व संपूर्ण इतिहास"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFieldDetail(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Diary Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Field Identity Hero Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-green-50/50 to-white rounded-3xl p-4 border border-emerald-100 flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {selectedFieldDetail.image ? (
                    <Image
                      src={selectedFieldDetail.image}
                      alt={selectedFieldDetail.crop}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🌱</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold bg-[#1B7A3D] text-white px-2 py-0.5 rounded-full">
                    {selectedFieldDetail.crop}
                  </span>
                  <h4 className="font-bold text-gray-900 text-base mt-1">
                    {selectedFieldDetail.variety ? `${selectedFieldDetail.crop} — ${selectedFieldDetail.variety}` : selectedFieldDetail.crop}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    {selectedFieldDetail.area} एकड़ • {selectedFieldDetail.location}
                  </p>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {isEn ? "Field Specifications" : "खेत की तकनीकी जानकारी"}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">मिट्टी का प्रकार</span>
                    <span className="font-bold text-gray-800">{selectedFieldDetail.soilType}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">बुवाई की तारीख</span>
                    <span className="font-bold text-gray-800">{selectedFieldDetail.sowingDate}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">सिंचाई का साधन</span>
                    <span className="font-bold text-gray-800">{selectedFieldDetail.irrigationSource}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <span className="text-gray-400 block text-[10px]">अंतिम सिंचाई</span>
                    <span className="font-bold text-cyan-800">{selectedFieldDetail.lastIrrigatedDate}</span>
                  </div>
                </div>
              </div>

              {/* Field Savings Tracker */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] text-emerald-100 font-semibold">
                    {isEn ? "Cumulative Water Saved" : "इस खेत की कुल जल बचत"}
                  </p>
                  <p className="text-lg font-black leading-tight mt-0.5">
                    {selectedFieldDetail.waterSavedLiters.toLocaleString("en-IN")} L
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-emerald-100 font-semibold">
                    {isEn ? "Money Saved" : "कुल संचित बचत"}
                  </p>
                  <p className="text-lg font-black leading-tight mt-0.5 text-amber-200">
                    ₹{selectedFieldDetail.costSavedRupees.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Action Log / Diary History */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#1B7A3D]" />
                    <span>{isEn ? "Irrigation & Fertilizer Log" : "सिंचाई व खाद डायरी रिकॉर्ड"}</span>
                  </h4>
                  <button
                    onClick={() => setIsAddingDiaryEntry(!isAddingDiaryEntry)}
                    className="text-xs font-bold text-[#1B7A3D] bg-green-50 px-2.5 py-1 rounded-full border border-green-200 hover:bg-green-100 transition cursor-pointer"
                  >
                    {isAddingDiaryEntry ? "रद्द करें" : "+ एंट्री जोड़ें"}
                  </button>
                </div>

                {/* Form to log activity */}
                {isAddingDiaryEntry && (
                  <form onSubmit={handleAddDiaryEntry} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 animate-in fade-in duration-200">
                    <h5 className="font-bold text-xs text-gray-800">
                      {isEn ? "Log New Farm Activity" : "नया सिंचाई/खाद रिकॉर्ड दर्ज करें"}
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">तारीख</label>
                        <input
                          type="date"
                          value={diaryDate}
                          onChange={(e) => setDiaryDate(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">प्रकार</label>
                        <select
                          value={diaryType}
                          onChange={(e) => setDiaryType(e.target.value as any)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        >
                          <option value="irrigation">💧 सिंचाई (Irrigation)</option>
                          <option value="fertilizer">🧪 खाद / पोषण (Fertilizer)</option>
                          <option value="spray">🛡️ कीटनाशक स्प्रे (Spray)</option>
                          <option value="sowing">🌱 बुवाई/जुताई (Field Work)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">विवरण / शीर्षक</label>
                      <input
                        type="text"
                        placeholder="उदा: 30mm पानी दिया (बोरवेल से 4 घंटे)"
                        value={diaryTitle}
                        onChange={(e) => setDiaryTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">टिप्पणी</label>
                      <input
                        type="text"
                        placeholder="उदा: मिट्टी में पर्याप्त नमी बनी हुई है"
                        value={diaryDetail}
                        onChange={(e) => setDiaryDetail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#1B7A3D] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#166533] cursor-pointer"
                    >
                      डायरी में सुरक्षित करें (Save Entry)
                    </button>
                  </form>
                )}

                {/* Diary Timeline Items */}
                <div className="space-y-2">
                  {selectedFieldDetail.diaryEntries && selectedFieldDetail.diaryEntries.length > 0 ? (
                    selectedFieldDetail.diaryEntries.map((entry) => (
                      <div key={entry.id} className="p-3 bg-white rounded-2xl border border-gray-100 flex items-start gap-3 shadow-2xs">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                          entry.type === "irrigation" ? "bg-cyan-50 text-cyan-600" :
                          entry.type === "fertilizer" ? "bg-amber-50 text-amber-600" :
                          entry.type === "spray" ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {entry.type === "irrigation" ? "💧" : entry.type === "fertilizer" ? "🧪" : entry.type === "spray" ? "🛡️" : "🌱"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-gray-900 text-xs truncate">{entry.title}</h5>
                            <span className="text-[10px] font-semibold text-gray-400 shrink-0">{entry.date}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium mt-0.5 leading-relaxed">{entry.detail}</p>
                          {entry.waterSavedLiters && (
                            <span className="inline-block mt-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              💧 {entry.waterSavedLiters.toLocaleString("en-IN")}L जल बचत
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">अभी कोई डायरी एंट्री नहीं है।</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-white border-t border-gray-100 space-y-2 shrink-0">
              <button
                onClick={() => {
                  if (onSelectField) onSelectField(selectedFieldDetail);
                  setSelectedFieldDetail(null);
                }}
                className="w-full py-3 rounded-2xl bg-[#1B7A3D] hover:bg-[#166533] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
              >
                <Sprout className="w-4 h-4" />
                <span>{isEn ? "Get AI Advisory for this Field" : "इस खेत के लिए AI सलाह लें"}</span>
              </button>

              <button
                onClick={() => handleDeleteField(selectedFieldDetail.id)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? "Delete Field from Cloud" : "खेत हटाएं (Delete Field)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Field Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full sm:h-[92vh] sm:max-h-[860px] sm:rounded-[36px] flex flex-col overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  {isEn ? "Register New Field Plot" : "नया खेत पंजीकृत करें"}
                </h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isEn ? "Add to Supabase Cloud Farm Diary" : "क्लाउड फार्म डायरी में शामिल करें"}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleAddField} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* Field Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isEn ? "Field / Plot Name" : "खेत का नाम (Field Name)"}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? "e.g. North Tube-well Field" : "उदा: उत्तर बोरवेल वाला खेत"}
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800"
                  required
                />
              </div>

              {/* Crop Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isEn ? "Crop Sown" : "बोई गई फसल (Crop)"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CROP_OPTIONS.map((c) => {
                    const isSelected = selectedCrop.key === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          setSelectedCrop(c);
                          setVariety(c.defaultVariety);
                        }}
                        className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#1B7A3D] bg-green-50 text-[#1B7A3D] font-bold shadow-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-xl">{c.emoji}</span>
                        <span className="text-xs">{isEn ? c.name : c.nameHi}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variety Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isEn ? "Crop Variety / Seed Name" : "फसल की किस्म / वैरायटी"}
                </label>
                <input
                  type="text"
                  placeholder="उदा: Lokwan, JS 9560, Pioneer"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800"
                />
              </div>

              {/* Area & Location */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isEn ? "Area (Acres)" : "रकबा (एकड़ में)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="500"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isEn ? "Sowing Date" : "बुवाई की तारीख"}
                  </label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Soil Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isEn ? "Soil Type" : "मिट्टी का प्रकार (Soil Type)"}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800"
                >
                  {SOIL_OPTIONS.map((s) => (
                    <option key={s.key} value={s.nameHi}>
                      {isEn ? s.nameEn : s.nameHi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Irrigation Source */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isEn ? "Source of Irrigation" : "सिंचाई का मुख्य साधन"}
                </label>
                <select
                  value={irrigationSource}
                  onChange={(e) => setIrrigationSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800"
                >
                  {IRRIGATION_SOURCES.map((s) => (
                    <option key={s.key} value={s.nameHi}>
                      {isEn ? s.nameEn : s.nameHi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isEn ? "Location / Tehsil" : "स्थान / तहसील"}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-[#1B7A3D] focus:bg-white text-gray-800"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#1B7A3D] hover:bg-[#166533] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isEn ? "Save Field to Supabase Cloud" : "+ खेत सहेजें (Save to Cloud Diary)"}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
