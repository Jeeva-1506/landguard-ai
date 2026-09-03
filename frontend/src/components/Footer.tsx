import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F172A] text-[#94A3B8] font-sans border-t border-[#1E293B] text-[14px] select-none mt-12">
      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* BRAND */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-[17px]">
            <span className="w-6 h-6 rounded-[4px] bg-[#2563EB] text-white font-mono text-[12px] flex items-center justify-center font-bold">LT</span>
            <span>LANDTRACK</span>
          </div>
          <p className="text-[13px] text-[#94A3B8] leading-relaxed">
            Predictive Land Acquisition Monitoring System — Identifying land acquisition bottlenecks and predicting timeline delays before they impact infrastructure projects.
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="space-y-2">
          <h4 className="table-header text-[#CBD5E1]">System Navigation</h4>
          <ul className="space-y-1 text-[#94A3B8] text-[13px]">
            <li><a href="#dashboard" className="hover:text-white">Dashboard</a></li>
            <li><a href="#projects" className="hover:text-white">Projects Registry</a></li>
            <li><a href="#parcels" className="hover:text-white">Land Parcels Ledger</a></li>
            <li><a href="#predict-delay" className="hover:text-white">Delay Forecast Engine</a></li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div className="space-y-2">
          <h4 className="table-header text-[#CBD5E1]">Resources</h4>
          <ul className="space-y-1 text-[#94A3B8] text-[13px]">
            <li><span>Risk Scoring Guide</span></li>
            <li><span>Section 15 Compliance</span></li>
            <li><span>Documentation & Methodology</span></li>
          </ul>
        </div>

        {/* DISCLAIMER NOTICE */}
        <div className="space-y-2 bg-[#1E293B] p-4 rounded-[6px] border border-[#334155]">
          <span className="table-header text-[#D97706] block">
            System Notice
          </span>
          <p className="text-[12px] text-[#E2E8F0] leading-relaxed">
            Prototype / Demonstration System — Created for SIH Predictive Analytics Evaluation. Sample predictions are demonstration indicators and do not constitute official administrative decisions.
          </p>
        </div>

      </div>

      <div className="bg-[#020617] border-t border-[#1E293B] px-8 py-4 text-center text-[12px] text-[#64748B]">
        © 2026 LANDTRACK • Predictive Land Acquisition Monitoring System. All Rights Reserved.
      </div>
    </footer>
  );
}
