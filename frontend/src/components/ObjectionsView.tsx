import React, { useState } from "react";
import { ObjectionRecord } from "../types";
import { AlertTriangle, Filter, Search, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface ObjectionsViewProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function ObjectionsView({ showToast }: ObjectionsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const objections: ObjectionRecord[] = [
    {
      id: "OBJ-2026-01",
      surveyNumber: "124/2",
      parcelId: "LA1021",
      project: "NH-45 Chennai Outer Ring Extension",
      objectionType: "Ownership",
      submittedDate: "12 Jan 2026",
      status: "Under Inquiry",
      riskImpact: "Critical",
      expectedResolution: "Family partition hearing in Revenue Court",
      description: "Joint title dispute regarding ancestral land distribution."
    },
    {
      id: "OBJ-2026-02",
      surveyNumber: "219/4",
      parcelId: "LA1024",
      project: "NH-48 Villupuram Six-Laning",
      objectionType: "Compensation",
      submittedDate: "04 Feb 2026",
      status: "Hearing Scheduled",
      riskImpact: "High",
      expectedResolution: "Valuation review with Special Tahsildar",
      description: "Claim for commercial rate valuation due to roadside proximity."
    },
    {
      id: "OBJ-2026-03",
      surveyNumber: "305/1",
      parcelId: "LA1025",
      project: "NH-32 Salem Bypass Link",
      objectionType: "Boundary",
      submittedDate: "15 Feb 2026",
      status: "Received",
      riskImpact: "Medium",
      expectedResolution: "Re-survey of Field Measurement Book boundaries",
      description: "Discrepancy in plot width vs revenue survey map."
    },
    {
      id: "OBJ-2026-04",
      surveyNumber: "112/3",
      parcelId: "LA1026",
      project: "NH-66 Coastal Port Connectivity",
      objectionType: "Legal",
      submittedDate: "20 Feb 2026",
      status: "Under Inquiry",
      riskImpact: "Critical",
      expectedResolution: "Standing Counsel writ stay response filing",
      description: "Petition filed under Section 15 challenging acquisition notice."
    }
  ];

  const filtered = selectedCategory === "All"
    ? objections
    : objections.filter(o => o.objectionType === selectedCategory);

  return (
    <div className="space-y-8 font-sans antialiased text-slate-800 pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-2xl font-bold text-slate-900 font-heading">
          Objection & Grievance Monitoring
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Monitor statutory Section-15 objections, legal writ petitions, boundary disputes, and compensation claims submitted by landowners.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Objection Category Filter:</span>
          {["All", "Ownership", "Compensation", "Boundary", "Legal", "Public Objection"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* OBJECTIONS TABLE LEDGER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Logged Section-15 Objections ({filtered.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Objection ID</th>
                <th className="p-3">Survey Number</th>
                <th className="p-3">Project</th>
                <th className="p-3">Category</th>
                <th className="p-3">Submitted Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Impact</th>
                <th className="p-3">Expected Resolution</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((obj) => (
                <tr key={obj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold font-mono text-slate-900">{obj.id}</td>
                  <td className="p-3 font-bold font-mono text-blue-700">Survey {obj.surveyNumber}</td>
                  <td className="p-3 text-slate-800">{obj.project}</td>
                  <td className="p-3 font-semibold text-slate-700">{obj.objectionType}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{obj.submittedDate}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[10px]">
                      {obj.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      obj.riskImpact === 'Critical' ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {obj.riskImpact}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 max-w-xs truncate">{obj.expectedResolution}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => showToast(`Opening inquiry file for ${obj.id}...`, "success")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] cursor-pointer"
                    >
                      Inquire
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
