import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  MapPin, 
  Coins, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Clock 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'Administrator' | 'Project Officer';
  setUserRole: (role: 'Administrator' | 'Project Officer') => void;
}

export default function Sidebar({ activeTab, setActiveTab, userRole, setUserRole }: SidebarProps) {
  const [predictionsOpen, setPredictionsOpen] = useState(true);

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "parcels", label: "Land Parcels", icon: MapPin },
    { id: "compensation", label: "Compensation Status", icon: Coins },
    { id: "documents", label: "Document Analysis", icon: FileText },
  ];

  const predictionsNavItems = [
    { id: "predict-delay", label: "Delay Risk Engine", icon: Clock },
    { id: "predict-cost", label: "Cost Overrun model", icon: Coins },
    { id: "predict-legal", label: "Legal Risk model", icon: Shield },
  ];

  const bottomNavItems = [
    { id: "alerts", label: "Early Warnings", icon: AlertTriangle, badge: true },
    { id: "analytics", label: "District Analytics", icon: BarChart3 },
    { id: "reports", label: "Report Center", icon: FileText },
    { id: "settings", label: "System Settings", icon: Settings },
    { id: "users", label: "User Management", icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-800 z-30 select-none shrink-0">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-white font-bold leading-tight tracking-tight text-base font-heading">
          LAND ACQUISITION<br/>
          <span className="text-slate-400 font-medium text-xs">Management System</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1.5 scrollbar-none">
        <div className="px-5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        
        {/* Main Items */}
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-5 py-2.5 text-sm font-semibold transition-all text-left cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-white border-l-4 border-blue-500 shadow-xs"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 mr-3 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Predictions Accordion Header */}
        <div className="pt-3">
          <div className="px-5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Analysis Engine</span>
            <button
              onClick={() => setPredictionsOpen(!predictionsOpen)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
              title="Toggle Engines"
            >
              {predictionsOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {predictionsOpen && (
            <div className="space-y-1">
              {predictionsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-5 py-2.5 text-sm font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white border-l-4 border-blue-500 shadow-xs"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 mr-3 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Other Sections */}
        <div className="pt-3">
          <div className="px-5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Management
          </div>
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-5 py-2.5 text-sm font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-white border-l-4 border-blue-500 shadow-xs"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center min-w-0 pr-1">
                    <Icon className={`w-4.5 h-4.5 mr-3 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-rose-500/25 text-rose-300 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-500/40 shrink-0">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer User Section */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3 font-mono shadow-xs shrink-0">
            {userRole === 'Administrator' ? 'AD' : 'PO'}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm text-white font-bold leading-tight truncate">
              {userRole === 'Administrator' ? 'Administrator' : 'Project Officer'}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 leading-tight truncate">
              {userRole === 'Administrator' ? 'System Admin' : 'Gov Revenue'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setUserRole(userRole === 'Administrator' ? 'Project Officer' : 'Administrator')}
          title="Switch User Role" 
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
