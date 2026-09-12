import React, { useState } from "react";
import { LandParcel, Project, Alert } from "../types";
import { Search, Info, X, MapPin, User, FileText, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink, Mail, Loader2 } from "lucide-react";
import { sendLandRiskAlert } from "../api";

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

  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  const handleSendEmailAlert = async (parcel: LandParcel | null) => {
    if (!parcel) return;
    setIsSendingEmail(true);
    try {
      await sendLandRiskAlert({
        landId: parcel.id,
        surveyNumber: parcel.surveyNumber,
        landRiskDetails: {
          projectName: parcel.projectId,
          surveyNumber: parcel.surveyNumber,
          ownerName: parcel.ownerName,
          district: parcel.district,
          state: parcel.state || "Tamil Nadu",
          taluk: parcel.taluk,
          village: parcel.village,
          landArea: parcel.landArea,
          landType: parcel.landType,
          riskLevel: parcel.riskLevel,
          delayProbability: parcel.delayProbability,
          expectedDelayDays: parcel.predictedDelayDays,
          legalIssues: parcel.courtCase ? "Active Court Case" : parcel.ownershipDispute ? "Title Dispute" : "None",
          documentStatus: parcel.documentsComplete ? "Verified" : "Under Verification",
          compensationStatus: parcel.compensationStatus,
          recommendedAction: parcel.recommendedAction || "Conduct title deed verification and revenue officer review.",
          riskFactors: [parcel.courtCase ? "Court Case Pending" : "Acquisition Delay Risk"]
        }
      });
      showToast(`Risk alert email dispatched for Survey #${parcel.surveyNumber}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send email risk alert", "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

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
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Project ID, Survey Number or Parcel ID (e.g. LA1021, 124/2, NH-45)..."
            className="input-enterprise w-full !pl-11 !pr-10 !bg-white !text-slate-900 placeholder:!text-slate-400 !font-semibold !text-sm border-2 border-slate-300 focus:border-[#0F382C] focus:bg-white transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
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
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-[#0F382C] font-['Outfit']">
            Land Parcels Inventory ({filteredParcels.length})
          </h3>
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
              {filteredParcels.map((parcel, idx) => {
                const surveyNo = parcel.surveyNumber || `12${5 + (idx % 7)}/${(idx % 4) + 1}`;
                const taluk = parcel.village || parcel.taluk || "Sriperumbudur";
                const area = (parcel.landArea || parcel.area || 2.5).toFixed(1);
                const titleStatus = parcel.ownershipDispute ? "Disputed" : "Clear Title";
                const stage = parcel.acquisitionStage || (idx % 2 === 0 ? "Negotiation" : "Objection");
                const paymentStatus = parcel.compensationStatus || "Pending";
                const legalStatus = parcel.courtCase ? "Litigation" : "Clear";
                const risk = parcel.riskLevel || "Medium";
                const delayDays = parcel.predictedDelayDays || 120;

                return (
                  <tr 
                    key={parcel.id} 
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setActiveParcelId(parcel.id);
                      setInspectingModalParcel(parcel);
                      showToast(`Inspecting Survey #${surveyNo}`, "success");
                    }}
                    className={`hover:bg-[#F6FAF5] cursor-pointer transition-colors border-b border-slate-100/70 ${
                      selectedParcel?.id === parcel.id ? "bg-[#F6FAF5] border-l-4 border-l-[#0F382C]" : ""
                    }`}
                  >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParcel(parcel);
                          setActiveParcelId(parcel.id);
                          setInspectingModalParcel(parcel);
                          showToast(`Inspecting Survey #${surveyNo}`, "success");
                        }}
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

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                onClick={() => handleSendEmailAlert(inspectingModalParcel)}
                disabled={isSendingEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email Risk Alert</span>
                  </>
                )}
              </button>

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
