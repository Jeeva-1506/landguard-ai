import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Search, 
  Bell, 
  X, 
  Shield, 
  Edit3, 
  Save, 
  CheckCircle2, 
  SlidersHorizontal,
  Settings as SettingsIcon,
  User as UserIcon
} from "lucide-react";
import { Alert, Project, LandParcel } from "../types";

export interface UserProfileData {
  name: string;
  title: string;
  role: 'Administrator' | 'Project Officer';
  department: string;
  district: string;
  email: string;
  phone: string;
  initials: string;
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alerts: Alert[];
  userProfile: UserProfileData;
  userRole: 'Administrator' | 'Project Officer';
  setUserRole: (role: 'Administrator' | 'Project Officer') => void;
  onUpdateProfile: (updated: UserProfileData) => void;
  onSearch: (term: string) => void;
  globalSearchTerm: string;
  onViewParcel: (parcelId: string) => void;
  projects?: Project[];
  parcels?: LandParcel[];
}

export default function Navbar({
  activeTab,
  setActiveTab,
  alerts,
  userProfile,
  userRole,
  setUserRole,
  onUpdateProfile,
  onSearch,
  globalSearchTerm,
  onViewParcel,
  projects = [],
  parcels = []
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [editForm, setEditForm] = useState<UserProfileData>(userProfile);

  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');
  const alertCount = activeAlerts.length;

  const mainNavLinks = [
    { id: "dashboard", label: "Dashboard" },
    { id: "projects", label: "Projects" },
    { id: "parcels", label: "Land Parcels" },
    { id: "predict-delay", label: "Delay Forecast" },
    { id: "documents", label: "Documents" },
    { id: "objections", label: "Objections" },
    { id: "compensation", label: "Compensation" },
    { id: "map", label: "GIS Map" },
    { id: "alerts", label: "Early Warnings", badge: alertCount },
    { id: "reports", label: "Reports" }
  ];

  const trimmedSearch = globalSearchTerm.trim().toLowerCase();
  const matchingProjects = trimmedSearch
    ? projects.filter(p => p.id.toLowerCase().includes(trimmedSearch) || p.name.toLowerCase().includes(trimmedSearch) || p.district.toLowerCase().includes(trimmedSearch))
    : [];
  const matchingParcels = trimmedSearch
    ? parcels.filter(p => p.id.toLowerCase().includes(trimmedSearch) || (p.surveyNumber && p.surveyNumber.toLowerCase().includes(trimmedSearch)) || p.projectId.toLowerCase().includes(trimmedSearch) || p.district.toLowerCase().includes(trimmedSearch))
    : [];

  const totalMatches = matchingProjects.length + matchingParcels.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenProfile = () => {
    setEditForm(userProfile);
    setIsEditing(false);
    setShowProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
    setShowProfileModal(false);
  };

  return (
    <header className="w-full bg-[#EFF5ED] border-b border-slate-200/80 sticky top-0 z-40 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP HEADER BRAND & USER CONTROLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        
        {/* BRAND TITLE */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#0F382C] text-[#D8F374] font-extrabold flex items-center justify-center text-base rounded-2xl font-['Outfit'] shadow-sm group-hover:scale-105 transition-transform">
            LG
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0F382C] leading-none tracking-tight font-['Outfit'] flex items-center gap-1.5">
              <span>landguard</span>
              <span className="text-[10px] font-bold bg-[#D8F374] text-[#0F382C] px-2 py-0.5 rounded-full uppercase tracking-wider">AI</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-none mt-1">
              Predictive Land Acquisition Monitoring
            </p>
          </div>
        </div>

        {/* SEARCH & RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
          
          {/* SEARCH FIELD - HIGH CONTRAST & CRISP VISIBILITY */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-700 absolute left-3.5 pointer-events-none z-10" />
              <input
                type="text"
                value={globalSearchTerm}
                placeholder="Search survey number, project ID... ⌘K"
                onChange={(e) => {
                  onSearch(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-[280px] sm:w-[340px] h-[44px] pl-10 pr-9 bg-white border-2 border-slate-300 rounded-full text-slate-900 placeholder:text-slate-500 font-bold text-xs sm:text-sm shadow-xs focus:border-[#0F382C] focus:bg-white outline-none transition-all"
              />
              {globalSearchTerm && (
                <button 
                  onClick={() => { onSearch(""); setShowSearchDropdown(false); }}
                  className="absolute right-3.5 p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Search Popover */}
            {showSearchDropdown && trimmedSearch.length > 0 && (
              <div className="absolute right-0 top-13 w-[380px] bg-white border border-[#CBD5E1] rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto divide-y divide-[#F1F5F9] animate-in fade-in">
                <div className="px-4 py-2.5 bg-[#0F382C] text-white flex items-center justify-between text-xs font-extrabold font-['Outfit']">
                  <span>Search Matches ({totalMatches})</span>
                  <span className="text-[11px] text-[#D8F374]">Click to view</span>
                </div>

                {matchingProjects.length > 0 && (
                  <div className="p-2">
                    <div className="table-header px-2 py-1">Projects ({matchingProjects.length})</div>
                    {matchingProjects.map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => { setActiveTab("projects"); setShowSearchDropdown(false); }}
                        className="px-3 py-2 hover:bg-[#F6FAF5] rounded-xl cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-[#0F382C] font-['Outfit']">{proj.id} - {proj.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{proj.district}, {proj.state}</p>
                        </div>
                        <span className="status-badge status-badge-info">{proj.delayRisk} Risk</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchingParcels.length > 0 && (
                  <div className="p-2">
                    <div className="table-header px-2 py-1">Land Parcels ({matchingParcels.length})</div>
                    {matchingParcels.map(parcel => (
                      <div
                        key={parcel.id}
                        onClick={() => { onViewParcel(parcel.id); setShowSearchDropdown(false); }}
                        className="px-3 py-2 hover:bg-[#F6FAF5] rounded-xl cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-[#0F382C] font-['Outfit']">Survey No: {parcel.surveyNumber || parcel.id}</p>
                          <p className="text-xs text-slate-500 font-medium">{parcel.district} • {parcel.landArea} Acres</p>
                        </div>
                        <span className="status-badge status-badge-neutral">{parcel.acquisitionStage}</span>
                      </div>
                    ))}
                  </div>
                )}

                {totalMatches === 0 && (
                  <div className="p-4 text-center text-slate-500 text-xs font-medium">No matching records found</div>
                )}
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-[42px] h-[42px] bg-white border-2 border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {alertCount}
                </span>
              )}
            </button>
          </div>

          {/* SETTINGS SHORTCUT */}
          <button
            onClick={() => setActiveTab("settings")}
            className="w-[42px] h-[42px] bg-white border-2 border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-slate-700" />
          </button>

          {/* OFFICER PROFILE */}
          <div 
            onClick={handleOpenProfile}
            className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-85"
          >
            <div className="w-10 h-10 bg-[#0F382C] text-[#D8F374] font-extrabold text-sm flex items-center justify-center rounded-2xl font-['Outfit'] shadow-2xs">
              {userProfile.initials || "JS"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-extrabold text-[#0F382C] font-['Outfit'] leading-tight">{userProfile.name}</p>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{userProfile.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOWER NAVIGATION MENU BAR - LARGER & BOLDER TAB FONT SIZE MATCHING IMAGE 3 */}
      <div className="bg-white border-t border-slate-200/60 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-2 py-0.5 text-sm sm:text-base font-extrabold font-['Outfit']">
            {mainNavLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer text-xs sm:text-sm ${
                    isActive
                      ? "bg-[#D8F374] text-[#0F382C] font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-[#0F382C] font-medium"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-extrabold rounded-full ${
                      isActive ? 'bg-[#0F382C] text-[#D8F374]' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* NOTIFICATIONS DROPDOWN PORTAL */}
      {showNotifications && createPortal(
        <div
          ref={notificationRef}
          className="fixed right-8 top-16 w-[360px] bg-white border border-[#CBD5E1] rounded-[8px] shadow-lg z-[999999] overflow-hidden animate-in fade-in"
        >
          <div className="p-3 bg-[#0F172A] text-white flex items-center justify-between">
            <h4 className="text-[12px] font-semibold uppercase tracking-wider">
              Early Warning Alerts ({alertCount})
            </h4>
            <button onClick={() => setShowNotifications(false)} className="text-[#94A3B8] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => { setShowNotifications(false); onViewParcel(alert.parcelId); }}
                className="p-3 hover:bg-[#F8FAFC] cursor-pointer flex gap-2.5 items-start text-[14px]"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alert.priority === "High" || alert.priority === "Critical" ? "bg-[#DC2626]" : "bg-[#D97706]"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="table-value-bold">Survey {alert.surveyNumber || alert.parcelId}</span>
                    <span className="status-badge status-badge-warning">{alert.priority}</span>
                  </div>
                  <p className="text-[#1E293B] mt-0.5 text-[13px]">{alert.issue}</p>
                  <p className="text-[12px] text-[#64748B] mt-0.5">{alert.projectName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && createPortal(
        <div
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-[#0F172A]/40 z-[999999] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#CBD5E1] rounded-[8px] shadow-xl w-full max-w-lg overflow-hidden text-[14px]"
          >
            <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-[36px] h-[36px] bg-[#2563EB] text-white font-semibold flex items-center justify-center rounded-[5px] font-mono text-[14px]">
                  {editForm.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-[16px]">{userProfile.name}</h3>
                  <p className="text-[#CBD5E1] text-[12px]">{userProfile.title}</p>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-[14px]">
                    <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
                      <span className="small-label block text-[#64748B]">Name</span>
                      <span className="table-value-bold">{userProfile.name}</span>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
                      <span className="small-label block text-[#64748B]">Designation</span>
                      <span className="table-value-bold">{userProfile.title}</span>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
                      <span className="small-label block text-[#64748B]">Department</span>
                      <span className="font-normal text-[#1E293B]">{userProfile.department}</span>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
                      <span className="small-label block text-[#64748B]">District</span>
                      <span className="font-normal text-[#1E293B]">{userProfile.district}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-[#E2E8F0]">
                    <span className="status-badge status-badge-info">Role: {userProfile.role}</span>
                    <button onClick={() => setIsEditing(true)} className="btn-primary">
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-[14px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="small-label block text-[#64748B] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="input-enterprise w-full"
                      />
                    </div>
                    <div>
                      <label className="small-label block text-[#64748B] mb-1">Designation</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="input-enterprise w-full"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-[#E2E8F0]">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
