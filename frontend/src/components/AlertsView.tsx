import React, { useState } from "react";
import { Alert } from "../types";
import { AlertTriangle, CheckCircle, Clock, ArrowRight, ShieldCheck, Scale } from "lucide-react";

interface AlertsViewProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
  onViewParcel: (parcelId: string) => void;
}

export default function AlertsView({ alerts, onResolveAlert, onViewParcel }: AlertsViewProps) {
  const [filter, setFilter] = useState<'All' | 'High' | 'Resolved'>('All');

  const handleResolve = (id: string) => {
    onResolveAlert(id);
    alert(`Alert warning resolved. Status updated in audit logs.`);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'High') return a.priority === 'High' && a.status !== 'Resolved';
    if (filter === 'Resolved') return a.status === 'Resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">Early Warning Alerts</h3>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Monitor automated project risk alerts, court stays, document omissions, and compensation delays</p>
      </div>

      {/* Mini tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200">
        {(['All', 'High', 'Resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              filter === f 
                ? "bg-white text-slate-900 shadow-sm font-extrabold" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {f === 'All' ? 'All Alerts' : f === 'High' ? 'High Priority' : 'Resolved Logs'}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 ${
              alert.status === 'Resolved' 
                ? "bg-slate-50 border-slate-200 opacity-75" 
                : alert.priority === "High"
                  ? "bg-rose-50/50 border-rose-200 hover:bg-rose-50/80 shadow-sm"
                  : "bg-amber-50/50 border-amber-200 hover:bg-amber-50/80 shadow-sm"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                alert.status === 'Resolved' 
                  ? "bg-slate-100 text-slate-500" 
                  : alert.priority === "High"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-amber-100 text-amber-600"
              }`}>
                {alert.status === 'Resolved' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 font-mono text-base">{alert.parcelId}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm font-bold text-slate-600 font-mono">{alert.projectId}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-400">{alert.timestamp}</span>
                  {alert.priority === "High" && alert.status !== 'Resolved' && (
                    <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-rose-200">
                      CRITICAL WARNING
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">{alert.issue}</h4>
                <p className="text-sm text-slate-500 font-medium mt-0.5">{alert.projectName}</p>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex gap-3 self-end md:self-auto shrink-0">
              <button
                onClick={() => onViewParcel(alert.parcelId)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                Inspect Parcel
              </button>

              {alert.status !== 'Resolved' && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-base font-medium">
            No early warning alerts matching this category.
          </div>
        )}
      </div>
    </div>
  );
}
