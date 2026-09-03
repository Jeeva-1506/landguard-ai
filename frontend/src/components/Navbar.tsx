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
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-40 select-none shadow-xs font-sans">
      
      {/* 1. TOP HEADER BRAND & USER CONTROLS */}
      <div className="max-w-7xl mx-auto px-8 h-[64px] flex items-center justify-between">
        
        {/* BRAND TITLE */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-[36px] h-[36px] bg-[#0F172A] text-white font-semibold flex items-center justify-center text-[15px] rounded-[5px] font-mono">
            LT
          </div>
          <div>
            <h1 className="text-[20px] font-semibold text-[#0F172A] leading-none tracking-tight">
              LANDTRACK
            </h1>
            <p className="text-[12px] text-[#64748B] font-normal leading-none mt-1">
              Predictive Land Acquisition Monitoring System
            </p>
          </div>
        </div>

        {/* SEARCH & RIGHT CONTROLS */}
        <div className="flex items-center gap-4">
          
          {/* SEARCH FIELD */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={globalSearchTerm}
                placeholder="Search Project ID, Survey Number..."
                onChange={(e) => {
                  onSearch(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="input-enterprise w-[280px] pl-9"
              />
              {globalSearchTerm && (
                <button 
                  onClick={() => { onSearch(""); setShowSearchDropdown(false); }}
                  className="absolute right-2.5 p-0.5 text-[#94A3B8] hover:text-[#1E293B] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Popover */}
            {showSearchDropdown && trimmedSearch.length > 0 && (
              <div className="absolute right-0 top-12 w-[380px] bg-white border border-[#CBD5E1] rounded-[6px] shadow-lg z-50 max-h-96 overflow-y-auto divide-y divide-[#F1F5F9] animate-in fade-in">
                <div className="px-4 py-2 bg-[#0F172A] text-white flex items-center justify-between text-[12px] font-semibold">
                  <span>Search Matches ({totalMatches})</span>
                  <span className="text-[11px] text-[#94A3B8]">Click to view</span>
                </div>

                {matchingProjects.length > 0 && (
                  <div className="p-2">
                    <div className="table-header px-2 py-1">Projects ({matchingProjects.length})</div>
                    {matchingProjects.map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => { setActiveTab("projects"); setShowSearchDropdown(false); }}
                        className="px-3 py-2 hover:bg-[#F8FAFC] rounded-[4px] cursor-pointer flex items-center justify-between text-[14px]"
                      >
                        <div>
                          <p className="font-semibold text-[#0F172A]">{proj.id} - {proj.name}</p>
                          <p className="text-[12px] text-[#64748B]">{proj.district}, {proj.state}</p>
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
                        className="px-3 py-2 hover:bg-[#F8FAFC] rounded-[4px] cursor-pointer flex items-center justify-between text-[14px]"
                      >
                        <div>
                          <p className="font-semibold text-[#0F172A]">Survey No: {parcel.surveyNumber || parcel.id}</p>
                          <p className="text-[12px] text-[#64748B]">{parcel.district} • {parcel.landArea} Acres</p>
                        </div>
                        <span className="status-badge status-badge-neutral">{parcel.acquisitionStage}</span>
                      </div>
                    ))}
                  </div>
                )}

                {totalMatches === 0 && (
                  <div className="p-4 text-center text-[#64748B] text-[13px] font-normal">No matching records found</div>
                )}
              </div>
            )}
          </div>

          {/* DESIGNATION TOGGLE */}
          <button
            onClick={() => setUserRole(userRole === 'Administrator' ? 'Project Officer' : 'Administrator')}
            className="btn-secondary"
            title="Switch User Designation"
          >
            <Shield className="w-4 h-4 text-[#2563EB]" />
            <span>{userRole}</span>
          </button>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-[38px] h-[38px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-[#F1F5F9] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#475569]" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#DC2626] text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
          </div>

          {/* SETTINGS SHORTCUT */}
          <button
            onClick={() => setActiveTab("settings")}
            className="w-[38px] h-[38px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-[#F1F5F9] transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-[#475569]" />
          </button>

          {/* OFFICER PROFILE */}
          <div 
            onClick={handleOpenProfile}
            className="flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0] cursor-pointer hover:opacity-85"
          >
            <div className="w-[36px] h-[36px] bg-[#0F172A] text-white font-semibold text-[13px] flex items-center justify-center rounded-[5px] font-mono">
              {userProfile.initials || "JS"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[14px] font-semibold text-[#0F172A] leading-tight">{userProfile.name}</p>
              <p className="text-[12px] text-[#64748B] font-normal leading-tight mt-0.5">{userProfile.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOWER NAVIGATION MENU BAR */}
      <div className="bg-[#0F172A] text-white px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1 py-1 text-[14px] font-medium">
            {mainNavLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-[5px] flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#DC2626] text-white text-[11px] font-semibold rounded-[4px]">
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
