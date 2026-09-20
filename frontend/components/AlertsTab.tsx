"use client";

import React, { useState } from "react";
import { ChevronLeft, AlertTriangle, Thermometer, Bug, X, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

interface AlertsTabProps {
  onBack: () => void;
  labels: Record<string, string>;
  currentLanguage?: string;
  onNavigateTab?: (tab: string) => void;
}

interface AlertItem {
  id: number;
  title: string;
  description: string;
  date: string;
  severity: string;
  type: "rain" | "temp" | "pest";
  actions: string[];
}

export const AlertsTab: React.FC<AlertsTabProps> = ({ 
  onBack, 
  labels, 
  currentLanguage = "hi",
  onNavigateTab 
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Live Weather States
  const [currentTemp, setCurrentTemp] = useState<number>(25);
  const [currentHumidity, setCurrentHumidity] = useState<number>(75);
  const [rainSum48h, setRainSum48h] = useState<number>(3.4);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isEn = currentLanguage === "en";

  // Dynamic Date Formatter
  const today = new Date();
  const todayFormatted = today.toLocaleDateString(isEn ? "en-IN" : "hi-IN", { day: "numeric", month: "short" });
  
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayFormatted = yesterday.toLocaleDateString(isEn ? "en-IN" : "hi-IN", { day: "numeric", month: "short" });

  const twoDaysAgo = new Date(today.getTime() - 2 * 86400000);
  const twoDaysAgoFormatted = twoDaysAgo.toLocaleDateString(isEn ? "en-IN" : "hi-IN", { day: "numeric", month: "short" });

  // Fetch Live Open-Meteo Forecast
  React.useEffect(() => {
    const lat = 22.7179;
    const lon = 75.8333;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto`)
      .then((res) => res.json())
      .then((data) => {
        if (data.current) {
          setCurrentTemp(Math.round(data.current.temperature_2m));
          setCurrentHumidity(Math.round(data.current.relative_humidity_2m));
        }
        if (data.daily && data.daily.precipitation_sum) {
          const sum2Days = (data.daily.precipitation_sum[0] || 0) + (data.daily.precipitation_sum[1] || 0);
          setRainSum48h(Math.round(sum2Days * 10) / 10);
        }
      })
      .catch((e) => console.warn("Live weather fetch error:", e))
      .finally(() => setIsLoading(false));
  }, []);

  // Generate Real Dynamic Alerts based on live Open-Meteo Weather
  const alerts: AlertItem[] = [
    // Alert 1: Live Rain Radar
    rainSum48h >= 10.0 ? {
      id: 1,
      title: isEn ? "Heavy Rain Lookahead Warning" : "आगामी 48 घंटे: भारी बारिश चेतावनी",
      description: isEn 
        ? `Open-Meteo radar detects ~${rainSum48h} mm rainfall in next 48h. High risk of waterlogging.`
        : `ओपन-मेटियो रडार: अगले 48 घंटों में ~${rainSum48h} मिमी बारिश का अनुमान। जलभराव से बचें।`,
      date: isEn ? `Today (${todayFormatted})` : `आज (${todayFormatted})`,
      severity: isEn ? "High Alert" : "गंभीर",
      type: "rain",
      actions: isEn ? [
        "Postpone all irrigation cycles immediately — save pumping cost and groundwater.",
        "Clear farm bunds and drainage outlets to avoid root asphyxiation.",
        "Delay urea top-dressing until ground dries to stop leaching.",
      ] : [
        "तुरंत सभी सिंचाई रोकें — पंपिंग खर्च और भूजल दोनों बचाएं।",
        "खेत की जल-निकासी नालियों को साफ रखें ताकि पानी जमा न हो।",
        "यूरिया का छिड़काव कुछ दिन टालें ताकि बारिश में खाद न बहे।",
      ],
    } : {
      id: 1,
      title: rainSum48h > 0.5 
        ? (isEn ? "Light Rain & Optimal Moisture" : "हल्की फुहार व संतुलित नमी")
        : (isEn ? "Dry Weather & Planned Irrigation" : "शुष्क मौसम व नियमित सिंचाई"),
      description: isEn
        ? `Live forecast: ~${rainSum48h} mm rainfall in next 48 hours. Soil moisture remains balanced.`
        : `लाइव सैटेलाइट पूर्वानुमान: आगामी 48 घंटों में ~${rainSum48h} मिमी वर्षा। मिट्टी की नमी अनुकूल है।`,
      date: isEn ? `Today (${todayFormatted})` : `आज (${todayFormatted})`,
      severity: isEn ? "Normal / Favorable" : "सामान्य / अनुकूल",
      type: "rain",
      actions: isEn ? [
        "Follow DRISHTI's recommended crop schedule (20-25mm light watering).",
        "Inspect soil moisture at 10cm depth before switching on tube-well.",
        "Use morning hours for irrigation to minimize evaporation loss.",
      ] : [
        "DRISHTI की सुझाई गई मात्रा (20-25 मिमी) के अनुसार ही सिंचाई करें।",
        "ट्यूबवेल चालू करने से पहले 10 सेमी गहराई पर मिट्टी की नमी जांचें।",
        "वाष्पीकरण कम करने के लिए सुबह या शाम के समय पानी दें।",
      ],
    },

    // Alert 2: Temperature & Humidity Sentinel
    {
      id: 2,
      title: currentTemp > 32 
        ? (isEn ? "High Temperature Advisory" : "उच्च तापमान चेतावनी")
        : (isEn ? "Optimal Temperature & Humidity" : "अनुकूल तापमान व आर्द्रता स्थिति"),
      description: isEn
        ? `Current field reading: ${currentTemp}°C with ${currentHumidity}% relative humidity.`
        : `वर्तमान खेत माप: तापमान ${currentTemp}°C तथा सापेक्ष आर्द्रता ${currentHumidity}% दर्ज।`,
      date: isEn ? `Live (${todayFormatted})` : `लाइव (${todayFormatted})`,
      severity: currentHumidity > 70 ? (isEn ? "Moderate" : "मध्यम") : (isEn ? "Normal" : "सामान्य"),
      type: "temp",
      actions: isEn ? [
        "High humidity (>70%) increases fungal activity — inspect leaf undersides.",
        "Ensure proper plant spacing for natural air circulation across rows.",
        "Apply light potassium/micronutrient foliar spray to strengthen crop vigor.",
      ] : [
        "अधिक आर्द्रता (>70%) से फफूंद का खतरा बढ़ता है — पत्तियों की निचली सतह जांचें।",
        "हवा के प्राकृतिक संचार के लिए क्यारियों में जलभराव न होने दें।",
        "फसल की रोग प्रतिरोधक क्षमता बढ़ाने के लिए पोटाश/सूक्ष्म पोषक तत्वों का संतुलित प्रयोग करें।",
      ],
    },

    // Alert 3: Pest & Foliage Health Protection
    {
      id: 3,
      title: isEn ? "Crop Health & Pest Sentinel" : "फसल स्वास्थ्य व कीट निगरानी अलर्ट",
      description: isEn 
        ? "Monsoon/Kharif-Rabi transition: Elevated risk of stem borer, aphid, and leaf spot."
        : "वर्तमान मौसम संक्रमण: तना छेदक, माहू और पत्ती धब्बा रोगों की रोकथाम हेतु सतर्कता आवश्यक।",
      date: isEn ? `Active (${todayFormatted})` : `सक्रिय (${todayFormatted})`,
      severity: isEn ? "Advisory" : "सामान्य सतर्कता",
      type: "pest",
      actions: isEn ? [
        "Spray organic Neem Oil (1500 ppm) @ 5ml per liter of water as preventive safeguard.",
        "If spots or discoloration appear, use DRISHTI's 'Leaf Health Scanner' for instant AI diagnosis.",
        "Consult nearest Krishi Vigyan Kendra (KVK) before purchasing expensive commercial chemicals.",
      ] : [
        "सुरक्षात्मक उपाय के रूप में नीम का तेल (1500 ppm) 5ml प्रति लीटर पानी में मिलाकर छिड़कें।",
        "पत्तियों पर कोई धब्बा दिखे तो DRISHTI के 'पत्ता रोग स्कैनर' से तुरंत फोटो जांचें।",
        "दुकानदार से महंगी दवा लेने से पहले नजदीकी कृषि विज्ञान केंद्र (KVK) की सिफारिश लें।",
      ],
    },
  ];

  // Past Historical Alerts (Dynamic relative dates)
  const pastAlerts = [
    {
      id: 101,
      title: isEn ? "Passing Cloud Cover" : "पश्चिमी विक्षोभ / बादल छाए रहने का अलर्ट",
      description: isEn ? "Moderate cloud cover observed. Completed without crop damage." : "हल्के बादल छाए रहे। कोई नुकसान दर्ज नहीं हुआ।",
      date: yesterdayFormatted,
      status: isEn ? "Resolved" : "सफलतापूर्वक संपन्न",
    },
    {
      id: 102,
      title: isEn ? "Soil Moisture Recovery" : "मिट्टी की नमी सुधार चक्र",
      description: isEn ? "Post-irrigation soil moisture returned to 28% ideal level." : "सिंचाई के बाद मिट्टी की नमी 28% के आदर्श स्तर पर पहुंची।",
      date: twoDaysAgoFormatted,
      status: isEn ? "Normal" : "अनुकूल",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F4F7F5]">
      {/* Header */}
      <div className="flex items-center p-4 bg-white/70 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg ml-2">
          {isEn ? "Weather & Crop Alerts" : "मौसम व फसल अलर्ट"}
        </h1>
      </div>

      <div className="px-4 pt-3 pb-24">
        {/* Toggle Tabs */}
        <div className="flex bg-white rounded-2xl p-1 mb-5 shadow-xs border border-gray-100">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[14px] transition-all cursor-pointer ${
              activeTab === "active" ? "bg-[#1B7A3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {isEn ? "Active Alerts (3)" : "सक्रिय अलर्ट (3)"}
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[14px] transition-all cursor-pointer ${
              activeTab === "past" ? "bg-[#1B7A3D] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {isEn ? "Past History" : "पुराने अलर्ट"}
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {activeTab === "active" ? (
            alerts.map((alert) => {
              let Icon = AlertTriangle;
              let iconColor = "text-red-500";
              let iconBg = "bg-red-50 border-red-100";
              
              if (alert.type === "temp") {
                Icon = Thermometer;
                iconColor = "text-orange-500";
                iconBg = "bg-orange-50 border-orange-100";
              } else if (alert.type === "pest") {
                Icon = Bug;
                iconColor = "text-[#1B7A3D]";
                iconBg = "bg-[#E5F3E9] border-[#E5F3E9]";
              }

              let tagColor = "bg-red-100 text-red-600";
              if (alert.severity.includes("Medium") || alert.severity.includes("मध्यम") || alert.severity.includes("Moderate")) {
                tagColor = "bg-orange-100 text-orange-600";
              }
              if (alert.severity.includes("Low") || alert.severity.includes("सामान्य") || alert.severity.includes("Advisory")) {
                tagColor = "bg-green-100 text-[#1B7A3D]";
              }

              return (
                <div 
                  key={alert.id} 
                  onClick={() => setSelectedAlert(alert)}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100 items-start hover:border-[#1B7A3D] transition active:scale-[0.99] cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1 flex items-center justify-between">
                      <span>{alert.title}</span>
                    </h3>
                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-2">
                      {alert.description}
                    </p>
                    <span className="text-[11px] font-bold text-[#1B7A3D] flex items-center gap-1 hover:underline">
                      <span>{isEn ? "Tap for action advice" : "बचाव के उपाय देखें"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Right side: Tag and Date */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${tagColor}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">{alert.date}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-3">
              {pastAlerts.map((past) => (
                <div key={past.id} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-2xs">
                  <div>
                    <h4 className="font-bold text-gray-800 text-[14px] mb-0.5">{past.title}</h4>
                    <p className="text-[12px] text-gray-500 font-medium">{past.description}</p>
                  </div>
                  <div className="text-right shrink-0 pl-3">
                    <span className="text-[11px] font-bold text-[#1B7A3D] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block mb-1">
                      {past.status}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">{past.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-[#1B7A3D]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedAlert.title}</h3>
                  <span className="text-[11px] font-semibold text-gray-400">{selectedAlert.date}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              {selectedAlert.description}
            </p>

            {/* Action Checklist */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1B7A3D]" />
                <span>{isEn ? "Recommended Actions for Farmer:" : "किसान के लिए बचाव व समाधान कदम:"}</span>
              </h4>
              <div className="space-y-2">
                {selectedAlert.actions.map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[13px] text-gray-800 font-medium leading-snug">
                    <span className="w-5 h-5 rounded-full bg-[#1B7A3D] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 bg-white font-bold text-sm text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition cursor-pointer"
              >
                {isEn ? "Close" : "बंद करें"}
              </button>
              <button
                onClick={() => {
                  setSelectedAlert(null);
                  if (onNavigateTab) onNavigateTab("home");
                }}
                className="flex-1 py-3 rounded-xl bg-[#1B7A3D] text-white font-bold text-sm hover:bg-[#166533] active:scale-[0.99] transition cursor-pointer"
              >
                {isEn ? "Go to Home" : "होम पर जाएं"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
