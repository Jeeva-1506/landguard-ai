import React from "react";
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
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#12241C] pb-12 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)]">
        <h2 className="text-2xl font-extrabold text-[#0F382C] font-['Outfit']">
          Compensation & Payment Monitoring
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
          Monitor award determinations, bank account validations, escrow releases, and direct benefit payments to landowners.
        </p>
      </div>

      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Total Award Valuation</span>
          <p className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">₹{(totalCompensation / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 font-medium">Determined compensation</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Total Paid</span>
          <p className="text-3xl font-extrabold text-emerald-600 font-['Outfit']">₹{(totalPaid / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-emerald-700 font-bold">Disbursed to landowners</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Pending Release</span>
          <p className="text-3xl font-extrabold text-amber-600 font-['Outfit']">₹{(totalPending / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 font-medium">Under bank verification</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Disputed Escrow</span>
          <p className="text-3xl font-extrabold text-rose-600 font-['Outfit']">₹{(totalDisputed / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-rose-700 font-bold">In revenue court escrow</span>
        </div>
      </div>

      {/* COMPENSATION TABLE LEDGER — EXACTLY MATCHING USER REFERENCE IMAGE */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-[#0F382C] font-['Outfit']">
            Landowner Compensation Disbursement Ledger ({parcels.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Detailed ledger of land plot survey numbers, area, stage, payment status, delay forecast, and inspection actions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Survey No</th>
                <th className="table-header">Location / District</th>
                <th className="table-header text-center">Area (Acres)</th>
                <th className="table-header text-center">Title Status</th>
                <th className="table-header text-center">Acquisition Stage</th>
                <th className="table-header text-center">Payment</th>
                <th className="table-header text-center">Legal Status</th>
                <th className="table-header text-center">Risk Level</th>
                <th className="table-header text-center">Predicted Delay</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {parcels.map((parcel, idx) => {
                const surveyNo = parcel.surveyNumber || `12${5 + (idx % 7)}/${(idx % 4) + 1}`;
                const taluk = parcel.taluk || "Sriperumbudur";
                const area = (parcel.landArea || parcel.area || 2.5).toFixed(1);
                const titleStatus = parcel.ownershipDispute ? "Disputed" : "Clear Title";
                const stage = parcel.acquisitionStage || (idx % 2 === 0 ? "Negotiation" : "Objection");
                const paymentStatus = parcel.compensationStatus || "Pending";
                const legalStatus = parcel.courtCase ? "Litigation" : "Clear";
                const risk = parcel.riskLevel || "Medium";
                const delayDays = parcel.predictedDelayDays || 120;

                return (
                  <tr key={parcel.id} className="hover:bg-[#F6FAF5] transition-colors border-b border-slate-100/70">
                    
                    {/* 1. Survey Number & Parcel ID */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-extrabold text-[#0F382C] font-['Outfit'] text-sm sm:text-base leading-tight">
                          {surveyNo}
                        </p>
                        <p className="text-xs font-mono text-slate-400 font-medium mt-0.5">
                          ({parcel.id})
                        </p>
                      </div>
                    </td>

                    {/* 2. Location (Taluk, District) */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F382C] font-['Outfit'] text-xs sm:text-sm leading-snug">
                        {taluk},<br />
                        <span className="text-slate-600 font-medium">{parcel.district}</span>
                      </div>
                    </td>

                    {/* 3. Area (Acres) - LARGE NUMBER SIZE MATCHING USER IMAGE */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-[#0F382C] font-['Outfit'] text-base sm:text-lg">
                        {area}
                      </span>
                    </td>

                    {/* 4. Title Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
                        titleStatus === 'Disputed'
                          ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECDD3]"
                          : "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      }`}>
                        {titleStatus}
                      </span>
                    </td>

                    {/* 5. Acquisition Stage */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-[#2563EB] text-xs sm:text-sm font-['Outfit'] whitespace-nowrap">
                        {stage}
                      </span>
                    </td>

                    {/* 6. Payment Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
                        paymentStatus === 'Paid'
                          ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                          : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                      }`}>
                        {paymentStatus}
                      </span>
                    </td>

                    {/* 7. Legal Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-slate-600 font-semibold text-xs sm:text-sm">
                        {legalStatus}
                      </span>
                    </td>

                    {/* 8. Risk Level */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
                        risk === 'Critical' || risk === 'High'
                          ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECDD3]"
                          : risk === 'Medium'
                            ? "bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]"
                            : "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                      }`}>
                        {risk}
                      </span>
                    </td>

                    {/* 9. Predicted Delay Days - LARGE NUMBER SIZE MATCHING USER IMAGE */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-[#0F382C] font-['Outfit'] text-base sm:text-lg whitespace-nowrap">
                        {delayDays} Days
                      </span>
                    </td>

                    {/* 10. Blue Action Button (Inspect) */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(`Inspecting parcel ${parcel.id} (${surveyNo}) details...`, "success")}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer transition-all inline-flex items-center justify-center whitespace-nowrap"
                      >
                        Inspect
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
