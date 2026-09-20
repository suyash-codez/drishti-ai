"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  User, 
  Sprout, 
  Globe, 
  Bell, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Check, 
  Phone, 
  Shield, 
  Smartphone,
  LogIn,
  MapPin,
  Sparkles
} from "lucide-react";
import { FarmerProfile } from "../lib/supabase";

interface ProfileTabProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  onNavigateTab: (tab: any) => void;
  onLogout: () => void;
  onBack?: () => void;
  labels: Record<string, string>;
  farmerProfile?: FarmerProfile | null;
  onOpenAuth?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentLanguage,
  onLanguageChange,
  onNavigateTab,
  onLogout,
  onBack,
  labels,
  farmerProfile,
  onOpenAuth,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Notifications toggle state
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifPest, setNotifPest] = useState(true);
  const [notifAdvisory, setNotifAdvisory] = useState(false);

  const getLanguageLabel = (lang: string) => {
    if (lang === "hi") return "हिंदी";
    if (lang === "mr") return "मराठी";
    return "English";
  };

  const displayName = farmerProfile?.full_name || (currentLanguage === "en" ? "Guest Farmer (Not Logged In)" : "किसान भाई (लॉगिन नहीं है)");
  const displayLocation = farmerProfile?.village_district || (currentLanguage === "en" ? "Indore, MP" : "मध्य प्रदेश");
  const displayPhone = farmerProfile?.phone || farmerProfile?.email || (currentLanguage === "en" ? "Tap to Login" : "लॉगिन करने के लिए टैप करें");
  const displayLand = farmerProfile?.land_size_acres ? `${farmerProfile.land_size_acres} एकड़` : (currentLanguage === "en" ? "Not set" : "सेट नहीं है");

  const menuItems = [
    {
      id: "profile",
      icon: User,
      title: currentLanguage === "en" ? "My Farmer Profile" : "मेरी किसान प्रोफ़ाइल (Profile)",
      onClick: () => setActiveModal("profile"),
    },
    {
      id: "fields",
      icon: Sprout,
      title: currentLanguage === "en" ? "My Saved Fields & Crops" : "मेरे सहेजे गए खेत व फसलें",
      onClick: () => onNavigateTab("fields"),
    },
    {
      id: "language",
      icon: Globe,
      title: currentLanguage === "en" ? "App Language" : "ऐप की भाषा (Language)",
      rightContent: (
        <span className="text-[13px] font-medium text-gray-500 mr-1">
          {getLanguageLabel(currentLanguage)}
        </span>
      ),
      onClick: () => setActiveModal("language"),
    },
    {
      id: "notifications",
      icon: Bell,
      title: currentLanguage === "en" ? "Notification Alerts" : "मौसम व कीट अलर्ट सूचनाएं",
      onClick: () => setActiveModal("notifications"),
    },
    {
      id: "help",
      icon: HelpCircle,
      title: currentLanguage === "en" ? "Help & Kisan Helpline" : "मदद व किसान कॉल सेंटर (1800-180-1551)",
      onClick: () => setActiveModal("help"),
    },
    {
      id: "about",
      icon: Info,
      title: currentLanguage === "en" ? "About DRISHTI AI" : "दृष्टि (DRISHTI) AI के बारे में",
      onClick: () => setActiveModal("about"),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Header with Back button */}
      <div className="p-4 bg-white sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="font-bold text-gray-900 text-lg leading-tight">
            {currentLanguage === "en" ? "Account & Farmer Profile" : "किसान खाता व सेटिंग्स"}
          </h1>
        </div>

        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{farmerProfile ? (currentLanguage === "en" ? "Switch ID" : "खाता बदलें") : (currentLanguage === "en" ? "Login" : "लॉगिन")}</span>
          </button>
        )}
      </div>

      {/* Top Profile Header Card */}
      <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#F4FAF5] to-white">
        <div className="flex items-center gap-3.5">
          <div className="w-15 h-15 rounded-2xl overflow-hidden border-2 border-green-300 bg-[#E5F3E9] shrink-0 shadow-sm relative">
            <Image
              src="/images/avatar.jpg"
              alt={displayName}
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{displayName}</h2>
              <span className="px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 text-[10px] font-bold">
                सत्यापित
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#1B7A3D]" />
              {displayLocation}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">
              📱 {displayPhone} • 🌾 {displayLand}
            </p>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 px-4 py-3 divide-y divide-gray-100 overflow-y-auto pb-28">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 px-2 rounded-xl transition-colors active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="text-gray-600">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="text-[14px] font-medium text-gray-800">{item.title}</span>
              </div>

              <div className="flex items-center text-gray-400">
                {item.rightContent}
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}

        {/* Auth / Logout Button */}
        <div className="pt-2 space-y-2">
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full py-3 flex items-center justify-between text-left bg-emerald-50/60 hover:bg-emerald-50 px-3 rounded-xl transition-colors cursor-pointer text-emerald-800 font-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <LogIn className="w-4 h-4" />
                <span>{currentLanguage === "en" ? "Login with Another Phone / Supabase" : "दूसरे किसान आईडी से लॉगिन करें (Supabase Auth)"}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setActiveModal("logout_confirm")}
            className="w-full py-3 flex items-center justify-between text-left hover:bg-red-50/50 px-3 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-red-500">
              <LogOut className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-semibold">{currentLanguage === "en" ? "Sign Out" : "लॉगआउट (Sign Out)"}</span>
            </div>
          </button>
        </div>
      </div>

      {/* MODAL: Language Picker */}
      {activeModal === "language" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Select Language / भाषा चुनें</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {[
                { code: "hi", name: "हिंदी (Hindi)", sub: "हिन्दी में सलाह प्राप्त करें" },
                { code: "mr", name: "मराठी (Marathi)", sub: "मराठीत सल्ला मिळवा" },
                { code: "en", name: "English", sub: "Receive advisory in English" },
              ].map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setActiveModal(null);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#1B7A3D] bg-green-50 text-[#1B7A3D]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{lang.name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{lang.sub}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#1B7A3D] flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: My Profile */}
      {activeModal === "profile" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {currentLanguage === "en" ? "Farmer Profile Details" : "किसान प्रोफ़ाइल विवरण"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">किसान का नाम</span>
                <span className="text-sm font-bold text-gray-800">{displayName}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">फ़ोन / आईडी</span>
                <span className="text-sm font-bold text-gray-800">{displayPhone}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">गांव व जिला</span>
                <span className="text-sm font-bold text-gray-800">{displayLocation}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">कुल रकबा (जमीन)</span>
                <span className="text-sm font-bold text-gray-800">{displayLand}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">डेटाबेस स्थिति</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Supabase Cloud Synced
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] transition-all cursor-pointer"
            >
              {currentLanguage === "en" ? "Close" : "बंद करें"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Notifications Settings */}
      {activeModal === "notifications" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {currentLanguage === "en" ? "Notification Alerts" : "मौसम व कीट सूचनाएं"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-gray-50 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-800">भारी बारिश व पाला अलर्ट</p>
                  <p className="text-xs text-gray-500">मौसम विभाग की 48 घंटे की चेतावनी</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifWeather}
                  onChange={(e) => setNotifWeather(e.target.checked)}
                  className="w-5 h-5 accent-[#1B7A3D] cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-800">कीट व रोग प्रकोप चेतावनी</p>
                  <p className="text-xs text-gray-500">क्षेत्रीय फसलों पर रोग चेतावनी</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPest}
                  onChange={(e) => setNotifPest(e.target.checked)}
                  className="w-5 h-5 accent-[#1B7A3D] cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] transition-all cursor-pointer"
            >
              {currentLanguage === "en" ? "Save Preferences" : "पसंद सहेजें"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Help & Support */}
      {activeModal === "help" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {currentLanguage === "en" ? "Help & Support" : "किसान सहायता"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="tel:18001801551"
                className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3.5 text-[#1B7A3D] font-bold text-sm hover:bg-green-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <div>
                  <p className="leading-tight">किसान कॉल सेंटर (Toll Free)</p>
                  <p className="text-xs text-green-700 font-medium mt-0.5">1800-180-1551 (सुबह 6 से रात 10 बजे)</p>
                </div>
              </a>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] transition-all cursor-pointer"
            >
              {currentLanguage === "en" ? "Close" : "बंद करें"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: About DRISHTI */}
      {activeModal === "about" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">About DRISHTI</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-2 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-md">
                <Image src="/images/logo.jpg" alt="DRISHTI Logo" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">DRISHTI AI</h3>
              <p className="text-xs text-gray-500 font-medium">Sustainable Precision Agriculture Assistant</p>
              <div className="p-3 bg-gray-50 rounded-2xl text-xs text-gray-600 leading-relaxed text-left font-medium">
                दृष्टि AI भारतीय किसानों के लिए सटीक सिंचाई, खाद बचत, पत्ता रोग पहचान और बहुभाषी आवाज़ सहायता प्रदान करता है।
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] transition-all cursor-pointer"
            >
              {currentLanguage === "en" ? "Close" : "बंद करें"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Logout Confirm */}
      {activeModal === "logout_confirm" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900">
              {currentLanguage === "en" ? "Confirm Logout" : "लॉगआउट की पुष्टि करें"}
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              {currentLanguage === "en" ? "Are you sure you want to log out?" : "क्या आप वाकई लॉगआउट करना चाहते हैं?"}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 cursor-pointer"
              >
                {currentLanguage === "en" ? "Cancel" : "रद्द करें"}
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  onLogout();
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 cursor-pointer"
              >
                {currentLanguage === "en" ? "Logout" : "लॉगआउट"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
