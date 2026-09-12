import React, { useState } from "react";
import { Alert } from "../types";
import { AlertTriangle, ShieldCheck, Mail, MessageSquare, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { sendLandRiskAlert } from "../api";

interface AlertsViewProps {
  alerts: Alert[];
  globalSearchTerm?: string;
  onResolveAlert: (id: string) => void;
  onViewParcel: (parcelId: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function AlertsView({ alerts, globalSearchTerm = "", onResolveAlert, onViewParcel, showToast }: AlertsViewProps) {
  const [filter, setFilter] = useState<'All' | 'High' | 'Resolved'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dispatchAlert, setDispatchAlert] = useState<Alert | null>(null);
  const [noticeText, setNoticeText] = useState("");
  const [selectedLogsAlert, setSelectedLogsAlert] = useState<Alert | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleResolve = (id: string) => {
    onResolveAlert(id);
    if (showToast) {
      showToast("Early warning alert resolved and logged in audit registry.");
    }
  };

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchAlert) return;
    setIsDispatching(true);
    try {
      await sendLandRiskAlert({
        landId: dispatchAlert.parcelId,
        surveyNumber: dispatchAlert.parcelId,
        landRiskDetails: {
          projectName: dispatchAlert.projectName || dispatchAlert.projectId,
          surveyNumber: dispatchAlert.parcelId,
          riskLevel: dispatchAlert.priority === "High" || dispatchAlert.priority === "Critical" ? "High" : "Medium",
          delayProbability: dispatchAlert.priority === "High" ? 85 : 55,
          expectedDelayDays: dispatchAlert.priority === "High" ? 90 : 45,
          district: "Kanchipuram",
          recommendedAction: noticeText || dispatchAlert.recommendedAction,
          riskFactors: [dispatchAlert.issue]
        }
      });
      if (showToast) {
        showToast(`Warning notice email dispatched for Parcel ${dispatchAlert.parcelId}.`, "success");
      }
    } catch (err: any) {
      if (showToast) {
        showToast(err.message || "Failed to dispatch notice email", "error");
      }
    } finally {
      setIsDispatching(false);
      setDispatchAlert(null);
    }
  };

  const activeSearch = globalSearchTerm.trim().toLowerCase();
  const filteredAlerts = alerts.filter(a => {
    const matchesFilter = 
      filter === 'High' ? (a.priority === 'High' && a.status !== 'Resolved') :
      filter === 'Resolved' ? (a.status === 'Resolved') : true;

    const matchesCategory = categoryFilter === 'All' || a.issueType === categoryFilter;

    const matchesSearch = !activeSearch || 
      a.id.toLowerCase().includes(activeSearch) || 
      a.parcelId.toLowerCase().includes(activeSearch) || 
      a.projectId.toLowerCase().includes(activeSearch) || 
      a.issue.toLowerCase().includes(activeSearch) || 
      a.projectName.toLowerCase().includes(activeSearch);

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'All', label: 'All Categories' },
    { id: 'HIGH_DELAY_RISK', label: 'High Delay Risk' },
    { id: 'LEGAL_ISSUE', label: 'Legal Issue' },
    { id: 'DOCUMENT_MISMATCH', label: 'Document Mismatch' },
    { id: 'COMPENSATION_PENDING', label: 'Compensation Pending' },
    { id: 'SURVEY_ISSUE', label: 'Survey Issue' },
    { id: 'CRITICAL_ALERT', label: 'Critical Warning' }
  ];

  return (
    <div className="space-y-6 font-sans text-[#0F172A] pb-12">
      <div>
        <h3 className="page-title">Early Warning & Multi-Channel Notification Center</h3>
        <p className="text-[14px] text-[#475569] font-medium mt-0.5">
          Automated multi-tier alert routing to District, Revenue, Legal & Survey Officers via In-App, Email, and WhatsApp Cloud API
        </p>
      </div>

      {/* Primary & Category Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1]">
          {(['All', 'High', 'Resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f 
                  ? "bg-white text-[#0F172A] shadow-xs font-extrabold" 
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {f === 'All' ? 'All Alerts' : f === 'High' ? 'High Priority' : 'Resolved Logs'}
            </button>
          ))}
        </div>

        {/* Issue Type Dropdown Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500">Filter Issue:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts list */}
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
                  
                  {/* Category Pill */}
                  <span className="bg-slate-200 text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {alert.issueType || "HIGH_DELAY_RISK"}
                  </span>

                  {alert.priority === "High" && alert.status !== 'Resolved' && (
                    <span className="bg-[#FFE4E6] text-[#E11D48] text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider border border-[#FECDD3]">
                      CRITICAL WARNING
                    </span>
                  )}
                </div>

                <h4 className="text-[16px] font-bold text-[#0F172A] mt-1.5">{alert.issue}</h4>
                <p className="text-[13px] text-[#64748B] font-medium mt-0.5">{alert.projectName}</p>
                <p className="text-[12px] text-blue-700 font-semibold mt-1">Recommended: {alert.recommendedAction}</p>

                {/* Multi-Channel Delivery Badges */}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-200/60 text-[11px] flex-wrap">
                  {/* Email Channel Status */}
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      alert.emailStatus === 'SENT' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {alert.emailStatus === 'SENT' ? 'SENT' : 'DEMO MODE (Provider not configured)'}
                    </span>
                  </div>

                  {/* WhatsApp Channel Status */}
                  <div className="flex items-center gap-1.5 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      alert.whatsappStatus === 'SENT' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {alert.whatsappStatus === 'SENT' ? 'SENT' : 'DEMO MODE (Provider not configured)'}
                    </span>
                  </div>

                  {/* View Log Button */}
                  <button
                    onClick={() => setSelectedLogsAlert(alert)}
                    className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-0.5 cursor-pointer ml-auto"
                  >
                    <Info className="w-3 h-3" />
                    <span>Audit Dispatch Logs</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions button */}
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

      {/* Dispatch Audit Logs Modal */}
      {selectedLogsAlert && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] border border-[#CBD5E1] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div>
                <h4 className="text-[16px] font-bold text-[#0F172A]">Notification Dispatch Audit Trail</h4>
                <p className="text-[12px] text-[#64748B] font-mono">Alert ID: {selectedLogsAlert.id} | {selectedLogsAlert.parcelId}</p>
              </div>
              <button onClick={() => setSelectedLogsAlert(null)} className="p-1 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <span className="font-bold">Provider Status:</span> Production credentials (`EMAIL_API_KEY`, `WHATSAPP_ACCESS_TOKEN`) can be specified in `.env`. Currently operating in safe DEMO notification mode.
              </div>

              {(selectedLogsAlert.deliveryLogs && selectedLogsAlert.deliveryLogs.length > 0) ? (
                selectedLogsAlert.deliveryLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Channel: {log.channel}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{log.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-4 text-center">
                  No previous dispatch logs recorded for this alert.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogsAlert(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

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
                  disabled={isDispatching}
                  className="px-5 py-2 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-50 text-white rounded-full text-[13px] font-bold cursor-pointer flex items-center gap-2"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <span>Transmit Directive Notice</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
