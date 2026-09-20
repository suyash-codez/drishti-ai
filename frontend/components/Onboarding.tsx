"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { 
  ChevronLeft, 
  Check, 
  User, 
  Phone, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { signInFarmer, signUpFarmer, signInWithGoogle, FarmerProfile } from "../lib/supabase";

interface OnboardingProps {
  onComplete: (language: string, profile?: FarmerProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLang, setSelectedLang] = useState("hi");

  // Step 3 Auth States
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [villageDistrict, setVillageDistrict] = useState("");
  const [landSize, setLandSize] = useState<number>(3.0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Multi-Slide Onboarding State (Slides 1, 2, 3)
  const [introSlide, setIntroSlide] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);

  const introSlides = [
    {
      bgImage: "/images/onboarding_bg_1.jpg",
      title: ["हर किसान के साथ", "हर कदम पर"],
      subtitle: ["सही जानकारी, बेहतर फैसले", "और आसान खेती के लिए"],
      cta: "शुरू करें",
    },
    {
      bgImage: "/images/onboarding_bg_2.jpg",
      title: ["मौसम की सही जानकारी", "हमेशा आपके साथ"],
      subtitle: ["अपने क्षेत्र का मौसम, तापमान और", "बारिश की जानकारी पाएं"],
      cta: "आगे बढ़ें",
    },
    {
      bgImage: "/images/onboarding_bg_3.jpg",
      title: ["फसल की बेहतर देखभाल", "और सही सलाह"],
      subtitle: ["बीज, खाद, रोग पहचान और खेती से जुड़ी", "विशेष जानकारी, आपकी भाषा में"],
      cta: "आगे बढ़ें",
      hasSkip: true,
    },
  ];

  const handleNextIntroSlide = () => {
    if (introSlide < 2) {
      setIntroSlide((prev) => prev + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNextIntroSlide();
    } else if (diff < -45) {
      if (introSlide > 0) {
        setIntroSlide((prev) => prev - 1);
      }
    }
    touchStartX.current = null;
  };

  const handleGetStarted = () => {
    setStep(2);
  };

  const handleLanguageSelected = () => {
    setStep(3);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (selectedLang === "en" ? "Google login failed" : "Google लॉगिन विफल रहा"));
      setIsGoogleLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!identifier.trim()) {
      setErrorMsg(selectedLang === "en" ? "Please enter phone number or email" : "कृपया मोबाइल नंबर या ईमेल दर्ज करें");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg(selectedLang === "en" ? "PIN / Password must be at least 6 characters" : "पिन / पासवर्ड कम से कम 6 अंकों का होना चाहिए");
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === "signin") {
        const { data, error } = await signInFarmer(identifier, password);
        if (error || !data?.user) {
          setErrorMsg(error || (selectedLang === "en" ? "Account not found. Please create an account first." : "यह खाता नहीं मिला। कृपया पहले 'नया खाता बनाएं' चुनें।"));
          setIsLoading(false);
          return;
        }

        const user = data.user;
        const meta = user?.user_metadata || {};
        const profile: FarmerProfile = {
          id: user.id,
          email: user.email,
          phone: identifier.includes("@") ? meta.phone : identifier,
          full_name: meta.full_name || (identifier.includes("@") ? identifier.split("@")[0] : `किसान (${identifier.slice(-4)})`),
          village_district: meta.village_district || (selectedLang === "en" ? "Indore, MP" : "इंदौर, मध्य प्रदेश"),
          state: meta.state || "मध्य प्रदेश",
          language: selectedLang,
          land_size_acres: meta.land_size_acres || 3.0,
        };

        setSuccessMsg(selectedLang === "en" ? "Login successful! Welcome." : "सफलतापूर्वक लॉगिन हो गया!");
        setTimeout(() => {
          onComplete(selectedLang, profile);
        }, 500);

      } else {
        // Sign Up
        if (!fullName.trim()) {
          setErrorMsg(selectedLang === "en" ? "Please enter your name" : "कृपया अपना पूरा नाम दर्ज करें");
          setIsLoading(false);
          return;
        }

        const { data, error } = await signUpFarmer(identifier, password, {
          fullName,
          villageDistrict: villageDistrict || (selectedLang === "en" ? "Indore, MP" : "इंदौर, मध्य प्रदेश"),
          state: "मध्य प्रदेश",
          language: selectedLang,
          landSize,
        });

        if (error) {
          setErrorMsg(error);
          setIsLoading(false);
          return;
        }

        const user = data?.user;
        const profile: FarmerProfile = {
          id: user?.id || `user_${Date.now()}`,
          email: user?.email,
          phone: identifier.includes("@") ? "" : identifier,
          full_name: fullName,
          village_district: villageDistrict || (selectedLang === "en" ? "Indore, MP" : "इंदौर, मध्य प्रदेश"),
          state: "मध्य प्रदेश",
          language: selectedLang,
          land_size_acres: landSize,
        };

        setSuccessMsg(selectedLang === "en" ? "Account created successfully!" : "खाता सफलतापूर्वक बन गया!");
        setTimeout(() => {
          onComplete(selectedLang, profile);
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "प्रमाणीकरण विफल रहा");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (farmerName: string, phone: string, location: string, acres: number) => {
    setIdentifier(phone);
    setPassword("kisan123");
    setIsLoading(true);
    setErrorMsg("");

    try {
      const signInRes = await signInFarmer(phone, "kisan123");
      let userId = signInRes.data?.user?.id;

      if (signInRes.error || !userId) {
        const signResult = await signUpFarmer(phone, "kisan123", {
          fullName: farmerName,
          villageDistrict: location,
          landSize: acres,
        });
        userId = signResult.data?.user?.id;
      }

      const profile: FarmerProfile = {
        id: userId || `demo_${phone}`,
        phone,
        full_name: farmerName,
        village_district: location,
        state: "मध्य प्रदेश",
        language: selectedLang,
        land_size_acres: acres,
      };

      setSuccessMsg(`स्वागत है, ${farmerName}!`);
      setTimeout(() => {
        onComplete(selectedLang, profile);
      }, 400);
    } catch {
      const profile: FarmerProfile = {
        id: `demo_${phone}`,
        phone,
        full_name: farmerName,
        village_district: location,
        state: "मध्य प्रदेश",
        language: selectedLang,
        land_size_acres: acres,
      };
      onComplete(selectedLang, profile);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 1: Interactive 3-Slide Onboarding (Pristine Full-Bleed Artwork + 100% Coded UI)
  if (step === 1) {
    const currentData = introSlides[introSlide];
    return (
      <div 
        className="relative w-full h-full flex-1 flex flex-col justify-between overflow-hidden select-none bg-[#C2E3F2]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-Bleed Background Illustrations with Smooth Cross-Fade */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {introSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                introSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={slide.bgImage}
                alt={slide.title[0]}
                fill
                priority={idx === 0}
                sizes="(max-width: 420px) 100vw, 420px"
                className="object-cover object-center"
              />
              {/* Soft gradient at the top so brand & headings are crystal-clear and legible */}
              <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white/80 via-white/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* TOP BRAND & HEADINGS AREA (100% Coded DOM) */}
        <div className="relative z-20 flex flex-col items-center pt-5 sm:pt-7 px-4 text-center">
          {/* Back Arrow for Slides 1 & 2 */}
          {introSlide > 0 && (
            <button
              type="button"
              onClick={() => setIntroSlide((prev) => (prev > 0 ? prev - 1 : 0))}
              aria-label="पिछला पृष्ठ"
              className="absolute top-5 left-4 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Drishti Brand Squircle Card & Wordmark */}
          <div className="flex flex-col items-center mb-1">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-emerald-900/10 flex items-center justify-center mb-1.5 backdrop-blur-md">
              <svg className="w-6 h-6 text-[#1B7A3D]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-1.5 2-2.5 4.5-2.5 7 0 2.5 1.5 4.5 2.5 5 1-0.5 2.5-2.5 2.5-5 0-2.5-1-5-2.5-7z" />
                <path d="M7.5 10c-2 0.5-3.5 2.2-3.5 4.2 0 2.2 2 3.8 4 3.8 1 0 2-.5 2.5-1.2-0.5-2.2-1.5-5-3-6.8z" />
                <path d="M16.5 10c-1.5 1.8-2.5 4.6-3 6.8 0.5 0.7 1.5 1.2 2.5 1.2 2 0 4-1.6 4-3.8 0-2-1.5-3.7-3.5-4.2z" />
              </svg>
            </div>
            <h2 className="text-[17px] font-black text-[#1B7A3D] tracking-wider leading-none">
              DRISHTI
            </h2>
            <p className="text-[11px] font-bold text-[#235836] mt-1 tracking-tight">
              आपकी खेती का साथी
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-[25px] sm:text-[27px] font-black text-[#0D2417] leading-[1.22] tracking-tight mt-2 drop-shadow-xs">
            {currentData.title[0]}<br />{currentData.title[1]}
          </h1>

          {/* Subtitle */}
          <p className="text-[13px] sm:text-[13.5px] font-semibold text-[#183E26] leading-snug mt-1.5 max-w-[320px]">
            {currentData.subtitle[0]}<br />{currentData.subtitle[1]}
          </p>
        </div>

        {/* MIDDLE SPACER: Allows the beautiful illustration to shine freely without obstruction */}
        <div className="relative z-10 w-full flex-1 pointer-events-none min-h-[160px]" />

        {/* BOTTOM WHITE CURVED DOME SECTION (100% Coded DOM) */}
        <div className="relative z-20 w-full bg-white rounded-t-[36px] sm:rounded-t-[42px] px-6 pt-5 pb-6 sm:pb-7 shadow-[0_-12px_36px_rgba(15,35,20,0.12)] flex flex-col items-center text-center">
          {/* Tagline for Slide 0 */}
          {introSlide === 0 && (
            <p className="text-[13px] sm:text-[13.5px] font-semibold text-[#22442E] leading-relaxed max-w-[290px] mb-3.5">
              सही जानकारी से बेहतर फैसले लें<br />और अपनी खेती को आसान बनाएं।
            </p>
          )}

          {/* Clickable Progress Dots: — • • */}
          <div className="flex items-center gap-1.5 mb-4" aria-label={`Slide ${introSlide + 1} of 3`}>
            {[0, 1, 2].map((dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setIntroSlide(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  introSlide === dotIdx ? "w-7 bg-[#1B7A3D]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleNextIntroSlide}
            className="w-full max-w-[340px] bg-[#1B7A3D] hover:bg-[#156030] active:scale-[0.98] text-white font-bold py-3.5 sm:py-4 rounded-full text-[16px] sm:text-[17px] shadow-lg shadow-[#1B7A3D]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{currentData.cta}</span>
            <span className="text-xl leading-none">→</span>
          </button>

          {/* Slide 2 'बाद में' (Skip) Button */}
          {introSlide === 2 ? (
            <button
              type="button"
              onClick={handleGetStarted}
              className="mt-2 text-[13px] font-semibold text-gray-500 hover:text-gray-900 active:scale-95 transition cursor-pointer px-4 py-1"
            >
              बाद में
            </button>
          ) : (
            <div className="h-5 mt-1" />
          )}
        </div>
      </div>
    );
  }

  // STEP 2: Language Selection
  if (step === 2) {
    return (
      <div className="relative w-full h-full flex flex-col bg-white">
        <div className="flex justify-between items-center p-6 pt-12">
          <button onClick={() => setStep(1)} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xs font-bold text-gray-400">चरण 2 / 3</span>
        </div>

        <div className="px-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-black text-[#1A1D1A] mb-2">अपनी भाषा चुनें</h2>
          <p className="text-sm text-gray-500 font-medium mb-8">
            Select your preferred language for advice and voice support
          </p>

          <div className="space-y-4">
            {/* Hindi */}
            <div
              onClick={() => setSelectedLang("hi")}
              className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between border-2 transition-all ${
                selectedLang === "hi"
                  ? "border-[#1B7A3D] bg-[#F2F9F4]"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E5F3E9] flex items-center justify-center text-xl">
                  🍀
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">हिंदी (Hindi)</h3>
                  <p className="text-xs text-gray-500 font-medium">अपनी भाषा में पूरी सलाह पाएं</p>
                </div>
              </div>
              {selectedLang === "hi" && (
                <div className="w-6 h-6 rounded-full bg-[#1B7A3D] flex items-center justify-center text-white">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              )}
            </div>

            {/* English */}
            <div
              onClick={() => setSelectedLang("en")}
              className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between border-2 transition-all ${
                selectedLang === "en"
                  ? "border-[#1B7A3D] bg-[#F2F9F4]"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                  🌾
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">English</h3>
                  <p className="text-xs text-gray-500 font-medium">Use in English with voice guidance</p>
                </div>
              </div>
              {selectedLang === "en" && (
                <div className="w-6 h-6 rounded-full bg-[#1B7A3D] flex items-center justify-center text-white">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="p-6 mt-auto">
          <button
            onClick={handleLanguageSelected}
            className="w-full bg-[#1B7A3D] text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-[#1B7A3D]/30 flex justify-center items-center gap-2 hover:bg-[#156030] transition-colors active:scale-95 cursor-pointer"
          >
            {selectedLang === "en" ? "Next (Login / Sign Up) →" : "आगे बढ़ें (खाता बनाएं / लॉगिन) →"}
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Farmer Authentication (Login / Register / Quick Demo)
  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-10 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
        <button onClick={() => setStep(2)} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold text-gray-400">चरण 3 / 3</span>
      </div>

      <div className="p-6 space-y-4 max-w-md mx-auto w-full">
        {/* Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#1B7A3D] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Supabase Cloud Database</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {authMode === "signup"
              ? (selectedLang === "en" ? "Create Farmer Profile" : "नया किसान खाता बनाएं")
              : (selectedLang === "en" ? "Farmer Login" : "किसान लॉगिन")}
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {authMode === "signup"
              ? (selectedLang === "en" ? "Register your details to save farm fields & advisory" : "अपने खेत, फसल और सलाह का हिसाब सुरक्षित रखने के लिए खाता बनाएं")
              : (selectedLang === "en" ? "Sign in with your mobile / email and PIN" : "अपने मोबाइल नंबर व 6-अंकों के पिन से लॉगिन करें")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode("signup"); setErrorMsg(""); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              authMode === "signup" ? "bg-[#1B7A3D] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {selectedLang === "en" ? "1. Create New Account" : "1. नया खाता बनाएं (Sign Up)"}
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("signin"); setErrorMsg(""); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              authMode === "signin" ? "bg-[#1B7A3D] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {selectedLang === "en" ? "2. Sign In" : "2. लॉगिन करें (Sign In)"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5 pt-1">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorMsg("");
                  }}
                  className="text-emerald-700 underline font-bold pl-6 block text-[11px] hover:text-emerald-800 cursor-pointer"
                >
                  👉 नया किसान खाता बनाने के लिए यहाँ टैप करें
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Continue with Google button */}
          <button
            type="button"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-700 font-bold text-sm shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>
                  {selectedLang === "en" ? "Continue with Google" : "Google से जारी रखें"}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {selectedLang === "en" ? "or" : "या"}
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {authMode === "signup" && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {selectedLang === "en" ? "Farmer Full Name" : "किसान का पूरा नाम"} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedLang === "en" ? "e.g. Suyash Verma" : "उदा. सुयश वर्मा / रमेश पटेल"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D] text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {selectedLang === "en" ? "Village / District" : "गांव / जिला व राज्य"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={villageDistrict}
                    onChange={(e) => setVillageDistrict(e.target.value)}
                    placeholder={selectedLang === "en" ? "e.g. Indore, Madhya Pradesh" : "उदा. इंदौर / धार (मध्य प्रदेश)"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D] text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {selectedLang === "en" ? "Total Land Area (Acres)" : "कुल जमीन (एकड़ में)"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={landSize}
                  onChange={(e) => setLandSize(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D] text-gray-800"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {selectedLang === "en" ? "Mobile Number or Email" : "मोबाइल नंबर या ईमेल"} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={selectedLang === "en" ? "9876543210 or email" : "9876543210 या ईमेल"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D] text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {selectedLang === "en" ? "6-Digit Secret PIN or Password" : "6-अंकों का गुप्त पिन या पासवर्ड"} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D] text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#1B7A3D] text-white font-bold text-base shadow-lg shadow-green-900/15 hover:bg-[#166533] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>
                  {authMode === "signup"
                    ? (selectedLang === "en" ? "Create Account & Enter App" : "खाता बनाएं और ऐप में प्रवेश करें")
                    : (selectedLang === "en" ? "Sign In & Continue" : "लॉगिन करें और आगे बढ़ें")}
                </span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Tap Demo Testing Option for Judges */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-center mt-4">
          <p className="text-[11px] font-bold text-gray-500 mb-2.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{selectedLang === "en" ? "Quick 1-Click Demo Profiles:" : "⚡ तुरंत डेमो किसान लॉगिन (1-क्लिक):"}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("रमेश पटेल (मालवा)", "9826012345", "उज्जैन / धार (म.प्र.)", 4.5)}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-[#1B7A3D] transition flex items-center justify-center shadow-2xs cursor-pointer"
            >
              <span>👨‍🌾 रमेश (4.5 एकड़)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("सुरेश धाकड़ (निमाड़)", "9826098765", "खरगोन / खंडवा (म.प्र.)", 2.0)}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-blue-500 transition flex items-center justify-center shadow-2xs cursor-pointer"
            >
              <span>👨‍🌾 सुरेश (2.0 एकड़)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
