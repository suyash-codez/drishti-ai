"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, ChevronDown, Check, Loader2, Sparkles, Volume2, VolumeX, AlertCircle, ArrowRight, RotateCcw, Bot } from "lucide-react";
import { transcribeAudio, chatWithVoiceAgent, speakText, ChatVoiceResponse } from "../lib/api";
import { ParsedVoiceData, parseVoiceTranscript } from "../lib/voiceParser";

interface VoiceButtonProps {
  currentLanguage: string;
  labels: Record<string, string>;
  onApplyData: (data: ParsedVoiceData) => void;
  onNavigate?: (action: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  showFab?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  currentLanguage,
  labels,
  onApplyData,
  onNavigate,
  isOpen,
  onClose,
  onOpen,
  showFab = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // AI Conversational State
  const [aiResponse, setAiResponse] = useState<ChatVoiceResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Visualizer levels
  const [audioLevel, setAudioLevel] = useState(0);

  // Clean audio on unmount or close
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      setLiveTranscript("");
      setAiResponse(null);
      setErrorMsg("");
      stopAudio();
      startListening();
    } else {
      stopListening();
      stopAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Visualizer animation
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(0.2 + Math.random() * 0.8);
      }, 120);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playSarvamAudio = async (text: string) => {
    try {
      stopAudio();
      setIsSynthesizing(true);
      const cleanTextForTts = text.replace(/\*\*/g, "").replace(/[•*#]/g, " ").trim();
      const audioBlob = await speakText(cleanTextForTts, currentLanguage);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setIsSynthesizing(false);
      };

      await audio.play();
    } catch (e) {
      console.warn("Sarvam TTS play error:", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const processQueryWithAI = async (transcriptText: string) => {
    if (!transcriptText || !transcriptText.trim()) return;
    
    setIsProcessing(true);
    setErrorMsg("");
    try {
      const response = await chatWithVoiceAgent(transcriptText, currentLanguage);
      setAiResponse(response);
      
      // Speak out the response in farmer's language via Sarvam AI TTS
      if (response.answer) {
        playSarvamAudio(response.answer);
      }
    } catch (err: any) {
      console.error("AI query failed:", err);
      // Fallback local field parser
      const parsed = parseVoiceTranscript(transcriptText);
      if (Object.keys(parsed).length > 0) {
        onApplyData(parsed);
        onClose();
      } else {
        setErrorMsg(
          currentLanguage === "en"
            ? "Could not understand your question. Please try asking again."
            : "आपकी बात पूरी समझ नहीं आई। कृपया दोबारा पूछें।"
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = async () => {
    setErrorMsg("");
    setLiveTranscript("");
    setAiResponse(null);
    stopAudio();

    // 1. Try Native Browser SpeechRecognition (Instant, zero-latency)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          currentLanguage === "hi"
            ? "hi-IN"
            : currentLanguage === "mr"
            ? "mr-IN"
            : "en-IN";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setLiveTranscript(currentText);
        };

        recognition.onerror = (e: any) => {
          console.warn("SpeechRecognition error:", e);
          if (e.error === "not-allowed") {
            setErrorMsg(
              currentLanguage === "en"
                ? "Microphone access blocked. Please allow mic permissions in browser."
                : "माइक्रोफ़ोन अनुमति ब्लॉक है। कृपया ब्राउज़र में अनुमति दें।"
            );
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
        return;
      } catch (err) {
        console.warn("Web Speech API init failed, falling back to MediaRecorder", err);
      }
    }

    // 2. Fallback: MediaRecorder with Backend STT
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsListening(false);
        setIsProcessing(true);
        try {
          const res = await transcribeAudio(audioBlob, currentLanguage);
          if (res.transcript) {
            setLiveTranscript(res.transcript);
            await processQueryWithAI(res.transcript);
          } else {
            setErrorMsg(
              currentLanguage === "en"
                ? "Could not understand speech clearly. Please try again."
                : "आवाज़ स्पष्ट समझ नहीं आई। कृपया दोबारा बोलें।"
            );
          }
        } catch (err: any) {
          setErrorMsg(err.message || "Failed to process audio.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Mic access failed", err);
      setErrorMsg(
        currentLanguage === "en"
          ? "Microphone access is required for voice input."
          : "बोलने के लिए माइक्रोफ़ोन की अनुमति जरूरी है।"
      );
    }
  };

  const stopListeningAndSubmit = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsListening(false);

    if (liveTranscript.trim().length > 0) {
      processQueryWithAI(liveTranscript);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsListening(false);
  };

  const handleApplyQuickSample = (sampleText: string) => {
    stopListening();
    setLiveTranscript(sampleText);
    processQueryWithAI(sampleText);
  };

  const handleExecuteAction = (action?: string) => {
    stopAudio();
    onClose();
    if (!action) return;

    if (onNavigate) {
      onNavigate(action);
    } else if (action === "advisory" && aiResponse?.extracted_fields) {
      onApplyData(aiResponse.extracted_fields);
    }
  };

  const handleApplyExtractedData = () => {
    if (aiResponse?.extracted_fields) {
      stopAudio();
      onApplyData(aiResponse.extracted_fields);
      onClose();
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {showFab && !isOpen && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            type="button"
            id="voice-mic-fab"
            onClick={onOpen}
            aria-label="Voice input"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-blue-500/30"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Full-Screen Voice Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-b from-white via-[#F4FAF5] to-[#E9F5EC] flex flex-col items-center justify-between overflow-y-auto animate-in slide-in-from-bottom-6 duration-300">
          
          {/* Top Header */}
          <div className="w-full flex items-center justify-between p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { stopListening(); stopAudio(); onClose(); }}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
              >
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
              <div>
                <h2 className="font-bold text-gray-900 text-base leading-tight">
                  {currentLanguage === "en" ? "DRISHTI AI Voice Assistant" : "DRISHTI आवाज़ सहायक (AI Agronomist)"}
                </h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  {currentLanguage === "en" ? "Ask any farming question or speak your field data" : "खेती की कोई भी समस्या पूछें या बोलकर सलाह लें"}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#1B7A3D]/10 text-[#1B7A3D] text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Sarvam AI
            </span>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center justify-start flex-1 w-full max-w-lg px-5 py-4">
            
            {/* Pulsing Mic (Show smaller if answer is displayed) */}
            <div className={`relative flex items-center justify-center transition-all duration-300 ${aiResponse ? "w-24 h-24 my-2" : "w-36 h-36 my-4"}`}>
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#1B7A3D]/15 animate-ping opacity-60" />
                  <div className="absolute inset-2 rounded-full bg-[#1B7A3D]/20 animate-pulse" />
                </>
              )}
              
              <button
                type="button"
                onClick={isListening ? stopListeningAndSubmit : startListening}
                className={`relative z-10 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
                  aiResponse ? "w-20 h-20" : "w-28 h-28"
                } ${
                  isListening
                    ? "bg-[#1B7A3D] text-white scale-105 shadow-[#1B7A3D]/40"
                    : isProcessing
                    ? "bg-amber-500 text-white animate-pulse"
                    : isPlayingAudio
                    ? "bg-blue-600 text-white shadow-blue-500/40"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isPlayingAudio ? (
                  <Volume2 className="w-8 h-8 animate-bounce" />
                ) : (
                  <Mic className={`w-8 h-8 ${isListening ? "animate-bounce" : ""}`} />
                )}
                <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
                  {isProcessing
                    ? (currentLanguage === "en" ? "Thinking..." : "सोच रहा है...")
                    : isListening
                    ? (currentLanguage === "en" ? "Listening..." : "सुन रहा है...")
                    : isPlayingAudio
                    ? (currentLanguage === "en" ? "Speaking..." : "बोल रहा है...")
                    : (currentLanguage === "en" ? "Tap to Speak" : "बोलने के लिए टैप करें")}
                </span>
              </button>
            </div>

            {/* Audio Wave Visualizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-6 mb-3 w-full">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 rounded-full bg-[#1B7A3D] transition-all duration-150 ${
                    isListening ? "" : isPlayingAudio ? "bg-blue-600" : "h-1 opacity-20"
                  }`}
                  style={{
                    height: isListening 
                      ? `${Math.max(4, Math.random() * (audioLevel * 28 + 6))}px` 
                      : isPlayingAudio 
                      ? `${Math.max(4, 6 + (i % 4) * 5)}px`
                      : "4px",
                    opacity: isListening || isPlayingAudio ? 0.6 + Math.random() * 0.4 : 0.2
                  }}
                />
              ))}
            </div>

            {/* Heard Transcript */}
            <div className="w-full bg-white rounded-2xl p-3.5 shadow-xs border border-gray-200/90 mb-3 flex flex-col justify-center">
              {liveTranscript ? (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 mb-0.5 flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-[#1B7A3D]" />
                    {currentLanguage === "en" ? "You asked:" : "आपने पूछा:"}
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">
                    "{liveTranscript}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium text-center py-1">
                  {isListening
                    ? (currentLanguage === "en" ? "Listening... Ask any question or speak your crop data" : "सुन रहा हूँ... अपनी फसल, सिंचाई या सरकारी योजना के बारे में पूछें")
                    : (currentLanguage === "en" ? "Tap mic to ask agricultural advice" : "माइक दबाकर खेती का कोई भी सवाल पूछें")}
                </p>
              )}
            </div>

            {/* AI Response Card */}
            {aiResponse && (
              <div className="w-full bg-gradient-to-br from-emerald-50 via-white to-green-50/70 rounded-2xl p-4 border border-emerald-200 shadow-md mb-3 space-y-3 animate-in fade-in-50 zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-emerald-900">
                      {currentLanguage === "en" ? "DRISHTI AI Agronomist" : "दृष्टि AI कृषि विशेषज्ञ उत्तर"}
                    </span>
                  </div>

                  {/* Audio Controls */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlayingAudio) {
                        stopAudio();
                      } else {
                        playSarvamAudio(aiResponse.answer);
                      }
                    }}
                    disabled={isSynthesizing}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSynthesizing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{currentLanguage === "en" ? "Stop" : "रोकें"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{currentLanguage === "en" ? "Listen" : "सुनें (Sarvam AI)"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Answer Content - Beautifully Formatted without raw Markdown */}
                <div className="space-y-2 text-[13px] text-gray-800 leading-relaxed">
                  {aiResponse.answer
                    .replace(/\*\*/g, "")
                    .split("\n")
                    .filter((line) => line.trim().length > 0)
                    .map((line, idx) => {
                      const trimmed = line.trim();

                      // Check if heading line (contains emoji or title)
                      if (idx === 0 && (trimmed.startsWith("🌾") || trimmed.startsWith("🌿") || trimmed.startsWith("🌱") || trimmed.startsWith("🌽") || trimmed.startsWith("☁️") || trimmed.startsWith("💧") || trimmed.startsWith("📸") || trimmed.startsWith("🏛️"))) {
                        return (
                          <div key={idx} className="font-bold text-emerald-950 text-[13.5px] pb-1 border-b border-emerald-100/80 flex items-center gap-1.5">
                            {trimmed}
                          </div>
                        );
                      }

                      // Check if bullet point or numbered item
                      if (trimmed.startsWith("•") || trimmed.startsWith("-") || /^[0-9]+\./.test(trimmed)) {
                        const content = trimmed.replace(/^[•\-\d+\.]\s*/, "");
                        const colonIdx = content.indexOf(":");
                        if (colonIdx !== -1) {
                          const title = content.substring(0, colonIdx);
                          const desc = content.substring(colonIdx + 1);
                          return (
                            <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                              <div>
                                <span className="font-bold text-gray-950">{title}: </span>
                                <span className="text-gray-700">{desc}</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                            <span className="text-gray-700">{content}</span>
                          </div>
                        );
                      }

                      // Normal paragraph
                      return (
                        <p key={idx} className="text-xs text-gray-700 leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                </div>

                {/* Redirect / Deep-Link Action Button */}
                {aiResponse.action && aiResponse.action_label && (
                  <button
                    type="button"
                    onClick={() => handleExecuteAction(aiResponse.action)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{aiResponse.action_label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Apply Field Data if metrics extracted */}
                {aiResponse.extracted_fields && Object.keys(aiResponse.extracted_fields).length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyExtractedData}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🌾 {currentLanguage === "en" ? "Get Irrigation & Fertilizer Plan for this Data" : "इस जानकारी से सिंचाई व खाद सलाह प्राप्त करें"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Suggested Question Chips */}
            <div className="w-full mt-auto">
              <p className="text-[11px] font-bold text-gray-500 mb-1.5 px-1">
                {currentLanguage === "en" ? "💡 Quick questions & features to try:" : "💡 तुरंत पूछें या फीचर आज़माएं:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyQuickSample("गेहूं की खेती कैसे करें और यूरिया कब डालें?")}
                  className="p-2.5 bg-white rounded-xl border border-gray-200 text-left hover:border-[#1B7A3D] transition-colors cursor-pointer text-xs font-bold text-gray-800 shadow-xs"
                >
                  🌾 गेहूं की खेती व यूरिया
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickSample("पत्ता रोग स्कैनर खोलो")}
                  className="p-2.5 bg-white rounded-xl border border-gray-200 text-left hover:border-blue-500 transition-colors cursor-pointer text-xs font-bold text-gray-800 shadow-xs"
                >
                  📸 रोग स्कैनर खोलो
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickSample("ड्रिप सिंचाई और सोलर पंप पर सरकारी सब्सिडी")}
                  className="p-2.5 bg-white rounded-xl border border-gray-200 text-left hover:border-[#1B7A3D] transition-colors cursor-pointer text-xs font-bold text-gray-800 shadow-xs"
                >
                  🏛️ सरकारी योजनाएं व 90% सब्सिडी
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyQuickSample("गेहूं, मिट्टी नमी 28 प्रतिशत, तापमान 31 डिग्री")}
                  className="p-2.5 bg-white rounded-xl border border-gray-200 text-left hover:border-amber-500 transition-colors cursor-pointer text-xs font-bold text-gray-800 shadow-xs"
                >
                  🧪 28% नमी • 31°C सलाह
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="w-full px-5 py-4 bg-white/80 border-t border-gray-100 flex flex-col items-center gap-2 sticky bottom-0 z-20">
            {isListening ? (
              <button 
                type="button"
                onClick={stopListeningAndSubmit}
                className="w-full py-3.5 rounded-2xl bg-[#1B7A3D] text-white font-bold text-sm shadow-lg shadow-green-900/20 hover:bg-[#166533] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{currentLanguage === "en" ? "Done Speaking (Ask AI)" : "बोलना पूरा हुआ (उत्तर प्राप्त करें)"}</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={startListening}
                className="w-full py-3.5 rounded-2xl bg-[#1B7A3D] text-white font-bold text-sm shadow-lg shadow-green-900/20 hover:bg-[#166533] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>{currentLanguage === "en" ? "Ask Another Question" : "दूसरा सवाल पूछें"}</span>
              </button>
            )}

            <button 
              type="button"
              onClick={() => { stopListening(); stopAudio(); onClose(); }}
              className="text-gray-500 hover:text-gray-900 text-xs font-bold py-1"
            >
              {currentLanguage === "en" ? "Close Assistant" : "बंद करें"}
            </button>
          </div>

        </div>
      )}
    </>
  );
};
