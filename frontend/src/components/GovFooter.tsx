import React from "react";
import { Landmark, Shield, PhoneCall, Mail, Globe, ExternalLink } from "lucide-react";

export default function GovFooter() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 font-sans border-t border-slate-800 text-xs select-none mt-12">
      {/* TRICOLOR TOP BAR */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* MAIN FOOTER BODY */}
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Col 1: Government Authority */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-extrabold font-heading text-base">
            <Landmark className="w-5 h-5 text-amber-500" />
            <span>BHOOMI RASHI PORTAL</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Designed & developed for the Ministry of Road Transport and Highways (MoRTH), Government of India, to provide a single-point online platform for processing land acquisition notifications.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            Version 2.4.0 (2026) • LandGuard AI Engine Enabled
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">e-Governance Links</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="http://bhoomirashi.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>Bhoomi Rashi Official Web Portal</span>
              </a>
            </li>
            <li>
              <a href="https://morth.nic.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>Ministry of Road Transport & Highways (MoRTH)</span>
              </a>
            </li>
            <li>
              <a href="https://nhai.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>National Highways Authority of India (NHAI)</span>
              </a>
            </li>
            <li>
              <a href="https://pfms.nic.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>Public Financial Management System (PFMS)</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Statutory & Help Desk */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Help Desk & Contact</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Toll-Free Helpline: 1800-111-555</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span>bhoomirashi-helpdesk@gov.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Transport Bhawan, 1 Parliament St, New Delhi</span>
            </div>
          </div>
        </div>

        {/* Col 4: Digital India & Hosting Info */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
            <Shield className="w-4 h-4" />
            <span>Digital India Initiative</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hosted by National Informatics Centre (NIC) / C-DAC. Integrated with PFMS for direct benefit disbursement to landowner bank accounts.
          </p>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            Last Updated: 02 September 2026 | Content Managed by MoRTH
          </div>
        </div>

      </div>

      {/* BOTTOM COPYRIGHT BANNER */}
      <div className="bg-slate-900 border-t border-slate-800 px-8 py-4 text-center text-[11px] text-slate-500">
        © 2026 Ministry of Road Transport and Highways, Government of India. All Rights Reserved. Designed for Land Acquisition Management.
      </div>
    </footer>
  );
}
