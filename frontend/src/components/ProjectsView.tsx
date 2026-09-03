import React, { useState } from "react";
import { Project } from "../types";
import { Plus, Search } from "lucide-react";

interface ProjectsViewProps {
  projects: Project[];
  globalSearchTerm: string;
  onAddProject: (proj: Partial<Project>) => void;
  onUpdateProject: (id: string, proj: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function ProjectsView({
  projects,
  globalSearchTerm,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  showToast
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "NH-45");
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter projects based on search
  const effectiveSearch = (searchTerm || globalSearchTerm).toLowerCase().trim();
  const filteredProjects = projects.filter(p => 
    p.id.toLowerCase().includes(effectiveSearch) ||
    p.name.toLowerCase().includes(effectiveSearch) ||
    p.district.toLowerCase().includes(effectiveSearch)
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Acquisition 8-stage Timeline steps
  const acquisitionStages = [
    "Land Identification",
    "Survey & Verification",
    "Notification",
    "Objection",
    "Compensation Assessment",
    "Award",
    "Payment",
    "Possession"
  ];

  // Map project stage name to index
  const getCurrentStageIndex = (stage?: string) => {
    if (!stage) return 2; // Default Notification
    if (stage.includes("Identification")) return 0;
    if (stage.includes("Survey")) return 1;
    if (stage.includes("Notification")) return 2;
    if (stage.includes("Objection") || stage.includes("Negotiation")) return 3;
    if (stage.includes("Compensation")) return 4;
    if (stage.includes("Award") || stage.includes("Agreement")) return 5;
    if (stage.includes("Payment")) return 6;
    if (stage.includes("Possession")) return 7;
    return 2;
  };

  const activeStageIdx = getCurrentStageIndex(selectedProject?.currentStage || "Notification");

  return (
    <div className="space-y-7 font-sans text-[#0F172A] pb-12">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title text-[26px] font-extrabold text-[#0A192F] tracking-tight">
            Infrastructure Projects Registry
          </h2>
          <p className="text-[14px] text-[#475569] mt-1 font-medium">
            Active acquisition corridors, land requirement boundaries, and 8-stage statutory progress.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Project</span>
        </button>
      </div>

      {/* SELECTED PROJECT DETAILED PROFILE */}
      {selectedProject && (
        <div className="card-enterprise space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[13px] text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-[4px] border border-[#BFDBFE]">
                  {selectedProject.id}
                </span>
                <span className={`status-badge ${
                  selectedProject.delayRisk === 'Critical' || selectedProject.delayRisk === 'High'
                    ? "status-badge-danger"
                    : "status-badge-warning"
                }`}>
                  {selectedProject.delayRisk} Delay Risk
                </span>
              </div>
              
              {/* EXACT BOLD HEADING LIKE REFERENCE IMAGE 1 */}
              <h3 className="text-[26px] font-extrabold text-[#0A192F] mt-2 tracking-tight leading-snug">
                {selectedProject.name}
              </h3>

              <p className="text-[14px] text-[#475569] mt-1 font-semibold">
                {selectedProject.district} District, {selectedProject.state || "Tamil Nadu"} • {selectedProject.type} Corridor
              </p>
            </div>

            <div className="flex items-center gap-4 text-[14px] font-medium text-[#475569] bg-[#F8FAFC] p-3 rounded-[6px] border border-[#E2E8F0]">
              <div>
                <span className="small-label block text-[#64748B]">Acquisition Progress</span>
                <span className="text-[22px] font-extrabold text-[#0A192F]">{selectedProject.progress}%</span>
              </div>
              <div className="w-[1px] h-8 bg-[#E2E8F0]" />
              <div>
                <span className="small-label block text-[#64748B]">Predicted Delay</span>
                <span className="text-[22px] font-extrabold text-[#DC2626] font-mono">{selectedProject.predictedDelay} Days</span>
              </div>
            </div>
          </div>

          {/* PROJECT PARAMETERS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-[14px]">
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B] font-bold uppercase text-[10px]">Total Land Required</span>
              <span className="table-value-bold text-[16px] font-extrabold text-[#0A192F]">{selectedProject.landRequired} Hectares</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B] font-bold uppercase text-[10px]">Land Acquired</span>
              <span className="table-value-bold text-[16px] font-extrabold text-[#166534]">{selectedProject.landAcquired} Hectares</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B] font-bold uppercase text-[10px]">Land Pending</span>
              <span className="table-value-bold text-[16px] font-extrabold text-[#991B1B]">{(selectedProject.landRequired - selectedProject.landAcquired).toFixed(1)} Hectares</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B] font-bold uppercase text-[10px]">Estimated Cost</span>
              <span className="table-value-bold text-[16px] font-extrabold text-[#0A192F]">₹{((selectedProject.estimatedCost || 1250000000) / 10000000).toFixed(0)} Cr</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B] font-bold uppercase text-[10px]">Start Date</span>
              <span className="font-extrabold text-[16px] text-[#0A192F]">{selectedProject.startDate || "15 Jan 2025"}</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B] font-bold uppercase text-[10px]">Target Completion</span>
              <span className="font-extrabold text-[16px] text-[#0A192F]">{selectedProject.targetCompletionDate || "30 Dec 2026"}</span>
            </div>
          </div>

          {/* ACQUISITION STAGE TIMELINE */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[17px] font-extrabold text-[#0A192F] tracking-tight uppercase font-sans">
              Acquisition Stage Timeline
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {acquisitionStages.map((stage, i) => {
                const isPassed = i < activeStageIdx;
                const isCurrent = i === activeStageIdx;
                const isDelayed = isCurrent && selectedProject.predictedDelay > 30;

                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-[5px] border text-center transition-all flex flex-col justify-between ${
                      isCurrent
                        ? isDelayed
                          ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
                          : "bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]"
                        : isPassed
                          ? "bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]"
                          : "bg-[#F8FAFC]/50 border-[#E2E8F0] text-[#94A3B8] opacity-60"
                    }`}
                  >
                    <div className="font-extrabold text-[11px] uppercase tracking-wider text-[#475569] mb-1">Stage {i + 1}</div>
                    <div className="font-bold text-[13px] leading-tight mb-2 text-[#0A192F]">{stage}</div>

                    <div className="mt-auto">
                      {isCurrent ? (
                        <span className={`status-badge text-[10px] uppercase ${
                          isDelayed ? "status-badge-danger" : "status-badge-info"
                        }`}>
                          {isDelayed ? "Delayed Stage" : "Current Stage"}
                        </span>
                      ) : isPassed ? (
                        <span className="text-[11px] font-bold text-[#166534]">Completed ✓</span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ALL PROJECTS TABLE LEDGER */}
      <div className="card-enterprise space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 className="text-[18px] font-extrabold text-[#0A192F] tracking-tight">
            Registered Acquisition Projects ({filteredProjects.length})
          </h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by Project ID..."
              className="input-enterprise w-full pl-9 font-medium text-[13px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header font-extrabold text-[#334155]">Project ID</th>
                <th className="table-header font-extrabold text-[#334155]">Project Name</th>
                <th className="table-header font-extrabold text-[#334155]">State & District</th>
                <th className="table-header font-extrabold text-[#334155]">Type</th>
                <th className="table-header font-extrabold text-[#334155]">Required (Ha)</th>
                <th className="table-header font-extrabold text-[#334155]">Acquired (Ha)</th>
                <th className="table-header font-extrabold text-[#334155]">Progress</th>
                <th className="table-header font-extrabold text-[#334155]">Delay Risk</th>
                <th className="table-header font-extrabold text-[#334155] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredProjects.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`hover:bg-[#F8FAFC] cursor-pointer ${
                    selectedProjectId === p.id ? "bg-[#F1F5F9]" : ""
                  }`}
                >
                  <td className="table-value-bold font-mono">{p.id}</td>
                  <td className="table-value-bold text-[#0A192F]">{p.name}</td>
                  <td className="text-[#475569]">{p.state || "Tamil Nadu"}, {p.district}</td>
                  <td className="text-[#475569]">{p.type}</td>
                  <td className="font-semibold">{p.landRequired}</td>
                  <td className="text-[#166534] font-semibold">{p.landAcquired}</td>
                  <td>
                    <span className="font-semibold text-[#0F172A]">{p.progress}%</span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      p.delayRisk === 'Critical' || p.delayRisk === 'High' ? "status-badge-danger" : "status-badge-warning"
                    }`}>
                      {p.delayRisk}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProjectId(p.id); }}
                      className="btn-secondary h-[34px] px-3 text-[13px]"
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
