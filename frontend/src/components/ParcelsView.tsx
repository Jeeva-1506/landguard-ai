import React, { useState } from "react";
import { LandParcel, Project, Alert } from "../types";
import { Search, Info, X, MapPin, User, FileText, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink } from "lucide-react";

interface ParcelsViewProps {
  parcels: LandParcel[];
  projects: Project[];
  alerts: Alert[];
  globalSearchTerm: string;
  onAddParcel: (parcel: Partial<LandParcel>) => void;
  onUpdateParcel: (id: string, parcel: Partial<LandParcel>) => void;
  onDeleteParcel: (id: string) => void;
  activeParcelId: string | null;
  setActiveParcelId: (id: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function ParcelsView({
  parcels,
  projects,
  alerts,
  globalSearchTerm,
  onAddParcel,
  onUpdateParcel,
  onDeleteParcel,
  activeParcelId,
  setActiveParcelId,
  showToast
}: ParcelsViewProps) {
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");

  const [inspectingModalParcel, setInspectingModalParcel] = useState<LandParcel | null>(null);

  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(
    activeParcelId ? parcels.find(p => p.id === activeParcelId) || parcels[0] : parcels[0]
  );

  const effectiveSearch = (searchTerm || globalSearchTerm).toLowerCase().trim();

  // Filter parcels
  const filteredParcels = parcels.filter(p => {
    const matchesSearch = !effectiveSearch || 
      p.id.toLowerCase().includes(effectiveSearch) ||
      (p.surveyNumber && p.surveyNumber.toLowerCase().includes(effectiveSearch)) ||
      p.projectId.toLowerCase().includes(effectiveSearch) ||
      p.district.toLowerCase().includes(effectiveSearch);

    const matchesDistrict = selectedDistrict === "All" || p.district === selectedDistrict;
    const matchesRisk = selectedRisk === "All" || p.riskLevel === selectedRisk;
    const matchesStage = selectedStage === "All" || p.acquisitionStage === selectedStage;

    return matchesSearch && matchesDistrict && matchesRisk && matchesStage;
  });

  return (
    <div className="space-y-7 font-sans text-[#0F172A] pb-12">
      
      {/* PAGE HEADER */}
      <div>
        <h2 className="page-title">
          Land Survey Ledger & Parcel Risk Registry
        </h2>
        <p className="text-[14px] text-[#475569] mt-1 font-normal">
          Individual land survey plots, title verification, acquisition stage tracking and predictive risk scoring.
        </p>
      </div>

      {/* PROMINENT SEARCH & MULTI-FILTER BAR */}
      <div className="card-enterprise space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Project ID, Survey Number or Parcel ID (e.g. LA1021, 124/2, NH-45)..."
            className="input-enterprise w-full pl-10"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[14px]">
          <div>
            <label className="small-label block text-[#64748B] mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input-enterprise w-full font-semibold"
            >
              <option value="All">All Districts</option>
              <option value="Kanchipuram">Kanchipuram</option>
              <option value="Villupuram">Villupuram</option>
              <option value="Salem">Salem</option>
              <option value="Nagapattinam">Nagapattinam</option>
              <option value="Madurai">Madurai</option>
            </select>
          </div>

          <div>
            <label className="small-label block text-[#64748B] mb-1">Risk Level</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="input-enterprise w-full font-semibold"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>

          <div>
            <label className="small-label block text-[#64748B] mb-1">Acquisition Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="input-enterprise w-full font-semibold"
            >
              <option value="All">All Stages</option>
              <option value="Survey & Verification">Survey & Verification</option>
              <option value="Notification">Notification</option>
              <option value="Objection">Objection</option>
              <option value="Compensation">Compensation</option>
              <option value="Possession">Possession</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDistrict("All");
                setSelectedRisk("All");
                setSelectedStage("All");
              }}
              className="btn-secondary w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* PARCEL SELECTION DETAILED INSPECTOR CARD */}
      {selectedParcel && (
        <div id="selected-parcel-inspector" className="card-enterprise space-y-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[13px] text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-[4px] border border-[#BFDBFE]">
                  Survey No: {selectedParcel.surveyNumber || "124/2"} ({selectedParcel.id})
                </span>
                <span className={`status-badge ${
                  selectedParcel.riskLevel === 'Critical' || selectedParcel.riskLevel === 'High'
                    ? "status-badge-danger"
                    : "status-badge-success"
                }`}>
                  {selectedParcel.riskLevel || "High"} Risk Level
                </span>
              </div>

              {/* PROMINENT HEADING MATCHING REFERENCE IMAGE */}
              <h3 className="text-[22px] font-extrabold text-[#0A192F] mt-2 tracking-tight">
                {selectedParcel.projectId} Highway Acquisition Corridor
              </h3>

              <p className="text-[14px] text-[#475569] mt-0.5 font-medium">
                Location: {selectedParcel.village || "Sriperumbudur Village"}, {selectedParcel.taluk || "Sriperumbudur Taluk"}, {selectedParcel.district} District, {selectedParcel.state || "Tamil Nadu"}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F8FAFC] p-3 rounded-[6px] border border-[#E2E8F0] text-[14px]">
              <div>
                <span className="small-label block text-[#64748B]">Delay Probability</span>
                <span className="text-[20px] font-bold text-[#DC2626] font-mono">{selectedParcel.delayProbability || 82}%</span>
              </div>
              <div className="w-[1px] h-8 bg-[#E2E8F0]" />
              <div>
                <span className="small-label block text-[#64748B]">Expected Delay</span>
                <span className="text-[20px] font-bold text-[#0A192F] font-mono">{selectedParcel.predictedDelayDays || 45} Days</span>
              </div>
            </div>
          </div>

          {/* LAND & OWNERSHIP SPECIFICATIONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[14px]">
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B]">Land Area</span>
              <span className="table-value-bold">{selectedParcel.landArea} Acres</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B]">Land Classification</span>
              <span className="table-value-bold">{selectedParcel.landType}</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B]">Title Owners Count</span>
              <span className="table-value-bold">{selectedParcel.ownersCount} Share Holders</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B]">Acquisition Stage</span>
              <span className="table-value-bold text-[#2563EB]">{selectedParcel.acquisitionStage}</span>
            </div>
          </div>

          {/* FACTOR TO IMPACT RELATIONSHIP EXPLANATION */}
          <div className="p-4 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0] space-y-3">
            <h4 className="content-title-prominent flex items-center gap-2 text-[#0A192F]">
              <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="font-extrabold text-[17px] tracking-tight">Why is this parcel at risk? (Factor → Impact Relationship)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[14px]">
              <div className="p-3 bg-white rounded-[5px] border border-[#E2E8F0] space-y-1">
                <span className="table-value-bold block">1. Ownership Dispute</span>
                <span className="status-badge status-badge-danger">High Impact</span>
                <p className="text-[13px] text-[#475569] pt-1">Title deeds under family partition suit in district revenue court.</p>
              </div>

              <div className="p-3 bg-white rounded-[5px] border border-[#E2E8F0] space-y-1">
                <span className="table-value-bold block">2. Compensation Pending</span>
                <span className="status-badge status-badge-warning">Medium Impact</span>
                <p className="text-[13px] text-[#475569] pt-1">Award determined but pending bank account verification for direct transfer.</p>
              </div>

              <div className="p-3 bg-white rounded-[5px] border border-[#E2E8F0] space-y-1">
                <span className="table-value-bold block">3. Document Verification</span>
                <span className="status-badge status-badge-warning">Medium Impact</span>
                <p className="text-[13px] text-[#475569] pt-1">Revenue Patta / Chitta record mismatch detected during survey.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#DBEAFE] border border-[#BFDBFE] rounded-[5px] text-[14px] text-[#1E40AF] font-medium">
              <span className="font-bold block text-[#1E3A8A]">Recommended Action:</span>
              "{selectedParcel.recommendedAction || "Resolve ownership verification and compensation issues before proceeding to the next acquisition stage."}"
            </div>
          </div>
        </div>
      )}

      {/* PARCELS TABLE LEDGER */}
      <div className="card-enterprise space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3">
          <h3 className="section-title">
            Land Parcels Inventory ({filteredParcels.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Survey Number</th>
                <th className="table-header">Village & District</th>
                <th className="table-header">Area (Acres)</th>
                <th className="table-header">Ownership Status</th>
                <th className="table-header">Acquisition Stage</th>
                <th className="table-header">Compensation</th>
                <th className="table-header">Legal Status</th>
                <th className="table-header">Risk Level</th>
                <th className="table-header">Predicted Delay</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredParcels.map((parcel) => (
                <tr 
                  key={parcel.id} 
                  onClick={() => {
                    setSelectedParcel(parcel);
                    setActiveParcelId(parcel.id);
                    setInspectingModalParcel(parcel);
                    showToast(`Inspecting Survey #${parcel.surveyNumber || parcel.id}`, "success");
                  }}
                  className={`hover:bg-[#F8FAFC] cursor-pointer ${
                    selectedParcel?.id === parcel.id ? "bg-[#F1F5F9] border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <td className="table-value-bold font-mono text-[#0A192F]">
                    {parcel.surveyNumber || "124/2"} <span className="text-[12px] text-[#64748B]">({parcel.id})</span>
                  </td>
                  <td className="table-value-bold">{parcel.village || "Sriperumbudur"}, {parcel.district}</td>
                  <td className="font-bold text-[#0F172A]">{parcel.landArea}</td>
                  <td>
                    <span className={`status-badge ${
                      parcel.ownershipDispute ? "status-badge-danger" : "status-badge-success"
                    }`}>
                      {parcel.ownershipDispute ? "Disputed" : "Clear Title"}
                    </span>
                  </td>
                  <td className="font-semibold text-[#2563EB]">{parcel.acquisitionStage}</td>
                  <td>
                    <span className={`status-badge ${
                      parcel.compensationStatus === 'Paid' ? "status-badge-success" : "status-badge-warning"
                    }`}>
                      {parcel.compensationStatus}
                    </span>
                  </td>
                  <td className="text-[#475569]">{parcel.courtCase ? "Litigation" : "Clear"}</td>
                  <td>
                    <span className={`status-badge ${
                      parcel.riskLevel === 'Critical' || parcel.riskLevel === 'High' ? "status-badge-danger" : "status-badge-success"
                    }`}>
                      {parcel.riskLevel || "High"}
                    </span>
                  </td>
                  <td className="table-value-bold font-mono">
                    {parcel.predictedDelayDays || 45} Days
                  </td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedParcel(parcel);
                        setActiveParcelId(parcel.id);
                        setInspectingModalParcel(parcel);
                        showToast(`Inspecting Survey #${parcel.surveyNumber || parcel.id}`, "success");
                        const el = document.getElementById("selected-parcel-inspector");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-[13px] transition-all cursor-pointer shadow-2xs border border-blue-500 flex items-center gap-1 ml-auto"
                    >
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PARCEL INSPECTION DETAILED MODAL POPUP */}
      {inspectingModalParcel && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Survey Inspection Record: #{inspectingModalParcel.surveyNumber || "124/2"}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    Parcel ID: {inspectingModalParcel.id} • Corridor: {inspectingModalParcel.projectId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingModalParcel(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner Name</span>
                <strong className="text-slate-900 text-sm">{inspectingModalParcel.ownerName || "R. Subramani & Bros"}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Land Area</span>
                <strong className="text-slate-900 text-sm">{inspectingModalParcel.landArea} Acres</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Acquisition Stage</span>
                <strong className="text-blue-700 text-sm">{inspectingModalParcel.acquisitionStage}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Compensation Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  inspectingModalParcel.compensationStatus === 'Paid' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {inspectingModalParcel.compensationStatus}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  inspectingModalParcel.riskLevel === 'High' || inspectingModalParcel.riskLevel === 'Critical' ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {inspectingModalParcel.riskLevel || "High"} Risk ({inspectingModalParcel.riskScore || 82}%)
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Delay</span>
                <strong className="text-rose-700 text-sm font-mono">{inspectingModalParcel.predictedDelayDays || 45} Days</strong>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-extrabold block text-blue-950">Recommended Action Plan:</span>
              <p className="leading-snug">{inspectingModalParcel.recommendedAction || "Resolve ownership verification and compensation issues before proceeding to the next acquisition stage."}</p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setInspectingModalParcel(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
