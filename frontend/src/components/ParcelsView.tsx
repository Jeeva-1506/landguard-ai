import React, { useState } from "react";
import { LandParcel, Project, Alert } from "../types";
import { 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  Coins, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  FolderLock,
  Compass,
  ArrowRight,
  Sparkles,
  UserCheck,
  Check,
  Trash2,
  CalendarDays,
  Play
} from "lucide-react";

interface ParcelsViewProps {
  parcels: LandParcel[];
  projects: Project[];
  alerts: Alert[];
  onAddParcel: (parcel: Partial<LandParcel>) => void;
  onUpdateParcel: (id: string, parcel: Partial<LandParcel>) => void;
  onDeleteParcel: (id: string) => void;
  activeParcelId: string | null;
  setActiveParcelId: (id: string | null) => void;
}

export default function ParcelsView({ 
  parcels, 
  projects, 
  alerts, 
  onAddParcel, 
  onUpdateParcel, 
  onDeleteParcel,
  activeParcelId,
  setActiveParcelId
}: ParcelsViewProps) {
  // Navigation inside Parcels Module
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'details'>(
    activeParcelId ? 'details' : 'list'
  );
  
  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Parcel Multi-section Form State
  const [parcelId, setParcelId] = useState("");
  const [projId, setProjId] = useState("NH-45");
  const [district, setDistrict] = useState("Kanchipuram");
  const [landArea, setLandArea] = useState(2.4);
  const [landType, setLandType] = useState<'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Barren'>("Agricultural");
  const [ownersCount, setOwnersCount] = useState(3);
  const [ownershipDispute, setOwnershipDispute] = useState(false);
  const [documentsComplete, setDocumentsComplete] = useState(false);
  const [compensationStatus, setCompensationStatus] = useState<'Paid' | 'Pending' | 'Disputed'>("Pending");
  const [compensationAmount, setCompensationAmount] = useState(850000);
  const [objectionFiled, setObjectionFiled] = useState(false);
  const [courtCase, setCourtCase] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(true);
  const [environmentalClearance, setEnvironmentalClearance] = useState(false);
  const [governmentApproval, setGovernmentApproval] = useState(false);
  const [acquisitionStage, setAcquisitionStage] = useState<'Survey' | 'Notification' | 'Negotiation' | 'Compensation' | 'Agreement' | 'Possession'>("Negotiation");
  const [previousDelay, setPreviousDelay] = useState(false);
  const [distanceFromProject, setDistanceFromProject] = useState(4.2);
  const [complaintText, setComplaintText] = useState("");

  // Assign action state in Detail view
  const [assignedAction, setAssignedAction] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({});

  // Active Parcel details target
  const activeParcel = parcels.find(p => p.id === (activeParcelId || ""));

  const triggerViewParcel = (id: string) => {
    setActiveParcelId(id);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setActiveParcelId(null);
    setViewMode('list');
  };

  const handleOpenAddForm = () => {
    setParcelId(`LA${Date.now().toString().slice(-4)}`);
    setProjId("NH-45");
    setDistrict("Kanchipuram");
    setLandArea(2.5);
    setLandType("Agricultural");
    setOwnersCount(2);
    setOwnershipDispute(false);
    setDocumentsComplete(true);
    setCompensationStatus("Pending");
    setCompensationAmount(1200000);
    setObjectionFiled(false);
    setCourtCase(false);
    setSurveyCompleted(true);
    setEnvironmentalClearance(true);
    setGovernmentApproval(true);
    setAcquisitionStage("Survey");
    setPreviousDelay(false);
    setDistanceFromProject(1.5);
    setComplaintText("");
    setViewMode('add');
  };

  const handleSaveParcel = (e: React.FormEvent, runPrediction: boolean) => {
    e.preventDefault();
    if (!parcelId || !projId || !district) {
      alert("Please fill in basic fields: Parcel ID, Project, District.");
      return;
    }

    const payload: Partial<LandParcel> = {
      id: parcelId,
      projectId: projId,
      district,
      landArea: Number(landArea),
      landType,
      ownersCount: Number(ownersCount),
      ownershipDispute,
      documentsComplete,
      compensationStatus,
      compensationAmount: Number(compensationAmount),
      objectionFiled,
      courtCase,
      surveyCompleted,
      environmentalClearance,
      governmentApproval,
      acquisitionStage,
      previousDelay,
      distanceFromProject: Number(distanceFromProject),
      complaintText: complaintText.trim() || undefined
    };

    onAddParcel(payload);
    alert(`Parcel ${parcelId} saved successfully ${runPrediction ? "and Delay/Cost Risk calculated!" : ""}`);
    
    // Auto redirect to its detail page to view ML output instantly!
    triggerViewParcel(parcelId);
  };

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = "Parcel ID,Project ID,District,Land Area (Acres),Land Type,Owners Count,Ownership Dispute,Documents Complete,Compensation Status,Compensation Amount,Objection Filed,Court Case,Stage,Delay Risk\n";
    const rows = parcels.map(p => 
      `"${p.id}","${p.projectId}","${p.district}",${p.landArea},"${p.landType}",${p.ownersCount},${p.ownershipDispute},${p.documentsComplete},"${p.compensationStatus}",${p.compensationAmount},${p.objectionFiled},${p.courtCase},"${p.acquisitionStage}","${p.riskLevel || 'Low'}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SLA_LandParcels_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filter Logic
  const filteredParcels = parcels.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === "All" || p.district === districtFilter;
    const matchesStage = stageFilter === "All" || p.acquisitionStage === stageFilter;
    const matchesRisk = riskFilter === "All" || p.riskLevel === riskFilter;

    return matchesSearch && matchesDistrict && matchesStage && matchesRisk;
  });

  // Unique Districts list for filters
  const districts = ["All", ...Array.from(new Set(parcels.map(p => p.district)))];

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageStyle = (stage: string, currentStage: string) => {
    const stagesOrder = ['Survey', 'Notification', 'Negotiation', 'Compensation', 'Agreement', 'Possession'];
    const currentIdx = stagesOrder.indexOf(currentStage);
    const thisIdx = stagesOrder.indexOf(stage);

    if (thisIdx < currentIdx) {
      return { status: "✓ Completed", border: "border-emerald-500 bg-emerald-50 text-emerald-700", iconColor: "text-emerald-500" };
    } else if (thisIdx === currentIdx) {
      return { status: "● Current Step", border: "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100", iconColor: "text-blue-600" };
    } else {
      return { status: "Pending", border: "border-slate-200 bg-slate-50 text-slate-400", iconColor: "text-slate-300" };
    }
  };

  return (
    <div className="space-y-6">
      {/* VIEW 1: DATA TABLE VIEW */}
      {viewMode === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">Land Parcels Information Ledger</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">View registered land plots, survey data, compensation payments, and automated risk markers</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Ledger (CSV)</span>
              </button>
              <button
                onClick={handleOpenAddForm}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Surveyed Parcel</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search ID, Project, District..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full text-sm pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>

            <div>
              <select
                value={districtFilter}
                onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium text-slate-700"
              >
                <option value="All">All Districts</option>
                {districts.filter(d => d !== "All").map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={stageFilter}
                onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium text-slate-700"
              >
                <option value="All">All Acquisition Stages</option>
                <option value="Survey">Survey Completed</option>
                <option value="Notification">Notification Stage</option>
                <option value="Negotiation">Negotiation Stage</option>
                <option value="Compensation">Compensation Awarded</option>
                <option value="Agreement">Agreement Executed</option>
                <option value="Possession">Possession Taken</option>
              </select>
            </div>

            <div>
              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium text-slate-700"
              >
                <option value="All">All Delay Risk Classes</option>
                <option value="Low">Low Risk Only</option>
                <option value="Medium">Medium Risk Only</option>
                <option value="High">High Risk Only</option>
              </select>
            </div>
          </div>

          {/* Main Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50/80 font-bold text-slate-400 text-[11px] tracking-wider uppercase border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Parcel ID</th>
                    <th className="px-4 py-3 whitespace-nowrap">Project ID</th>
                    <th className="px-4 py-3 whitespace-nowrap">District</th>
                    <th className="px-4 py-3 whitespace-nowrap">Area</th>
                    <th className="px-4 py-3 whitespace-nowrap">Land Type</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">Owners</th>
                    <th className="px-4 py-3 whitespace-nowrap">Title Dispute</th>
                    <th className="px-4 py-3 whitespace-nowrap">Objection</th>
                    <th className="px-4 py-3 whitespace-nowrap">Compensation</th>
                    <th className="px-4 py-3 whitespace-nowrap">Stage</th>
                    <th className="px-4 py-3 whitespace-nowrap">Risk Level</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-slate-700">
                  {currentItems.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-extrabold text-slate-900 uppercase tracking-tight text-xs whitespace-nowrap">{parcel.id}</td>
                      <td className="px-4 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{parcel.projectId}</td>
                      <td className="px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{parcel.district}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 font-mono text-xs whitespace-nowrap">{parcel.landArea} Ac</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">{parcel.landType}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-800 text-xs whitespace-nowrap">{parcel.ownersCount}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {parcel.ownershipDispute ? (
                          <span className="pulse-badge-alert">! Disputed</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {parcel.objectionFiled ? (
                          <span className="pulse-badge-warn">• Raised</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {parcel.compensationStatus === "Paid" ? (
                          <span className="pulse-badge-up">↑ Disbursed</span>
                        ) : parcel.compensationStatus === "Pending" ? (
                          <span className="pulse-badge-warn">• Pending</span>
                        ) : (
                          <span className="pulse-badge-alert">! Disputed</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          {parcel.acquisitionStage}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {parcel.riskLevel === "High" ? (
                          <span className="pulse-badge-alert">↑ HIGH RISK</span>
                        ) : parcel.riskLevel === "Medium" ? (
                          <span className="pulse-badge-warn">• MED RISK</span>
                        ) : (
                          <span className="pulse-badge-up">↑ LOW RISK</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap flex justify-end items-center gap-2">
                        <button
                          onClick={() => triggerViewParcel(parcel.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirm deletion of Parcel ${parcel.id}?`)) {
                              onDeleteParcel(parcel.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Parcel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={12} className="text-center py-8 text-slate-400 font-medium text-sm">
                        No land parcels match the specified search or filter query parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls footer */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Showing page <b>{currentPage}</b> of <b>{totalPages}</b> (Total {filteredParcels.length} records)
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: MULTI-SECTION ADD PARCEL FORM */}
      {viewMode === 'add' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Add New Surveyed Land Parcel</h3>
                <p className="text-[11px] text-slate-400">Add plot characteristics, title ownership, compensation claims, and legal standings</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
              Draft Mode
            </span>
          </div>

          <form className="space-y-6">
            {/* SECTION 1: Basic Details */}
            <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                  1
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Basic Parcel Details</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parcel ID</label>
                  <input
                    type="text"
                    required
                    value={parcelId}
                    onChange={(e) => setParcelId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Link</label>
                  <select
                    value={projId}
                    onChange={(e) => setProjId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Land Classification</label>
                  <select
                    value={landType}
                    onChange={(e) => setLandType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Agricultural">Agricultural Wet/Dry</option>
                    <option value="Residential">Residential Plot</option>
                    <option value="Commercial">Commercial Shop/Building</option>
                    <option value="Industrial">Industrial Gated</option>
                    <option value="Barren">Barren Government Wasteland</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: Ownership */}
            <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                  2
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Ownership & Title Verification</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Number of Legal Heirs/Owners</label>
                  <input
                    type="number"
                    required
                    value={ownersCount}
                    onChange={(e) => setOwnersCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="dispute"
                    checked={ownershipDispute}
                    onChange={(e) => setOwnershipDispute(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="dispute" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Active Ownership / Title Boundary Dispute
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="docsComplete"
                    checked={documentsComplete}
                    onChange={(e) => setDocumentsComplete(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="docsComplete" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    All Patta, Chitta & Adangal Documents Complete
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 3: Compensation */}
            <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                  3
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Compensation Award details</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Compensation Status</label>
                  <select
                    value={compensationStatus}
                    onChange={(e) => setCompensationStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Pending">Pending Evaluation Award</option>
                    <option value="Paid">Disbursed & Settled (Paid)</option>
                    <option value="Disputed">Under Legal Valuation Dispute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Compensation Amount Awarded (INR)</label>
                  <input
                    type="number"
                    required
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="objection"
                    checked={objectionFiled}
                    onChange={(e) => setObjectionFiled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="objection" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Objection Filed by Landowner
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 4: Legal & Clearances */}
            <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                  4
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Court Cases & Environment Approvals</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="court"
                    checked={courtCase}
                    onChange={(e) => setCourtCase(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="court" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                    Active High Court Litigation/Stay
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="survey"
                    checked={surveyCompleted}
                    onChange={(e) => setSurveyCompleted(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="survey" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                    Field boundary survey completed
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="envClear"
                    checked={environmentalClearance}
                    onChange={(e) => setEnvironmentalClearance(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="envClear" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                    Environmental Clearance Obtained
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="govApp"
                    checked={governmentApproval}
                    onChange={(e) => setGovernmentApproval(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="govApp" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                    Special Administrative Approval Received
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 5: Acquisition & Analytics Inputs */}
            <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                  5
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Acquisition Stage & Proximity Metrics</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Acquisition Stage</label>
                  <select
                    value={acquisitionStage}
                    onChange={(e) => setAcquisitionStage(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Survey">Survey & Record Creation</option>
                    <option value="Notification">15(1) Gazetted Notification</option>
                    <option value="Negotiation">Bilateral Negotiation</option>
                    <option value="Compensation">Award & Compensation Release</option>
                    <option value="Agreement">Deed Agreement Signing</option>
                    <option value="Possession">Possession Taken</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Distance to Project Hub (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={distanceFromProject}
                    onChange={(e) => setDistanceFromProject(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="prevDelay"
                    checked={previousDelay}
                    onChange={(e) => setPreviousDelay(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="prevDelay" className="text-[11px] font-bold text-slate-700 cursor-pointer">
                    Has History of Revenue Delays
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Objection Statement / Complaint Text (Optional NLP Input)
                </label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Paste or write the landowner's formal objection/complaint here to run TF-IDF and Logistic Regression analysis..."
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-150">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all"
              >
                Cancel Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleSaveParcel(e, false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Save Draft Parcel
              </button>
              <button
                type="button"
                onClick={(e) => handleSaveParcel(e, true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/10"
              >
                <Sparkles className="w-4 h-4 text-blue-100" />
                <span>Save & Calculate Delay Risk</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: PARCEL DETAILS PROFILE VIEW */}
      {viewMode === 'details' && activeParcel && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-150">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
                title="Go back to parcels list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 font-mono">{activeParcel.id}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-mono font-bold text-[10px] rounded">
                    {activeParcel.projectId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                    activeParcel.compensationStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {activeParcel.compensationStatus === "Paid" ? "Cleared" : "Under Negotiation"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeParcel.district} District</span>
                  <span className="text-slate-300">•</span>
                  <span>{activeParcel.landType} plot</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm("Execute special notice delivery on this landowner?")) {
                    alert("Special acquisition warning notice dispatched to revenue division office.");
                  }
                }}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold"
              >
                Dispatch Notice
              </button>
              <button
                onClick={() => {
                  const updatedAmount = prompt("Enter adjusted compensation award in INR:", activeParcel.compensationAmount.toString());
                  if (updatedAmount) {
                    onUpdateParcel(activeParcel.id, { compensationAmount: Number(updatedAmount) });
                  }
                }}
                className="px-3.5 py-2 bg-slate-850 hover:bg-slate-750 text-white rounded-lg text-xs font-bold"
              >
                Adjust Evaluation
              </button>
            </div>
          </div>

          {/* Core Summary Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Land Area</span>
              <p className="text-lg font-black text-slate-800 mt-1 font-mono">{activeParcel.landArea} Acres</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Claimants</span>
              <p className="text-lg font-black text-slate-800 mt-1 font-mono">{activeParcel.ownersCount} Owners</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Stage</span>
              <p className="text-sm font-bold text-blue-600 mt-2 truncate">{activeParcel.acquisitionStage}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Cost</span>
              <p className="text-lg font-black text-slate-800 mt-1 font-mono">{formatCurrency(activeParcel.compensationAmount)}</p>
            </div>
          </div>

          {/* Horizonal Acquisition timeline */}
          <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Acquisition Timeline Tracker
            </h4>
            
            {/* Desktop Horizontal Line */}
            <div className="hidden md:grid grid-cols-6 gap-4 relative">
              <div className="absolute top-[18px] left-[40px] right-[40px] h-0.5 bg-slate-100 z-0" />
              {['Survey', 'Notification', 'Negotiation', 'Compensation', 'Agreement', 'Possession'].map((stage, idx) => {
                const stepConfig = getStageStyle(stage, activeParcel.acquisitionStage);
                return (
                  <div key={idx} className="flex flex-col items-center text-center z-10">
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs ${stepConfig.border}`}>
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2">{stage}</span>
                    <span className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">
                      {stepConfig.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical List */}
            <div className="md:hidden space-y-4">
              {['Survey', 'Notification', 'Negotiation', 'Compensation', 'Agreement', 'Possession'].map((stage, idx) => {
                const stepConfig = getStageStyle(stage, activeParcel.acquisitionStage);
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${stepConfig.border}`}>
                      {idx + 1}
                    </div>
                    <div className="text-left flex-1">
                      <span className="text-xs font-bold text-slate-800 block">{stage}</span>
                      <span className="text-[9px] font-medium text-slate-400 block uppercase tracking-wide">
                        {stepConfig.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model outputs and risk contribution grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Prediction summaries */}
            <div className="md:col-span-8 bg-white border border-slate-150 p-5 rounded-xl shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Analytical Risk Assessment & Predictions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Delay Risk card */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Delay Risk Assessment</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-800">{activeParcel.delayProbability}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeParcel.riskLevel === "High" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {activeParcel.riskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-2 flex justify-between text-xs text-slate-500">
                    <span>Expected Duration Delay:</span>
                    <span className="font-bold text-slate-700">{activeParcel.predictedDelayDays} Days</span>
                  </div>
                </div>

                {/* Legal Risk Card */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Legal Standing Assessment</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-800">{activeParcel.legalRiskProbability}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeParcel.legalRiskLevel === "High" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {activeParcel.legalRiskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-2 flex justify-between text-xs text-slate-500">
                    <span>Environmental Standing:</span>
                    <span className="font-bold text-slate-700">
                      {activeParcel.environmentalClearance ? "Clear" : "Pending Clearance"}
                    </span>
                  </div>
                </div>

                {/* Cost Overrun regressor card */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 sm:col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cost Overrun assessment</span>
                      <p className="text-2xl font-black text-red-600 mt-1">+{activeParcel.costOverrunPercentage}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Expected Overrun Amount</span>
                      <p className="text-lg font-black text-slate-800 mt-1">{formatCurrency(activeParcel.expectedAdditionalCost || 0)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-[#F1F5F9] text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Original Compensation Claim</span>
                      <p className="font-bold text-slate-700">{formatCurrency(activeParcel.compensationAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Expected Final Compensation Cost</span>
                      <p className="font-bold text-slate-900">{formatCurrency(activeParcel.expectedFinalCost || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk factors contributing */}
            <div className="md:col-span-4 bg-white border border-slate-150 p-5 rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">
                  Key Contributing Factors
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mb-4">Relative weight of risk vectors on expected delays</p>
              </div>

              <div className="space-y-4">
                {/* Fact 1 */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Ownership / Title Dispute</span>
                    <span className={`font-bold ${activeParcel.ownershipDispute ? "text-red-500" : "text-emerald-500"}`}>
                      {activeParcel.ownershipDispute ? "High Factor" : "None"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${activeParcel.ownershipDispute ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: activeParcel.ownershipDispute ? "100%" : "0%" }} />
                  </div>
                </div>

                {/* Fact 2 */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Pending Government Approval</span>
                    <span className={`font-bold ${!activeParcel.governmentApproval ? "text-amber-500" : "text-emerald-500"}`}>
                      {!activeParcel.governmentApproval ? "Medium Factor" : "None"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${!activeParcel.governmentApproval ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: !activeParcel.governmentApproval ? "60%" : "0%" }} />
                  </div>
                </div>

                {/* Fact 3 */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Active High Court Stay Case</span>
                    <span className={`font-bold ${activeParcel.courtCase ? "text-red-500" : "text-emerald-500"}`}>
                      {activeParcel.courtCase ? "High Factor" : "None"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${activeParcel.courtCase ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: activeParcel.courtCase ? "100%" : "0%" }} />
                  </div>
                </div>

                {/* Fact 4 */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Incomplete Patta Documentation</span>
                    <span className={`font-bold ${!activeParcel.documentsComplete ? "text-amber-500" : "text-emerald-500"}`}>
                      {!activeParcel.documentsComplete ? "Medium Factor" : "None"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${!activeParcel.documentsComplete ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: !activeParcel.documentsComplete ? "50%" : "0%" }} />
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 text-center font-medium italic mt-4">
                *Statistical weightings computed dynamically from random forest regression node variables.
              </p>
            </div>
          </div>

          {/* NLP Object Analysis complaint box */}
          {activeParcel.complaintText && (
            <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-xl">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Associated Objection Statement Text</span>
              </h4>
              <p className="text-xs font-semibold text-slate-700 bg-white p-3 border border-amber-100 rounded-lg font-serif">
                "{activeParcel.complaintText}"
              </p>
              <div className="mt-3 flex gap-4 text-[10px] font-bold text-amber-900">
                <span>Classification: <b className="bg-amber-100 px-1.5 py-0.5 rounded">Compensation Issue</b></span>
                <span>Calculated Confidence: <b className="bg-amber-100 px-1.5 py-0.5 rounded">91%</b></span>
              </div>
            </div>
          )}

          {/* Recommended actions list */}
          <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Priority Administrative Actions
            </h4>

            <div className="space-y-3.5">
              {[
                { id: "act1", desc: "Process and evaluate revised market value compensation package", priority: "Urgent", status: activeParcel.compensationStatus === "Paid" ? "Done" : "Pending" },
                { id: "act2", desc: "Deploy Revenue Officer to verify disputed survey boundary patta deeds", priority: "High", status: !activeParcel.ownershipDispute ? "Done" : "Pending" },
                { id: "act3", desc: "Submit counter-affidavit to vacate High Court stay injunction", priority: "Critical", status: !activeParcel.courtCase ? "Done" : "Pending" },
                { id: "act4", desc: "Convene bilateral negotiation meeting with all registered claimants", priority: "Medium", status: "Pending" }
              ].map((act, i) => {
                const isCompleted = actionDone[act.id] || act.status === "Done";
                return (
                  <div key={act.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded ${
                        isCompleted ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : <Play className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {act.desc}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                          Priority Rank: <b className="text-slate-500 font-bold">{act.priority}</b>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                      <button 
                        onClick={() => {
                          setAssignedAction(act.desc);
                          alert(`Action assigned to Revenue Divisional Officer.`);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded"
                      >
                        Assign Task
                      </button>
                      <button 
                        onClick={() => {
                          setActionDone(prev => ({ ...prev, [act.id]: !prev[act.id] }));
                        }}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded text-white ${
                          isCompleted ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Mark Done"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
