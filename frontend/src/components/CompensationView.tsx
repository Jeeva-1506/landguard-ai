import React, { useState } from "react";
import { LandParcel } from "../types";
import { Coins, IndianRupee, Landmark, CheckCircle2, AlertTriangle, Scale, Check } from "lucide-react";

interface CompensationViewProps {
  parcels: LandParcel[];
  onUpdateParcel: (id: string, parcel: Partial<LandParcel>) => void;
}

export default function CompensationView({ parcels, onUpdateParcel }: CompensationViewProps) {
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Disputed'>('All');

  // Compute stats
  const totalAmount = parcels.reduce((sum, p) => sum + p.compensationAmount, 0);
  const paidAmount = parcels.filter(p => p.compensationStatus === "Paid").reduce((sum, p) => sum + p.compensationAmount, 0);
  const pendingAmount = parcels.filter(p => p.compensationStatus === "Pending").reduce((sum, p) => sum + p.compensationAmount, 0);
  const disputedAmount = parcels.filter(p => p.compensationStatus === "Disputed").reduce((sum, p) => sum + p.compensationAmount, 0);

  const totalCount = parcels.length;
  const paidCount = parcels.filter(p => p.compensationStatus === "Paid").length;
  const pendingCount = parcels.filter(p => p.compensationStatus === "Pending").length;
  const disputedCount = parcels.filter(p => p.compensationStatus === "Disputed").length;

  const filteredParcels = parcels.filter(p => filter === 'All' || p.compensationStatus === filter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDisburse = (parcelId: string) => {
    onUpdateParcel(parcelId, { compensationStatus: "Paid" });
    alert(`Compensation disbursement approved and cleared for Parcel ${parcelId}. Receipt generated.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">Compensation Award & Disbursement Registry</h3>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Approve compensation payouts, track disbursements, and audit active land valuation disputes</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total compensation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Allocated</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalAmount)}</h3>
          </div>
          <p className="text-slate-500 text-xs mt-3 font-semibold font-mono">{totalCount} surveyed parcels</p>
        </div>

        {/* Paid / Settled */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Disbursed & Settled</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">{formatCurrency(paidAmount)}</h3>
          </div>
          <p className="text-emerald-700 text-xs mt-3 font-semibold font-mono">{paidCount} Paid ({totalCount > 0 ? Math.round((paidCount/totalCount)*100) : 0}%)</p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Pending Escrow</p>
            <h3 className="text-2xl font-extrabold text-amber-600">{formatCurrency(pendingAmount)}</h3>
          </div>
          <p className="text-amber-700 text-xs mt-3 font-semibold font-mono">{pendingCount} claims outstanding</p>
        </div>

        {/* Dispute Claims */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Valuation Disputes</p>
            <h3 className="text-2xl font-extrabold text-rose-600">{formatCurrency(disputedAmount)}</h3>
          </div>
          <p className="text-rose-700 text-xs mt-3 font-semibold font-mono">{disputedCount} cases in High Court</p>
        </div>
      </div>

      {/* Tabs list filter */}
      <div className="flex gap-3 border-b border-slate-200 pb-px">
        {(['All', 'Paid', 'Pending', 'Disputed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all cursor-pointer ${
              filter === t 
                ? "border-blue-600 text-blue-600 font-extrabold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t === 'All' ? 'All Disbursements' : `${t} Status`}
          </button>
        ))}
      </div>

      {/* Claimant Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 font-bold text-slate-400 text-[11px] tracking-wider uppercase border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Parcel ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Project Hub</th>
                <th className="px-4 py-3 whitespace-nowrap">Owners</th>
                <th className="px-4 py-3 whitespace-nowrap">Award Compensation (INR)</th>
                <th className="px-4 py-3 whitespace-nowrap">Land Area</th>
                <th className="px-4 py-3 whitespace-nowrap">Objection Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Settlement Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Acquisition Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-700">
              {filteredParcels.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-extrabold text-slate-900 uppercase tracking-tight text-xs whitespace-nowrap">{p.id}</td>
                  <td className="px-4 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{p.projectId}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 text-xs whitespace-nowrap">{p.ownersCount} OWNER{p.ownersCount > 1 ? 'S' : ''}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 font-mono text-xs whitespace-nowrap">{formatCurrency(p.compensationAmount)}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 text-xs font-semibold whitespace-nowrap">{p.landArea} Ac</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {p.objectionFiled ? (
                      <span className="pulse-badge-warn">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Objection Raised
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Clear / No Objections
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {p.compensationStatus === "Paid" ? (
                      <span className="pulse-badge-up">
                        <span>↑</span> Disbursed
                      </span>
                    ) : p.compensationStatus === "Pending" ? (
                      <span className="pulse-badge-warn">
                        <span>•</span> Pending
                      </span>
                    ) : (
                      <span className="pulse-badge-alert">
                        <span>!</span> Disputed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {p.compensationStatus !== "Paid" ? (
                      <button
                        onClick={() => handleDisburse(p.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 font-bold text-white rounded-lg ml-auto transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Disburse Payout</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1.5 justify-end whitespace-nowrap">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Cleared</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredParcels.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium text-sm">
                    No active compensation claims match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
