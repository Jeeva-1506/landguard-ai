import React, { useState } from "react";
import { LandParcel } from "../types";
import { IndianRupee, CheckCircle2, Clock, AlertTriangle, Search } from "lucide-react";

interface CompensationViewProps {
  parcels: LandParcel[];
  globalSearchTerm: string;
  onUpdateParcel: (id: string, payload: Partial<LandParcel>) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function CompensationView({
  parcels,
  globalSearchTerm,
  onUpdateParcel,
  showToast
}: CompensationViewProps) {
  // Aggregate Compensation Figures
  let totalCompensation = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalDisputed = 0;

  parcels.forEach(p => {
    const amt = p.compensationAmount || 5000000;
    totalCompensation += amt;
    if (p.compensationStatus === 'Paid') totalPaid += amt;
    else if (p.compensationStatus === 'Pending') totalPending += amt;
    else totalDisputed += amt;
  });

  return (
    <div className="space-y-8 font-sans antialiased text-slate-800 pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-2xl font-bold text-slate-900 font-heading">
          Compensation & Payment Monitoring
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Monitor award determinations, bank account validations, escrow releases, and direct benefit payments to landowners.
        </p>
      </div>

      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Award Valuation</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">₹{(totalCompensation / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500">Determined compensation</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono">₹{(totalPaid / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-emerald-700 font-bold">Disbursed to landowners</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Release</span>
          <p className="text-2xl font-extrabold text-amber-600 font-mono">₹{(totalPending / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500">Under bank verification</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Disputed Escrow</span>
          <p className="text-2xl font-extrabold text-rose-600 font-mono">₹{(totalDisputed / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-rose-700 font-bold">In revenue court escrow</span>
        </div>
      </div>

      {/* COMPENSATION TABLE LEDGER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Landowner Compensation Disbursement Ledger ({parcels.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Survey Number</th>
                <th className="p-3">Project & District</th>
                <th className="p-3 text-center">Owner Count</th>
                <th className="p-3">Award Amount</th>
                <th className="p-3">Paid Amount</th>
                <th className="p-3">Pending Amount</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Delay Risk</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parcels.map((parcel) => {
                const award = parcel.compensationAmount || 5000000;
                const paid = parcel.compensationStatus === 'Paid' ? award : 0;
                const pending = award - paid;

                return (
                  <tr key={parcel.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold font-mono text-slate-900">
                      Survey {parcel.surveyNumber || "124/2"} <span className="text-[10px] text-slate-400">({parcel.id})</span>
                    </td>
                    <td className="p-3 text-slate-800">{parcel.projectId} ({parcel.district})</td>
                    <td className="p-3 text-center font-semibold">{parcel.ownersCount}</td>
                    <td className="p-3 font-bold text-slate-900 font-mono">₹{(award / 100000).toFixed(2)} Lakhs</td>
                    <td className="p-3 font-bold text-emerald-600 font-mono">₹{(paid / 100000).toFixed(2)} Lakhs</td>
                    <td className="p-3 font-bold text-amber-600 font-mono">₹{(pending / 100000).toFixed(2)} Lakhs</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        parcel.compensationStatus === 'Paid' ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                      }`}>
                        {parcel.compensationStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        parcel.riskLevel === 'Critical' || parcel.riskLevel === 'High' ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}>
                        {parcel.riskLevel || "High"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => showToast(`Opening payment record for Survey ${parcel.surveyNumber || parcel.id}...`, "success")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] cursor-pointer"
                      >
                        Verify Payment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
