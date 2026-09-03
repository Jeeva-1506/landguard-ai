import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  Bell, 
  User, 
  Globe, 
  HelpCircle, 
  PhoneCall, 
  FileText, 
  Layers, 
  LayoutDashboard, 
  Briefcase, 
  MapPin, 
  Coins, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Users as UsersIcon,
  Sparkles,
  ChevronDown,
  Shield
} from "lucide-react";
import { UserProfileData } from "./Navbar";

interface GovHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfileData;
  userRole: 'Administrator' | 'Project Officer';
  setUserRole: (role: 'Administrator' | 'Project Officer') => void;
  onOpenProfile: () => void;
  alertCount: number;
  onSearch: (term: string) => void;
  globalSearchTerm: string;
}

export default function GovHeader({
  activeTab,
  setActiveTab,
  userProfile,
  userRole,
  setUserRole,
  onOpenProfile,
  alertCount,
  onSearch,
  globalSearchTerm
}: GovHeaderProps) {
  const [lang, setLang] = useState<"EN" | "HI" | "TA">("EN");
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  const navItems = [
    { id: "bhoomi-rashi", label: "Bhoomi Rashi Portal", icon: Building2, highlight: true },
    { id: "dashboard", label: "Officer Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "NH Projects", icon: Briefcase },
    { id: "parcels", label: "Land Parcels", icon: MapPin },
    { id: "compensation", label: "PFMS Payments", icon: Coins },
    { id: "documents", label: "NLP Objections", icon: FileText },
    { id: "predict-delay", label: "Risk Modeler", icon: Sparkles },
    { id: "alerts", label: "Early Warnings", icon: AlertTriangle, badge: alertCount },
    { id: "reports", label: "3A/3D Gazettes", icon: Layers }
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 select-none sticky top-0 z-40 shadow-sm">
      {/* 1. INDIAN NATIONAL TRICOLOR TOP BAR */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. ACCESSIBILITY & GOVERNMENT TOP BAR */}
      <div className="bg-slate-900 text-slate-300 px-6 py-1 text-[11px] flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>भारत सरकार | Government of India</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden md:inline">सड़क परिवहन और राजमार्ग मंत्रालय | Ministry of Road Transport and Highways (MoRTH)</span>
        </div>

        <div className="flex items-center gap-4 font-medium">
          {/* Toll Free Helpline */}
          <div className="hidden sm:flex items-center gap-1 text-amber-400 font-bold">
            <PhoneCall className="w-3 h-3" />
            <span>Toll Free Helpline: 1800-111-555</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <Globe className="w-3 h-3 text-slate-400" />
            <button 
              onClick={() => setLang("EN")} 
              className={`px-1 rounded ${lang === "EN" ? "bg-amber-500 text-slate-950 font-bold" : "hover:text-white"}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang("HI")} 
              className={`px-1 rounded ${lang === "HI" ? "bg-amber-500 text-slate-950 font-bold" : "hover:text-white"}`}
            >
              हिंदी
            </button>
            <button 
              onClick={() => setLang("TA")} 
              className={`px-1 rounded ${lang === "TA" ? "bg-amber-500 text-slate-950 font-bold" : "hover:text-white"}`}
            >
              தமிழ்
            </button>
          </div>

          {/* Font Size Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
            <button onClick={() => setFontSize("normal")} className="px-1 hover:text-white">A-</button>
            <button onClick={() => setFontSize("normal")} className="px-1 font-bold text-white">A</button>
            <button onClick={() => setFontSize("large")} className="px-1 hover:text-white">A+</button>
          </div>
        </div>
      </div>

      {/* 3. MAIN GOVERNMENT PORTAL EMBLEM & BRANDING HEADER */}
      <div className="px-6 py-3.5 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
        <div className="flex items-center gap-4">
          {/* Emblem & Logos */}
          <div 
            onClick={() => setActiveTab("bhoomi-rashi")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold shadow-md font-heading text-lg group-hover:scale-105 transition-transform border border-amber-400">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight group-hover:text-blue-700 transition-colors">
                  BHOOMI RASHI <span className="text-blue-700 font-bold">& LANDGUARD AI</span>
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-300 uppercase tracking-wide">
                  Govt. Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Integrated Highway Land Acquisition Portal • Ministry of Road Transport & Highways
              </p>
            </div>
          </div>
        </div>

        {/* Right Search & Profile Widget */}
        <div className="flex items-center gap-4">
          {/* Live Search Input */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={globalSearchTerm}
              placeholder="Search Project ID, Parcel, Gazette..."
              onChange={(e) => onSearch(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 placeholder-slate-400 font-medium shadow-2xs"
            />
          </div>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setUserRole(userRole === 'Administrator' ? 'Project Officer' : 'Administrator')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Switch User Designation"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Role: {userRole}</span>
          </button>

          {/* User Profile Trigger */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-xs font-mono">
              {userProfile.initials || "JS"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight">{userProfile.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. GOVERNMENT NAVIGATION MENU BAR */}
      <div className="bg-slate-900 text-white px-6 flex items-center justify-between overflow-x-auto scrollbar-none border-t border-slate-800">
        <nav className="flex items-center gap-1 text-xs font-bold py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md font-extrabold"
                    : item.highlight
                      ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-extrabold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Shortcut to Bhoomi Rashi Home */}
        <div className="hidden xl:flex items-center pl-4 border-l border-slate-800">
          <button
            onClick={() => setActiveTab("bhoomi-rashi")}
            className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Bhoomi Rashi Citizen Home</span>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          </button>
        </div>
      </div>
    </header>
  );
}
