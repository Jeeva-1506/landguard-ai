import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Bell, X, User, Edit3, Save, CheckCircle2, Shield, Mail, Phone, MapPin, Building, ArrowRight } from "lucide-react";
import { Alert } from "../types";

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
  title: string;
  subtitle: string;
  alerts: Alert[];
  userProfile: UserProfileData;
  onUpdateProfile: (updated: UserProfileData) => void;
  onSearch: (term: string) => void;
  setActiveTab: (tab: string) => void;
  onViewParcel: (parcelId: string) => void;
}

export default function Navbar({
  title,
  subtitle,
  alerts,
  userProfile,
  onUpdateProfile,
  onSearch,
  setActiveTab,
  onViewParcel
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Ref for click outside notification popover
  const notificationRef = useRef<HTMLDivElement>(null);

  // Local edit profile state
  const [editForm, setEditForm] = useState<UserProfileData>(userProfile);

  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');
  const alertCount = activeAlerts.length;

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  // Handle click outside to close notification popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    alert("Profile updated successfully!");
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 select-none z-30 sticky top-0 shadow-2xs">
      {/* Page Titles */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-heading">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle} • {formattedDate}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search records..."
            onChange={(e) => onSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 placeholder-slate-400 font-medium transition-all"
          />
        </div>

        {/* Interactive Bell Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
            title="System Early Warnings & Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Interactive User Profile Trigger */}
        <div
          onClick={handleOpenProfile}
          className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
          title="Click to view/edit user profile"
        >
          <div className="text-right flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-900 leading-none">{userProfile.name}</span>
            <span className="text-[11px] text-slate-500 mt-1 font-semibold leading-none">{userProfile.title}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-xs font-mono">
            {userProfile.initials || "JS"}
          </div>
        </div>
      </div>

      {/* REACT PORTAL: Notifications Popover Dropdown (Mounted directly on document.body for top z-index above map) */}
      {showNotifications && createPortal(
        <div
          ref={notificationRef}
          className="fixed right-20 top-20 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[999999] overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Early Warning Notifications ({alertCount})</h4>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  setShowNotifications(false);
                  onViewParcel(alert.parcelId);
                }}
                className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alert.priority === "High" ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-slate-900">Parcel {alert.parcelId}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      alert.priority === "High" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-1 line-clamp-2">{alert.issue}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">{alert.projectName}</span>
                </div>
              </div>
            ))}
            {activeAlerts.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs font-medium">
                No active system warnings. All SLA metrics normal.
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setShowNotifications(false);
                setActiveTab("alerts");
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1.5 w-full cursor-pointer"
            >
              <span>View Early Warning Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* REACT PORTAL: USER PROFILE VIEW & EDIT MODAL (Mounted directly on document.body) */}
      {showProfileModal && createPortal(
        <div
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[999999] flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white font-mono">
                  {editForm.initials}
                </div>
                <div>
                  <h3 className="font-bold text-base">{userProfile.name}</h3>
                  <p className="text-slate-400 text-xs">{userProfile.title} • {userProfile.department}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!isEditing ? (
                /* READ-ONLY VIEW MODE */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Full Name</span>
                      <span className="font-bold text-slate-900">{userProfile.name}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Designation</span>
                      <span className="font-bold text-slate-900">{userProfile.title}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
                      <span className="font-semibold text-slate-800">{userProfile.department}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Jurisdiction</span>
                      <span className="font-semibold text-slate-800">{userProfile.district}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Official Email</span>
                      <span className="font-semibold text-slate-800">{userProfile.email}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Phone Number</span>
                      <span className="font-semibold text-slate-800">{userProfile.phone}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      Role: {userProfile.role}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile Info</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM MODE */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Avatar Initials</label>
                      <input
                        type="text"
                        maxLength={3}
                        required
                        value={editForm.initials}
                        onChange={(e) => setEditForm({ ...editForm, initials: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
                      <input
                        type="text"
                        required
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jurisdiction / District</label>
                      <input
                        type="text"
                        required
                        value={editForm.district}
                        onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Official Email</label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
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

