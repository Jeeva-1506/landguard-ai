import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  X, 
  Minus, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  RefreshCw, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  HelpCircle,
  Globe
} from "lucide-react";
import { sendChatMessage, clearChatHistory } from "../../api";

interface ChatAction {
  label: string;
  type: "OPEN_GIS" | "SEARCH_SURVEY" | "OPEN_PROJECT" | "SHOW_HIGH_RISK" | "SHOW_PENDING_LAND" | "SHOW_COMPENSATION" | "SHOW_STAGE" | "FILTER_PROJECTS";
  surveyNumber?: string;
  projectId?: string;
  district?: string;
  stage?: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  type?: "text" | "land_card" | "project_card" | "parcel_list" | "stage_info" | "error";
  data?: any;
  actions?: ChatAction[];
}

interface AIChatbotProps {
  currentProjectId?: string | null;
  userRole?: string;
  onExecuteAction?: (action: ChatAction) => void;
}

const QUICK_ACTIONS = [
  { label: "🔍 Search Survey Number", query: "What is the status of survey number 124/2?" },
  { label: "📍 Find Land", query: "Show survey 125/3" },
  { label: "📊 Project Status", query: "What is the status of Chennai Industrial Corridor?" },
  { label: "📑 Acquisition Stage", query: "Explain Stage 4 Objection" },
  { label: "💰 Compensation Status", query: "How much compensation is pending?" },
  { label: "⚠️ Check Delay Risk", query: "Show high risk lands" },
  { label: "🗺️ Open GIS Map", query: "Open GIS map" },
  { label: "❓ Help", query: "Help" }
];

export default function AIChatbot({ currentProjectId, userRole = "Administrator", onExecuteAction }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Default Initial Messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Vanakkam! 👋\nI’m LandGuard AI Assistant.\n\nI can help you with:\n• Land acquisition projects\n• Survey numbers\n• Land parcel information\n• Acquisition stages\n• Compensation status\n• Project progress\n• Delay risk\n• GIS land information\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: "🔍 Search Survey Number", type: "SEARCH_SURVEY" },
        { label: "⚠️ Check Delay Risk", type: "SHOW_HIGH_RISK" },
        { label: "🗺️ Open GIS Map", type: "OPEN_GIS" }
      ]
    }
  ]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Setup Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "ta" ? "ta-IN" : "en-US";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[^\w\s.,?!]/gi, ''));
    utterance.lang = language === "ta" ? "ta-IN" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        message: messageContent,
        projectId: currentProjectId,
        userRole: userRole,
        language: language
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.reply || response.text || "Processed request successfully.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: response.type,
        data: response.data,
        actions: response.actions
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "I couldn't complete the query right now. Please check server connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "error"
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory();
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: language === "ta"
            ? "வணக்கம்! 👋 நான் LandGuard AI உதவி மையம். உரையாடல் மீட்டமைக்கப்பட்டது."
            : "Vanakkam! 👋 I’m LandGuard AI Assistant. Chat session reset. How can I help you?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: "🔍 Search Survey Number", type: "SEARCH_SURVEY" },
            { label: "⚠️ Check Delay Risk", type: "SHOW_HIGH_RISK" },
            { label: "🗺️ Open GIS Map", type: "OPEN_GIS" }
          ]
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.type === "SEARCH_SURVEY" && !action.surveyNumber) {
      handleSendMessage("What is the status of survey number 124/2?");
      return;
    }
    if (action.type === "SHOW_HIGH_RISK") {
      handleSendMessage("Show high risk lands");
    }
    if (onExecuteAction) {
      onExecuteAction(action);
    }
    if (action.type === "OPEN_GIS" || action.type === "SHOW_HIGH_RISK") {
      setIsMinimized(true);
    }
  };

  return (
    <>
      {/* FLOATING BOT TOGGLE BUTTON (BOTTOM-RIGHT) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] animate-bounce-subtle">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setHasUnread(false);
            }}
            className="w-[54px] h-[54px] md:w-[58px] md:h-[58px] rounded-full bg-slate-900 text-white shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative border-2 border-blue-500 cursor-pointer group"
            title="Open LandGuard AI Assistant"
          >
            {/* Pulse Glow Ring */}
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping pointer-events-none"></span>

            <Bot className="w-7 h-7 text-blue-400 group-hover:rotate-12 transition-transform" />

            {/* Notification Unread Badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* CHAT WINDOW (DESKTOP: 380px x 600px | MOBILE: BOTTOM SHEET) */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 overflow-hidden font-sans ${
            isMinimized 
              ? "w-80 h-16" 
              : "w-[calc(100vw-32px)] md:w-[380px] h-[75vh] md:h-[600px] max-h-[620px]"
          }`}
        >
          {/* HEADER BAR */}
          <div className="bg-[#1B365D] text-white px-4 py-3 flex items-center justify-between border-b border-blue-900 shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1B365D]" title="Online"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1.5 font-sans">
                  <span>LandGuard AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <span className="text-[11px] text-blue-200 font-medium block">
                  Your Land Acquisition Assistant
                </span>
              </div>
            </div>

            {/* HEADER ACTION CONTROLS */}
            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(l => l === "en" ? "ta" : "en")}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1 border border-white/20"
                title="Toggle English / Tamil"
              >
                <Globe className="w-3.5 h-3.5 text-blue-300" />
                <span>{language === "en" ? "English ▾" : "தமிழ் ▾"}</span>
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Reset Chat Session"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(m => !m)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-200 hover:text-rose-300 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN CHAT CONTENT AREA */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/60">
              
              {/* SCROLLABLE MESSAGES STREAM */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl space-y-2 shadow-xs transition-all ${
                        msg.sender === "user"
                          ? "bg-[#2563EB] text-white rounded-br-xs font-semibold text-[15px] leading-relaxed"
                          : "bg-[#1B365D] text-white rounded-bl-xs text-[15px] font-medium leading-relaxed border border-blue-900"
                      }`}
                    >
                      {/* Message Header Actions (Text-to-Speech for AI) */}
                      {msg.sender === "ai" && (
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1">
                          <span className="text-[11px] font-extrabold text-blue-300 tracking-wider uppercase flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5" />
                            <span>LandGuard AI</span>
                          </span>
                          <button
                            onClick={() => handleSpeakMessage(msg.id, msg.text)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              speakingMsgId === msg.id ? "text-amber-400 bg-white/10" : "text-blue-200 hover:text-white"
                            }`}
                            title="Listen Read Aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Main Message Text Body - Prominent 15px font matching reference image */}
                      <p className="whitespace-pre-line leading-relaxed font-sans text-[15px]">
                        {msg.text}
                      </p>

                      {/* RICH RESPONSE CARD: LAND STATUS */}
                      {msg.type === "land_card" && msg.data && (
                        <div className="mt-2.5 p-3 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b pb-1.5">
                            <span className="font-extrabold text-slate-900 font-mono text-[13px]">
                              Survey #{msg.data.surveyNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              msg.data.riskLevel === "High" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {msg.data.riskLevel} Risk ({msg.data.riskScore}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[12px]">
                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Owner</span><strong>{msg.data.ownerName}</strong></div>
                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Area</span><strong>{msg.data.area}</strong></div>
                          </div>

                          <div className="text-[12px]">
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                            <span className="font-semibold">{msg.data.location}</span>
                          </div>
                        </div>
                      )}

                      {/* RICH RESPONSE CARD: PROJECT PROFILE */}
                      {msg.type === "project_card" && msg.data && (
                        <div className="mt-2.5 p-3 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                            <span className="font-extrabold text-slate-900 text-[13px]">{msg.data.name}</span>
                            <span className="font-mono text-[11px] font-bold text-blue-700">{msg.data.id}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[12px] text-slate-800">
                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Required</span><strong>{msg.data.landRequired} Ha</strong></div>
                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Acquired</span><strong className="text-emerald-600">{msg.data.landAcquired} Ha</strong></div>
                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Pending</span><strong className="text-amber-600">{msg.data.landPending} Ha</strong></div>
                          </div>
                        </div>
                      )}

                      {/* STAGE INFO PROGRESSION BADGE */}
                      {msg.type === "stage_info" && msg.data && (
                        <div className="mt-2.5 p-3 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-[12px]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{msg.data.stageName}</span>
                          </div>
                          <p className="text-slate-700 text-[12px] leading-snug">{msg.data.description}</p>
                        </div>
                      )}

                      {/* ACTION BUTTONS (E.G., OPEN GIS MAP, SEARCH SURVEY) */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-wrap gap-2">
                          {msg.actions.map((act, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(act)}
                              className="px-3 py-1.5 text-[13px] font-extrabold rounded-xl bg-white text-[#1B365D] hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border border-slate-200"
                            >
                              <span>{act.label}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-1 font-medium px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3 bg-[#1B365D] text-white rounded-2xl border border-blue-900 max-w-xs shadow-xs">
                    <Bot className="w-4 h-4 text-blue-300 animate-spin" />
                    <span className="text-xs font-semibold text-blue-100">
                      LandGuard AI is analyzing records...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK ACTION CHIPS - MATCHING REFERENCE SUGGESTION BUTTONS */}
              <div className="px-3 py-2 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-2 shrink-0 select-none">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(action.query)}
                    className="px-3 py-2 text-[14px] font-bold text-slate-800 bg-white hover:bg-slate-50 rounded-xl border border-slate-800 transition-all whitespace-nowrap cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* CHAT INPUT FORM BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title={isListening ? "Listening... Click to stop" : "Speak to Assistant"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Text Input - 14px font matching reference screenshot */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening to voice input..."
                      : language === "ta"
                      ? "கேள்வியைக் கேட்கவும்... (உதா: survey 124/2 status)"
                      : "Type your message... (e.g. status of 124/2)"
                  }
                  className="flex-1 bg-slate-50 text-slate-900 text-[14px] font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1B365D] placeholder-slate-400"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="p-2.5 bg-[#1B365D] hover:bg-[#152a4a] text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* LEGAL DISCLAIMER FOOTER */}
              <div className="px-3 py-1.5 bg-slate-100 text-[10px] text-slate-500 text-center font-medium border-t border-slate-200 select-none">
                Guidance only. For legally binding decisions, contact Competent Authority for Land Acquisition (CALA).
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
}
