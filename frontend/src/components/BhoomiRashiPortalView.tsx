import React, { useState } from "react";
import { 
  Project, 
  LandParcel, 
  Alert 
} from "../types";
import { 
  Search, 
  Building2, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Landmark, 
  MapPin, 
  Users, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  Download, 
  HelpCircle, 
  ExternalLink, 
  Send, 
  ChevronRight,
  Eye,
  Award,
  BookOpen,
  Sparkles,
  Check,
  RefreshCw
} from "lucide-react";
import { analyzeDocument } from "../api";

interface BhoomiRashiPortalViewProps {
  projects: Project[];
  parcels: LandParcel[];
  alerts: Alert[];
  setActiveTab: (tab: string) => void;
  onViewParcel: (parcelId: string) => void;
  showToast?: (message: string, type?: 'success' | 'error') => void;
}

export default function BhoomiRashiPortalView({
  projects,
  parcels,
  alerts,
  setActiveTab,
  onViewParcel,
  showToast
}: BhoomiRashiPortalViewProps) {
  // Public Citizen Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [searchResult, setSearchResult] = useState<LandParcel | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Citizen Objection Modal State
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [objectionText, setObjectionText] = useState("");
  const [objectionParcelId, setObjectionParcelId] = useState("LA1024");
  const [isSubmittingObjection, setIsSubmittingObjection] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Active Tab for Bhoomi Rashi Features
  const [portalTab, setPortalTab] = useState<'overview' | 'features' | 'cala' | 'gazette'>('overview');

  // Handle Public Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      setSearchResult(null);
      return;
    }

    const found = parcels.find(p => 
      p.id.toLowerCase() === query || 
      p.projectId.toLowerCase() === query ||
      p.district.toLowerCase().includes(query)
    );
    setSearchResult(found || null);
  };

  // Handle Citizen Objection Analysis
  const handleAnalyzeObjection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectionText.trim()) return;

    setIsSubmittingObjection(true);
    try {
      const res = await analyzeDocument(objectionText);
      setAnalysisResult(res);
      if (showToast) showToast("Objection analyzed via AI NLP Engine successfully!", "success");
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to analyze objection text", "error");
    } finally {
      setIsSubmittingObjection(false);
    }
  };

  // District CALA Functionaries List
  const calaList = [
    { district: "Kanchipuram", officer: "Tmt. M. Aruna, IAS", designation: "District Collector & CALA Head", phone: "044-27237101", email: "collr-knc@nic.in", project: "NH-45 Outer Ring Extension" },
    { district: "Villupuram", officer: "Thiru C. Palani, IAS", designation: "Competent Authority (LA)", phone: "04146-222450", email: "collrvpm@nic.in", project: "NH-48 Six-Laning Corridor" },
    { district: "Salem", officer: "Dr. R. Brindha Devi, IAS", designation: "Special District Revenue Officer (LA)", phone: "0427-2481100", email: "collr-slm@nic.in", project: "NH-32 Salem Bypass Link" },
    { district: "Nagapattinam", officer: "Thiru P. Akash, IAS", designation: "Competent Authority - Port Road", phone: "04365-252700", email: "collrngp@nic.in", project: "NH-66 Coastal Port Connectivity" },
    { district: "Madurai", officer: "Tmt. M.S. Sangeetha, IAS", designation: "District Collector & Revenue Head", phone: "0452-2531110", email: "collrmdu@nic.in", project: "NH-95 Southern Ring Road" }
  ];

  // Gazette Notifications Sample List
  const gazetteList = [
    { no: "3a/MoRTH/2026/TN-45-01", date: "15 Jan 2026", type: "Section 3a (Intention)", project: "NH-45 Chennai Outer Ring Road Extension", district: "Kanchipuram", status: "Published" },
    { no: "3A/MoRTH/2026/TN-48-08", date: "02 Feb 2026", type: "Section 3A (Land Acquisition)", project: "NH-48 Villupuram Six-Laning Highway", district: "Villupuram", status: "Published" },
    { no: "3D/MoRTH/2026/TN-32-12", date: "20 Feb 2026", type: "Section 3D (Declaration)", project: "NH-32 Salem Bypass Link", district: "Salem", status: "Gazetted" },
    { no: "3G/MoRTH/2026/TN-95-04", date: "28 Feb 2026", type: "Section 3G (Award Determination)", project: "NH-95 Madurai Southern Ring Road", district: "Madurai", status: "Under Review" }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans pb-12">

      {/* GOVERNMENT OFFICIAL HERO BANNER */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden border border-blue-800/40">
        {/* Subtle Decorative Backdrop Elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Introduction */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>MoRTH Govt. of India Single Window Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
              BHOOMI RASHI & LANDGUARD AI
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Online Land Acquisition Portal of the Ministry of Road Transport & Highways (MoRTH). Accelerating National Highway development, direct benefit transfers, digital gazette notifications (3a, 3A, 3D), and transparent citizen grievance redressal.
            </p>

            {/* Quick Action Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPortalTab("overview")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  portalTab === "overview" 
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25" 
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Portal Overview</span>
              </button>

              <button
                onClick={() => setPortalTab("features")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  portalTab === "features" 
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25" 
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>12 Key Features</span>
              </button>

              <button
                onClick={() => setPortalTab("cala")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  portalTab === "cala" 
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25" 
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>CALA Directory</span>
              </button>

              <button
                onClick={() => setPortalTab("gazette")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  portalTab === "gazette" 
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25" 
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>3A/3D Gazettes</span>
              </button>
            </div>
          </div>

          {/* Right Column: Public Status Search Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Public Citizen Project & Parcel Tracker</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter your Land Parcel ID (e.g. LA1021, LA1024) or Project ID (NH-45) to view status.
            </p>

            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">Search Identifier</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Parcel ID (LA1021, LA1024) or NH-45"
                  className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-400 outline-none placeholder-slate-400 font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Acquisition Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowObjectionModal(true)}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  title="File Citizen Section-15 Objection"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Objection Desk</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Hints */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-medium text-slate-400">Quick Test IDs:</span>
              <div className="flex gap-1.5 font-mono">
                {["LA1021", "LA1024", "LA1035"].map(id => (
                  <button
                    key={id}
                    onClick={() => {
                      setSearchQuery(id);
                      const found = parcels.find(p => p.id === id);
                      setSearchResult(found || null);
                      setHasSearched(true);
                    }}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-amber-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PUBLIC SEARCH RESULT DISPLAY BANNER */}
      {hasSearched && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Search Results for "{searchQuery}"</h3>
            </div>
            <button
              onClick={() => { setHasSearched(false); setSearchQuery(""); setSearchResult(null); }}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Clear Result
            </button>
          </div>

          {searchResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Parcel Identifier</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{searchResult.id}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{searchResult.projectId} Highway Corridor</p>
                  <p className="text-slate-500">{searchResult.district} District • {searchResult.landArea} Hectares</p>
                </div>
                <div className="pt-2 border-t border-slate-200 text-slate-700">
                  <span className="font-semibold">Land Type: </span> {searchResult.landType} ({searchResult.ownersCount} Title Holder/s)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Statutory Acquisition Stage</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs">
                    {searchResult.acquisitionStage} Stage
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                    searchResult.courtCase ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {searchResult.courtCase ? "Active Stay/Litigation" : "Clear Title"}
                  </span>
                </div>
                <div className="pt-2 text-slate-600 space-y-1">
                  <p>• Survey Clearance: {searchResult.surveyCompleted ? "Completed ✅" : "Pending ⏳"}</p>
                  <p>• Gazette 3D Clearance: {searchResult.governmentApproval ? "Approved ✅" : "In Progress ⏳"}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PFMS Compensation Status</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      ₹{((searchResult.compensationAmount || 5000000) / 100000).toFixed(2)} Lakhs
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      searchResult.compensationStatus === 'Paid' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {searchResult.compensationStatus}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onViewParcel(searchResult.id)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Open Full Official SLA Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No Land Parcel or Project found matching "{searchQuery}"</p>
              <p className="mt-1 text-slate-500">Please verify the survey parcel ID (e.g. LA1021) or NH project code (e.g. NH-45).</p>
            </div>
          )}
        </div>
      )}

      {/* OFFICIAL TICKER / ANNOUNCEMENTS */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 px-6 flex items-center gap-4 text-xs font-medium text-amber-900 shadow-2xs">
        <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-bold uppercase tracking-wider text-[10px] shrink-0">
          Official Gazette Ticker
        </span>
        <div className="overflow-hidden whitespace-nowrap truncate flex-1 font-semibold text-amber-950">
          📜 Gazette 3D declaration published for NH-45 Chennai Outer Ring Extension (Kanchipuram) • Real-time PFMS bank disbursements active for 1,420 landowners across Tamil Nadu • SLA processing time reduced from 90 days to 14 days.
        </div>
      </div>

      {/* MAIN TAB SWITCHER CONTENT */}
      {portalTab === 'overview' && (
        <>
          {/* STATS IMPACT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active NH Projects</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{projects.length} Corridors</h3>
                <p className="text-xs text-blue-600 font-semibold mt-2">National Highways Authority of India</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Acquired Land Area</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">356.1 <span className="text-base font-normal text-slate-500">Ha</span></h3>
                <p className="text-xs text-emerald-600 font-semibold mt-2">78% Target Achieved</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">PFMS Direct Transfers</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₹412.5 <span className="text-base font-normal text-slate-500">Cr</span></h3>
                <p className="text-xs text-emerald-600 font-semibold mt-2">Direct Benefit Transfer (DBT)</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Processing SLA Speed</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">14 <span className="text-base font-normal text-slate-500">Days</span></h3>
                <p className="text-xs text-blue-600 font-semibold mt-2">Down from 90+ Days</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* QUICK CITIZEN & OFFICER SERVICE MODULES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Public Project Search</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Search land acquisition status, CALA jurisdiction, and village-level alignment notifications across all National Highway projects.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("projects")}
                className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Highway Projects</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">PFMS Bank Disbursement</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Integrated with Public Financial Management System (PFMS) of Ministry of Finance for real-time beneficiary account validation & transfer.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("compensation")}
                className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600 group-hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Valuation & Disbursements</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-all group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Section-15 AI Objection Engine</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Automated Gemini NLP parsing of landowner complaints, legal citations, title disputes, and compensation claims.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("documents")}
                className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-purple-600 group-hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Process Citizen Objections</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 12 KEY BHOOMI RASHI FEATURES TAB */}
      {(portalTab === 'features' || portalTab === 'overview') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-amber-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>MoRTH Administrative System Specifications</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                Features of Bhoomi Rashi Portal
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Core features designed by the Ministry of Road Transport and Highways (MoRTH) to digitize land acquisition.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Switch to Internal Officer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {[
              { title: "Bilingual Interface", desc: "Bilingual support with Hindi and English for easy usability across all Indian states.", icon: BookOpen, color: "text-blue-600 bg-blue-50" },
              { title: "Project Basic & Sanction Details", desc: "Dedicated interface for adding basic project parameters and Land Acquisition sanction details.", icon: Landmark, color: "text-amber-600 bg-amber-50" },
              { title: "Village & Location Mapping", desc: "Interface for defining Land Acquisition locations down to specific revenue villages.", icon: MapPin, color: "text-emerald-600 bg-emerald-50" },
              { title: "CALA Details Interface", desc: "Structured registry for Competent Authority for Land Acquisition (CALA) details per project.", icon: Building2, color: "text-purple-600 bg-purple-50" },
              { title: "LA Notification Generation", desc: "Automated engine for drafting statutory land acquisition notifications (Section 3a, 3A & 3D).", icon: FileText, color: "text-rose-600 bg-rose-50" },
              { title: "Land Parcel Details Ledger", desc: "Comprehensive interface for land area, land type, owner counts, and survey numbers.", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50" },
              { title: "3a, 3A & 3D E-Office Management", desc: "Organizational email IDs and automated workflow for smooth e-office processing.", icon: Clock, color: "text-sky-600 bg-sky-50" },
              { title: "Section-15 Objections Desk", desc: "Digital submission and processing interface for landowner objections and grievances.", icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
              { title: "Compensation Determination", desc: "Automated calculation of market rates, solatium, interest, and award finalization.", icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
              { title: "PFMS Payment Integration", desc: "Web service interface for real-time beneficiary account validation & payment tracking via PFMS.", icon: CheckCircle2, color: "text-teal-600 bg-teal-50" },
              { title: "Landowner & Citizen Desk", desc: "Transparent public portal for land owners to track compensation and possession progress.", icon: Users, color: "text-blue-600 bg-blue-50" },
              { title: "Statutory Reports Generation", desc: "One-click compiler for Section-15 compliance, gazette archives, and audit reports.", icon: Award, color: "text-purple-600 bg-purple-50" }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">{feature.title}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed pl-12">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CALA DIRECTORY TAB */}
      {portalTab === 'cala' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">
              CALA (Competent Authority for Land Acquisition) Functionaries
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              District revenue authorities designated under the National Highways Act, 1956 for project land acquisition.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-4 rounded-tl-xl">District / Jurisdiction</th>
                  <th className="p-4">CALA Officer Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Assigned NH Project</th>
                  <th className="p-4">Official Contact</th>
                  <th className="p-4 rounded-tr-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {calaList.map((c, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{c.district}</td>
                    <td className="p-4 font-bold text-blue-700">{c.officer}</td>
                    <td className="p-4 text-slate-600">{c.designation}</td>
                    <td className="p-4 font-semibold text-slate-800">{c.project}</td>
                    <td className="p-4 font-mono text-[11px]">
                      <div>{c.email}</div>
                      <div className="text-slate-400">{c.phone}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveTab("parcels")}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        View Parcels
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GAZETTE NOTIFICATIONS TAB */}
      {portalTab === 'gazette' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                Statutory Gazette Notifications (3a, 3A & 3D)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official Gazette of India land acquisition notifications issued by MoRTH under Section 3 of NH Act.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("reports")}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Compile Statutory Gazette</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gazetteList.map((g, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-amber-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {g.no}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {g.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{g.type}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{g.project} ({g.district})</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Issued Date: {g.date}</span>
                  <button
                    onClick={() => {
                      if (showToast) showToast(`Downloading official Gazette ${g.no}...`, "success");
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Download Gazette PDF</span>
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CITIZEN OBJECTION MODAL */}
      {showObjectionModal && (
        <div 
          onClick={() => setShowObjectionModal(false)}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[999999] flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95"
          >
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-400" />
                  <span>Citizen Section-15 Objection Submission Portal</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Submit your land acquisition grievance directly to CALA revenue functionaries</p>
              </div>
              <button
                onClick={() => setShowObjectionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleAnalyzeObjection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Land Parcel ID</label>
                    <select
                      value={objectionParcelId}
                      onChange={(e) => setObjectionParcelId(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono"
                    >
                      {parcels.map(p => (
                        <option key={p.id} value={p.id}>
                          Parcel {p.id} ({p.projectId} - {p.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Submission Authority</label>
                    <input
                      type="text"
                      disabled
                      value="CALA Revenue Office (MoRTH)"
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Detailed Objection / Claim Text</label>
                  <textarea
                    rows={4}
                    required
                    value={objectionText}
                    onChange={(e) => setObjectionText(e.target.value)}
                    placeholder="Enter details regarding title dispute, undervaluation of land, missing patta revenue records, or court stay order requests..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowObjectionModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingObjection}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingObjection ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Analyze & Submit Objection</span>
                  </button>
                </div>
              </form>

              {/* AI Gemini NLP Result */}
              {analysisResult && (
                <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Gemini NLP Section-15 Assessment Result
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      analysisResult.risk === 'High' ? "bg-rose-500 text-white" : "bg-amber-500 text-slate-950"
                    }`}>
                      {analysisResult.risk} Risk ({analysisResult.confidence}% Confidence)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Issue Classification</span>
                      <span className="font-bold text-white">{analysisResult.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Extracted Legal Terms</span>
                      <span className="font-medium text-amber-200">{analysisResult.importantTerms?.join(", ") || "None"}</span>
                    </div>
                  </div>

                  {analysisResult.keyDisputes && (
                    <div className="text-xs text-slate-300">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Key Disputes Extracted:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {analysisResult.keyDisputes.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
