"use client";

import React, { useState } from "react";
import { User, Lock, Phone, MapPin, Sparkles, Loader2, AlertCircle, CheckCircle2, ChevronRight, X, ShieldCheck } from "lucide-react";
import { signInFarmer, signUpFarmer, signInWithGoogle, FarmerProfile } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: FarmerProfile) => void;
  currentLanguage: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentLanguage,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [villageDistrict, setVillageDistrict] = useState("");
  const [landSize, setLandSize] = useState<number>(3.0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

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
      setErrorMsg(err.message || "Google लॉगिन विफल रहा");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!identifier.trim()) {
      setErrorMsg(currentLanguage === "en" ? "Please enter phone number or email" : "कृपया मोबाइल नंबर या ईमेल दर्ज करें");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg(currentLanguage === "en" ? "Password / PIN must be at least 6 characters" : "पासवर्ड या पिन कम से कम 6 अंकों का होना चाहिए");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        const { data, error } = await signInFarmer(identifier, password);
        if (error || !data?.user) {
          setErrorMsg(error || (currentLanguage === "en" ? "Account not found. Please register first." : "यह खाता नहीं मिला। कृपया पहले 'नया खाता बनाएं' पर क्लिक करें।"));
          setIsLoading(false);
          return;
        }

        const user = data.user;
        const meta = user?.user_metadata || {};
        const profile: FarmerProfile = {
          id: user?.id || `user_${Date.now()}`,
          email: user?.email,
          phone: identifier.includes("@") ? meta.phone : identifier,
          full_name: meta.full_name || (identifier.includes("@") ? identifier.split("@")[0] : `किसान (${identifier.slice(-4)})`),
          village_district: meta.village_district || "इंदौर / धार (म.प्र.)",
          state: meta.state || "मध्य प्रदेश",
          language: currentLanguage,
          land_size_acres: meta.land_size_acres || 3.0,
        };

        setSuccessMsg(currentLanguage === "en" ? "Login successful!" : "सफलतापूर्वक लॉगिन हो गया!");
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 500);

      } else {
        // Sign up
        if (!fullName.trim()) {
          setErrorMsg(currentLanguage === "en" ? "Please enter your full name" : "कृपया अपना पूरा नाम दर्ज करें");
          setIsLoading(false);
          return;
        }

        const { data, error } = await signUpFarmer(identifier, password, {
          fullName,
          villageDistrict: villageDistrict || "इंदौर, मध्य प्रदेश",
          state: "मध्य प्रदेश",
          language: currentLanguage,
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
          village_district: villageDistrict || "इंदौर, मध्य प्रदेश",
          state: "मध्य प्रदेश",
          language: currentLanguage,
          land_size_acres: landSize,
        };

        setSuccessMsg(currentLanguage === "en" ? "Account created successfully!" : "खाता सफलतापूर्वक बन गया!");
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.warn("Auth error handled:", err);
      setErrorMsg(err.message || (currentLanguage === "en" ? "Authentication failed" : "लॉगिन / साइन-अप विफल रहा"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (farmerName: string, phone: string) => {
    setIdentifier(phone);
    setPassword("kisan123");
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Try signIn
      const signInRes = await signInFarmer(phone, "kisan123");
      let userId = signInRes.data?.user?.id;
      
      // 2. If not existing yet, automatically signUp
      if (signInRes.error || !userId) {
        const signResult = await signUpFarmer(phone, "kisan123", {
          fullName: farmerName,
          villageDistrict: "धार / उज्जैन, म.प्र.",
          landSize: 4.5,
        });
        userId = signResult.data?.user?.id;
      }

      const profile: FarmerProfile = {
        id: userId || `demo_${phone}`,
        phone,
        full_name: farmerName,
        village_district: "उज्जैन / धार (म.प्र.)",
        state: "मध्य प्रदेश",
        language: currentLanguage,
        land_size_acres: 4.5,
      };

      setSuccessMsg(`स्वागत है, ${farmerName}!`);
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 400);
    } catch (err: any) {
      const profile: FarmerProfile = {
        id: `demo_${phone}`,
        phone,
        full_name: farmerName,
        village_district: "उज्जैन / धार (म.प्र.)",
        state: "मध्य प्रदेश",
        language: currentLanguage,
        land_size_acres: 4.5,
      };
      onAuthSuccess(profile);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header with Green Gradient */}
        <div className="bg-gradient-to-br from-[#1B7A3D] to-[#145E2E] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-white/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-200">
              Supabase Secure Cloud
            </span>
          </div>

          <h2 className="text-xl font-bold">
            {mode === "signin" 
              ? (currentLanguage === "en" ? "Farmer Login" : "किसान लॉगिन") 
              : (currentLanguage === "en" ? "New Farmer Registration" : "नया किसान खाता बनाएं")}
          </h2>
          <p className="text-xs text-green-100 mt-1">
            {mode === "signin"
              ? (currentLanguage === "en" ? "Log in to view your saved fields and history" : "अपने खेत, फसल और सलाह का हिसाब सुरक्षित रखें")
              : (currentLanguage === "en" ? "Join DRISHTI to track water & fertilizer savings" : "ड्रिस्टी से जुड़ें और पानी व खाद की बचत करें")}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => { setMode("signin"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === "signin" ? "bg-white text-[#1B7A3D] shadow-xs" : "text-white/80 hover:text-white"
              }`}
            >
              {currentLanguage === "en" ? "Sign In" : "लॉगिन करें"}
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === "signup" ? "bg-white text-[#1B7A3D] shadow-xs" : "text-white/80 hover:text-white"
              }`}
            >
              {currentLanguage === "en" ? "Create Account" : "नया खाता बनाएं"}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
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
            className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-700 font-bold text-sm shadow-xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
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
                  {currentLanguage === "en" ? "Continue with Google" : "Google से जारी रखें"}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {currentLanguage === "en" ? "or" : "या"}
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {mode === "signup" && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {currentLanguage === "en" ? "Farmer Full Name" : "किसान का पूरा नाम"} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={currentLanguage === "en" ? "e.g. Ramesh Patel" : "उदा. रमेश पटेल"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {currentLanguage === "en" ? "Village / District" : "गांव / जिला"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={villageDistrict}
                    onChange={(e) => setVillageDistrict(e.target.value)}
                    placeholder={currentLanguage === "en" ? "e.g. Badnawar, Dhar" : "उदा. बड़नावर, धार (म.प्र.)"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {currentLanguage === "en" ? "Total Land (Acres)" : "कुल जमीन (एकड़ में)"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={landSize}
                  onChange={(e) => setLandSize(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {currentLanguage === "en" ? "Mobile Number or Email" : "मोबाइल नंबर या ईमेल"} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={currentLanguage === "en" ? "9876543210 or email" : "9876543210 या ईमेल"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {currentLanguage === "en" ? "Password or 6-digit PIN" : "पासवर्ड या 6-अंकों का पिन"} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1B7A3D]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm shadow-md hover:bg-[#166533] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{mode === "signin" ? (currentLanguage === "en" ? "Sign In Securely" : "सुरक्षित लॉगिन करें") : (currentLanguage === "en" ? "Create Farmer Profile" : "खाता बनाएं")}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option for Judges & Evaluators */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] font-bold text-gray-500 mb-2">
            {currentLanguage === "en" ? "⚡ Quick Demo Accounts (1-Tap Login):" : "⚡ तुरंत डेमो किसान लॉगिन (1-क्लिक):"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("रमेश पटेल (मालवा)", "9826012345")}
              className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-[#1B7A3D] transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>👨‍🌾 रमेश (4.5 एकड़)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("सुरेश धाकड़ (निमाड़)", "9826098765")}
              className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-blue-500 transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>👨‍🌾 सुरेश (2.0 एकड़)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
