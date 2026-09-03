import React, { useState } from "react";
import { Alert } from "../types";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface AlertsViewProps {
  alerts: Alert[];
  globalSearchTerm?: string;
  onResolveAlert: (id: string) => void;
  onViewParcel: (parcelId: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function AlertsView({ alerts, globalSearchTerm = "", onResolveAlert, onViewParcel, showToast }: AlertsViewProps) {
  const [filter, setFilter] = useState<'All' | 'High' | 'Resolved'>('All');
  const [dispatchAlert, setDispatchAlert] = useState<Alert | null>(null);
  const [noticeText, setNoticeText] = useState("");

  const handleResolve = (id: string) => {
    onResolveAlert(id);
    if (showToast) {
      showToast("Early warning alert resolved and logged in audit registry.");
    }
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchAlert) return;
    if (showToast) {
      showToast(`Warning notice dispatched to District Officer for Parcel ${dispatchAlert.parcelId}.`);
    }
    setDispatchAlert(null);
  };

  const activeSearch = globalSearchTerm.trim().toLowerCase();
  const filteredAlerts = alerts.filter(a => {
    const matchesFilter = 
      filter === 'High' ? (a.priority === 'High' && a.status !== 'Resolved') :
      filter === 'Resolved' ? (a.status === 'Resolved') : true;

    const matchesSearch = !activeSearch || 
      a.id.toLowerCase().includes(activeSearch) || 
      a.parcelId.toLowerCase().includes(activeSearch) || 
      a.projectId.toLowerCase().includes(activeSearch) || 
      a.issue.toLowerCase().includes(activeSearch) || 
      a.projectName.toLowerCase().includes(activeSearch);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-[#0F172A] pb-12">
      <div>
        <h3 className="page-title">Early Warning Alerts</h3>
        <p className="text-[14px] text-[#475569] font-medium mt-0.5">
          Monitor automated project risk alerts, court stays, document omissions, and compensation delays
        </p>
      </div>

      {/* Mini tabs */}
      <div className="flex gap-2 bg-[#F1F5F9] p-1.5 rounded-full w-fit border border-[#CBD5E1]">
        {(['All', 'High', 'Resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
              filter === f 
                ? "bg-white text-[#0F172A] shadow-xs font-extrabold" 
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {f === 'All' ? 'All Alerts' : f === 'High' ? 'High Priority' : 'Resolved Logs'}
          </button>
        ))}
      </div>

      {/* Alerts list - MATCHING USER REFERENCE IMAGE EXACTLY */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-[16px] border transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 ${
              alert.status === 'Resolved' 
                ? "bg-[#F8FAFC] border-[#E2E8F0] opacity-80" 
                : alert.priority === "High" || alert.priority === "Critical"
                  ? "bg-[#FFF1F2] border-[#FECDD3] hover:border-[#FDA4AF] shadow-2xs"
                  : "bg-[#FFFBEB] border-[#FDE68A] hover:border-[#FCD34D] shadow-2xs"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Rounded soft icon box */}
              <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5 ${
                alert.status === 'Resolved' 
                  ? "bg-[#F1F5F9] text-[#64748B]" 
                  : alert.priority === "High" || alert.priority === "Critical"
                    ? "bg-[#FFE4E6] text-[#E11D48]"
                    : "bg-[#FEF3C7] text-[#D97706]"
              }`}>
                {alert.status === 'Resolved' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#0F172A] font-mono text-[14px]">{alert.parcelId}</span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span className="text-[13px] font-bold text-[#475569] font-mono">{alert.projectId}</span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span className="text-[12px] font-medium text-[#64748B]">{alert.timestamp}</span>
                  {alert.priority === "High" && alert.status !== 'Resolved' && (
                    <span className="bg-[#FFE4E6] text-[#E11D48] text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider border border-[#FECDD3]">
                      CRITICAL WARNING
                    </span>
                  )}
                </div>
                <h4 className="text-[17px] font-bold text-[#0F172A] mt-1.5">{alert.issue}</h4>
                <p className="text-[13px] text-[#64748B] font-medium mt-0.5">{alert.projectName}</p>
              </div>
            </div>

            {/* Actions button - ROUNDED PILL BUTTONS MATCHING SCREENSHOT */}
            <div className="flex gap-2 self-end md:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => {
                  setDispatchAlert(alert);
                  setNoticeText(`Urgent SLA Notice: Parcel ${alert.parcelId} requires immediate Revenue Officer review regarding ${alert.issue}.`);
                }}
                className="px-4 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-full text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                Dispatch Notice
              </button>

              <button
                onClick={() => onViewParcel(alert.parcelId)}
                className="px-4 py-1.5 border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#1E293B] rounded-full text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                Inspect Plot
              </button>

              {alert.status !== 'Resolved' && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-4 py-1.5 bg-[#0F172A] hover:bg-black text-white rounded-full text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-white p-12 rounded-[16px] border border-[#E2E8F0] text-center text-[#64748B] text-[15px] font-medium">
            No early warning alerts matching this category.
          </div>
        )}
      </div>

      {/* Dispatch Warning Notice Modal */}
      {dispatchAlert && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] border border-[#CBD5E1] shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div>
                <h4 className="text-[16px] font-bold text-[#0F172A]">Dispatch Revenue Warning Notice</h4>
                <p className="text-[12px] text-[#64748B] font-mono">Parcel ID: {dispatchAlert.parcelId}</p>
              </div>
              <button onClick={() => setDispatchAlert(null)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="small-label block text-[#64748B] mb-1.5">Official Administrative Directive</label>
                <textarea
                  rows={4}
                  required
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  className="input-enterprise w-full p-3 h-auto font-medium"
                />
              </div>

              <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] text-[#92400E] text-[12px]">
                Notice will be logged and transmitted directly to Special Tahsildar jurisdiction desk.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchAlert(null)}
                  className="btn-secondary rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-full text-[13px] font-bold cursor-pointer"
                >
                  Dispatch Official Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
