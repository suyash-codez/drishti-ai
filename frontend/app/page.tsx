"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { RecommendationWizard } from "../components/RecommendationWizard";
import { ResultCard } from "../components/ResultCard";
import { BottomNav, TabType } from "../components/BottomNav";
import { VoiceButton } from "../components/VoiceButton";
import { CropDiseaseModal } from "../components/CropDiseaseModal";
import { HistoryList, SessionItem } from "../components/HistoryList";
import { HomeDashboard } from "../components/HomeDashboard";
import { AlertsTab } from "../components/AlertsTab";
import { MyFieldsTab } from "../components/MyFieldsTab";
import { ProfileTab } from "../components/ProfileTab";
import { LearnTab } from "../components/LearnTab";
import { AuthModal } from "../components/AuthModal";
import { fetchRecommendation, RecommendRequest, RecommendResponse } from "../lib/api";
import { ParsedVoiceData } from "../lib/voiceParser";
import { 
  supabase, 
  FarmerProfile, 
  getFarmerProfile, 
  saveFarmerAdvisoryRecord, 
  fetchFarmerAdvisories, 
  signOutFarmer 
} from "../lib/supabase";

import { Onboarding } from "../components/Onboarding";

import enLocale from "../locales/en.json";
import hiLocale from "../locales/hi.json";
import mrLocale from "../locales/mr.json";

const LOCALES: Record<string, Record<string, string>> = {
  hi: hiLocale,
  en: enLocale,
  mr: mrLocale,
};

export default function Home() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("hi");
  const [labels, setLabels] = useState<Record<string, string>>(hiLocale);
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // Supabase Auth & Farmer Profile State
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Recommendation State
  const [recommendation, setRecommendation] = useState<RecommendResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<RecommendRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [voiceSheetOpen, setVoiceSheetOpen] = useState<boolean>(false);
  const [diseaseModalOpen, setDiseaseModalOpen] = useState<boolean>(false);
  const [formPrefill, setFormPrefill] = useState<ParsedVoiceData>({});

  // Ref for scrolling to results
  const resultRef = useRef<HTMLDivElement>(null);

  // Session History
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  // Init: Check Auth and Saved Local Data
  useEffect(() => {
    const savedOnboarded = localStorage.getItem("drishti_onboarded");
    const savedLang = localStorage.getItem("drishti_lang");
    const savedSessions = localStorage.getItem("drishti_sessions");
    
    if (savedLang) {
      setCurrentLanguage(savedLang);
    }
    
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to parse saved sessions", e);
      }
    }
    
    if (savedOnboarded === "true") {
      setIsOnboarded(true);
    } else {
      setIsOnboarded(false);
    }

    // Clean OAuth hash and error query params from URL
    if (typeof window !== "undefined" && (window.location.hash.includes("access_token") || window.location.search.includes("error"))) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Check Supabase Active Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem("drishti_onboarded", "true");
        setIsOnboarded(true);
        getFarmerProfile(session.user.id).then((profile) => {
          if (profile) {
            setFarmerProfile(profile);
            loadFarmerAdvisoryHistory(profile.id);
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem("drishti_onboarded", "true");
        setIsOnboarded(true);
        getFarmerProfile(session.user.id).then((profile) => {
          if (profile) {
            setFarmerProfile(profile);
            loadFarmerAdvisoryHistory(profile.id);
          }
        });
      } else {
        setFarmerProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadFarmerAdvisoryHistory = async (userId: string) => {
    try {
      const records = await fetchFarmerAdvisories(userId);
      if (records && records.length > 0) {
        const mappedSessions: SessionItem[] = records.map((r) => ({
          id: r.id,
          crop_type: r.crop_type,
          summary: `${r.irrigation_mm} mm • ${r.fertilizer_type} ${r.fertilizer_amount_kg} kg/ha`,
          water_saved_liters: r.water_saved_liters,
          cost_saved_rupees: r.cost_saved_rupees,
          alert_level: r.alert_level,
          created_at: new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        }));
        setSessions(mappedSessions);
      }
    } catch (e) {
      console.warn("Could not load advisory history from Supabase:", e);
    }
  };

  // Sync labels when language changes
  useEffect(() => {
    const selected = LOCALES[currentLanguage] || hiLocale;
    setLabels(selected);
  }, [currentLanguage]);

  const handleRecommendSubmit = async (data: RecommendRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastRequest(data);

    try {
      const res = await fetchRecommendation(data);
      setRecommendation(res);

      const newSession: SessionItem = {
        id: `sess_${Date.now()}`,
        crop_type: data.crop_type,
        summary: `${res.irrigation_recommendation.amount_mm} mm • ${res.fertilizer_recommendation.type} ${res.fertilizer_recommendation.amount_kg_per_acre} kg/ha`,
        water_saved_liters: res.water_saved_liters,
        cost_saved_rupees: res.cost_saved_rupees,
        alert_level: res.alert_level,
        created_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      };

      // Save to Supabase cloud database if logged in
      if (farmerProfile?.id) {
        saveFarmerAdvisoryRecord(farmerProfile.id, {
          crop_type: data.crop_type,
          growth_stage: data.growth_stage,
          soil_moisture: data.soil_moisture,
          temperature: data.temperature,
          rainfall: data.rainfall,
          irrigation_mm: res.irrigation_recommendation.amount_mm,
          irrigation_timing: res.irrigation_recommendation.timing,
          fertilizer_type: res.fertilizer_recommendation.type,
          fertilizer_amount_kg: res.fertilizer_recommendation.amount_kg_per_acre,
          cost_saved_rupees: res.cost_saved_rupees,
          water_saved_liters: res.water_saved_liters,
          alert_level: res.alert_level,
        });
      }

      setSessions((prev) => {
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem("drishti_sessions", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save sessions", e);
        }
        return updated;
      });

      // Scroll to results after a small delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err: any) {
      console.error("Recommendation failed:", err);
      setErrorMessage(err.message || "Failed to fetch recommendation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyVoiceData = (data: ParsedVoiceData) => {
    setFormPrefill(data);
    setRecommendation(null);
    setActiveTab("advisory");
  };

  const handleDashboardAction = (action: string) => {
    if (action === "voice") {
      setVoiceSheetOpen(true);
    } else if (action === "scanner") {
      setDiseaseModalOpen(true);
    } else if (action === "advisory") {
      setRecommendation(null);
      setActiveTab("advisory");
    } else {
      setActiveTab(action as TabType);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "scanner") {
      setDiseaseModalOpen(true);
    }
  };

  const handleOnboardingComplete = (lang: string, profile?: FarmerProfile) => {
    setCurrentLanguage(lang);
    localStorage.setItem("drishti_lang", lang);
    localStorage.setItem("drishti_onboarded", "true");
    setIsOnboarded(true);
    setActiveTab("home");
    // Set farmer profile from onboarding auth step
    if (profile) {
      setFarmerProfile(profile);
      loadFarmerAdvisoryHistory(profile.id);
    }
  };

  const handleFarmerAuthSuccess = (profile: FarmerProfile) => {
    setFarmerProfile(profile);
    loadFarmerAdvisoryHistory(profile.id);
  };

  const handleFarmerLogout = async () => {
    await signOutFarmer();
    setFarmerProfile(null);
    localStorage.removeItem("drishti_onboarded");
    setIsOnboarded(false);
    setActiveTab("home");
  };

  if (isOnboarded === null) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center" />;
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-muted)] overflow-y-auto pb-20 relative scroll-smooth">
      {/* Header - Only show if not on Home screen and not in Wizard */}
      {activeTab !== "home" && activeTab !== "advisory" && (
        <Navbar
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          labels={labels}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${activeTab !== "home" && activeTab !== "advisory" ? "max-w-xl mx-auto px-4 py-5 space-y-4 w-full" : "w-full"}`}>
        
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-[var(--alert-red-bg)] border border-[var(--alert-red)] flex items-center justify-between gap-3 animate-in fade-in duration-200 m-4">
            <span className="text-[14px] font-medium text-[#9B1D22]">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[13px] font-bold text-[var(--alert-red)] hover:underline shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB: Home Dashboard */}
        {activeTab === "home" && (
          <HomeDashboard
            onAction={handleDashboardAction}
            labels={labels}
            currentLanguage={currentLanguage}
            onLanguageChange={(lang) => {
              setCurrentLanguage(lang);
              localStorage.setItem("drishti_lang", lang);
            }}
            farmerProfile={farmerProfile}
          />
        )}

        {/* TAB: Advisory (Wizard + Results) */}
        {activeTab === "advisory" && (
          <div className="h-full">
            {!recommendation ? (
              <RecommendationWizard
                currentLanguage={currentLanguage}
                labels={labels}
                isLoading={isLoading}
                onSubmit={handleRecommendSubmit}
                onBack={() => setActiveTab("home")}
                initialData={formPrefill}
                onLanguageChange={(lang) => {
                  setCurrentLanguage(lang);
                  localStorage.setItem("drishti_lang", lang);
                }}
              />
            ) : (
              <div className="h-full" ref={resultRef}>
                <ResultCard
                  data={recommendation}
                  cropName={lastRequest?.crop_type || "wheat"}
                  labels={labels}
                  currentLanguage={currentLanguage}
                  onBack={() => setRecommendation(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB: History */}
        {activeTab === "history" && (
          <HistoryList
            sessions={sessions}
            onBack={() => setActiveTab("home")}
          />
        )}

        {/* TAB: Scanner — handled by modal, show CTA card */}
        {activeTab === "scanner" && (
          <div className="bg-white border border-[var(--border)] rounded-2xl p-8 text-center space-y-4 m-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              पत्ता रोग स्कैनर
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              पत्ते की तस्वीर अपलोड करें — AI बीमारी पहचानकर उपचार सलाह देगा
            </p>
            <button
              type="button"
              onClick={() => setDiseaseModalOpen(true)}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent-blue)] text-white text-[15px] font-semibold hover:brightness-110 transition active:scale-[0.97] cursor-pointer"
            >
              📸 स्कैनर खोलें
            </button>
          </div>
        )}

        {/* TAB: Alerts */}
        {activeTab === "alerts" && (
          <AlertsTab
            onBack={() => setActiveTab("home")}
            labels={labels}
            currentLanguage={currentLanguage}
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
          />
        )}

        {/* TAB: Fields */}
        {activeTab === "fields" && (
          <MyFieldsTab
            onBack={() => setActiveTab("home")}
            onSelectField={(field) => {
              setFormPrefill({ crop_type: field.cropKey });
              setActiveTab("advisory");
            }}
            labels={labels}
            currentLanguage={currentLanguage}
            userId={farmerProfile?.id || "default_farmer"}
          />
        )}

        {/* TAB: Profile */}
        {activeTab === "profile" && (
          <ProfileTab
            currentLanguage={currentLanguage}
            onLanguageChange={(lang) => {
              setCurrentLanguage(lang);
              localStorage.setItem("drishti_lang", lang);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onLogout={handleFarmerLogout}
            onBack={() => setActiveTab("home")}
            labels={labels}
            farmerProfile={farmerProfile}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* TAB: Learn */}
        {activeTab === "learn" && (
          <LearnTab
            onBack={() => setActiveTab("home")}
            labels={labels}
            currentLanguage={currentLanguage}
          />
        )}
      </main>

      {/* Voice Assistant Modal & FAB */}
      <VoiceButton
        currentLanguage={currentLanguage}
        labels={labels}
        onApplyData={handleApplyVoiceData}
        onNavigate={handleDashboardAction}
        isOpen={voiceSheetOpen}
        onClose={() => setVoiceSheetOpen(false)}
        onOpen={() => setVoiceSheetOpen(true)}
        showFab={activeTab !== "home" && activeTab !== "advisory"}
      />

      {/* Bottom Navigation - Hidden during active advisory flow for full screen experience */}
      {activeTab !== "advisory" && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Crop Disease Modal */}
      <CropDiseaseModal
        isOpen={diseaseModalOpen}
        onClose={() => setDiseaseModalOpen(false)}
        labels={labels}
        currentLanguage={currentLanguage}
      />

      {/* Supabase Farmer Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleFarmerAuthSuccess}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
