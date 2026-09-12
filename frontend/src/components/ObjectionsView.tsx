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
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#12241C] pb-12 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)]">
        <h2 className="text-2xl font-extrabold text-[#0F382C] font-['Outfit']">
          Objection & Grievance Monitoring
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
          Monitor statutory Section-15 objections, legal writ petitions, boundary disputes, and compensation claims submitted by landowners.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Objection Category:</span>
          {["All", "Ownership", "Compensation", "Boundary", "Legal", "Public Objection"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0F382C] text-[#D8F374] shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* OBJECTIONS TABLE LEDGER — MATCHING USER REFERENCE IMAGE STYLE */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-[#0F382C] font-['Outfit']">
            Logged Section-15 Objections ({filtered.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Active landowner grievance filings requiring tahsildar inquiry or legal review.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Objection ID</th>
                <th className="table-header">Survey & Project Details</th>
                <th className="table-header">Category</th>
                <th className="table-header">Submitted Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Risk Impact</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filtered.map((obj) => (
                <tr key={obj.id} className="hover:bg-[#F6FAF5] transition-colors">
                  <td className="table-value-bold font-mono text-xs text-[#0F382C]">{obj.id}</td>
                  <td>
                    <div>
                      <p className="font-extrabold text-[#0F382C] font-['Outfit'] text-sm">
                        Survey {obj.surveyNumber} <span className="text-xs font-mono font-normal text-slate-400">({obj.parcelId})</span>
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{obj.project}</p>
                    </div>
                  </td>
                  <td className="font-bold text-[#0F382C] text-xs">{obj.objectionType}</td>
                  <td className="text-slate-500 text-xs font-medium">{obj.submittedDate}</td>
                  <td>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {obj.status}
                    </span>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      obj.riskImpact === 'Critical'
                        ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECDD3]"
                        : obj.riskImpact === 'High'
                          ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                          : "bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]"
                    }`}>
                      {obj.riskImpact}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => showToast(`Selected objection ${obj.id} for inquiry`, "success")}
                      className="bg-white border border-slate-200 hover:bg-[#F6FAF5] hover:border-[#0F382C] text-[#0F382C] font-extrabold text-xs px-5 py-1.5 rounded-full shadow-2xs cursor-pointer transition-all"
                    >
                      Select
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
