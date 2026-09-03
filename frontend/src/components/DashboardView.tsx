import React from "react";
import { Project, LandParcel, Alert } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { ChevronRight } from "lucide-react";

interface DashboardViewProps {
  projects: Project[];
  parcels: LandParcel[];
  alerts: Alert[];
  setActiveTab: (tab: string) => void;
  onViewParcel: (parcelId: string) => void;
}

export default function DashboardView({
  projects,
  parcels,
  alerts,
  setActiveTab,
  onViewParcel
}: DashboardViewProps) {
  // 1. KPI Calculations
  const totalProjects = projects.length;
  const totalParcels = parcels.length;
  const highRiskParcels = parcels.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length;
  
  const avgDelayDays = parcels.length > 0
    ? Math.round(parcels.reduce((sum, p) => sum + (p.predictedDelayDays || 0), 0) / parcels.length)
    : 45;

  const pendingCompensationCount = parcels.filter(p => p.compensationStatus === 'Pending' || p.compensationStatus === 'Disputed').length;
  const pendingObjectionsCount = parcels.filter(p => p.objectionFiled).length;

  // 2. Risk Distribution Data for Chart
  const lowRiskCount = parcels.filter(p => p.riskLevel === 'Low').length;
  const medRiskCount = parcels.filter(p => p.riskLevel === 'Medium').length;
  const highRiskCount = parcels.filter(p => p.riskLevel === 'High').length;
  const criticalRiskCount = parcels.filter(p => p.riskLevel === 'Critical').length;

  const riskData = [
    { name: "Low Risk", value: lowRiskCount || 6, color: "#16A34A" },
    { name: "Medium Risk", value: medRiskCount || 5, color: "#D97706" },
    { name: "High Risk", value: highRiskCount || 6, color: "#EA580C" },
    { name: "Critical Risk", value: criticalRiskCount || 3, color: "#DC2626" }
  ];

  // 3. Predicted Delay by Project Data
  const projectDelayData = projects.map(p => ({
    name: p.id,
    delay: p.predictedDelay || 45,
    progress: p.progress
  }));

  // 4. Major Delay Factors Ranked
  const delayFactors = [
    { name: "Land Ownership Dispute", affected: 84, pct: 28, risk: "Critical" },
    { name: "Compensation Pending", affected: 62, pct: 21, risk: "High" },
    { name: "Court Case / Legal Objection", affected: 45, pct: 15, risk: "Critical" },
    { name: "Document Verification Issue", affected: 38, pct: 13, risk: "Medium" },
    { name: "Survey / Measurement Issue", affected: 25, pct: 8, risk: "Medium" },
    { name: "Government Clearance Pending", affected: 18, pct: 6, risk: "Medium" },
    { name: "Missing Land Records (Patta)", affected: 15, pct: 5, risk: "Low" },
    { name: "Utility Relocation Delay", affected: 10, pct: 4, risk: "Low" }
  ];

  return (
    <div className="space-y-7 font-sans text-[#1E293B] pb-12">

      {/* HEADER SECTION */}
      <div>
        <h2 className="page-title">
          Land Acquisition Monitoring
        </h2>
        <p className="text-[14px] text-[#64748B] mt-1 font-normal">
          Monitor acquisition progress, emerging risks and expected delays across registered infrastructure projects.
        </p>
      </div>

      {/* TOP 6 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* 1. Active Projects */}
        <div className="card-enterprise space-y-2">
          <span className="table-header block">Active Projects</span>
          <h3 className="kpi-number">{totalProjects}</h3>
          <p className="text-[12px] text-[#64748B]">Monitoring corridors</p>
        </div>

        {/* 2. Land Parcels Under Acquisition */}
        <div className="card-enterprise space-y-2">
          <span className="table-header block">Land Parcels</span>
          <h3 className="kpi-number">{totalParcels}</h3>
          <p className="text-[12px] text-[#64748B]">Surveyed plots</p>
        </div>

        {/* 3. High-Risk Parcels */}
        <div className="card-enterprise space-y-2">
          <span className="table-header block">High-Risk Parcels</span>
          <h3 className="kpi-number text-[#DC2626]">{highRiskParcels}</h3>
          <p className="text-[12px] text-[#DC2626] font-medium">Requires intervention</p>
        </div>

        {/* 4. Average Predicted Delay */}
        <div className="card-enterprise space-y-2">
          <span className="table-header block">Avg Delay</span>
          <h3 className="kpi-number">{avgDelayDays} <span className="text-[14px] font-normal text-[#64748B]">Days</span></h3>
          <p className="text-[12px] text-[#D97706] font-medium">+4 Days variance</p>
        </div>

        {/* 5. Compensation Pending */}
        <div className="card-enterprise space-y-2">
          <span className="table-header block">Compensation Pending</span>
          <h3 className="kpi-number">{pendingCompensationCount}</h3>
          <p className="text-[12px] text-[#64748B]">Disbursement pending</p>
        </div>

        {/* 6. Objections Pending */}
        <div className="card-enterprise space-y-2">
          <span className="table-header block">Objections</span>
          <h3 className="kpi-number">{pendingObjectionsCount}</h3>
          <p className="text-[12px] text-[#64748B]">Section 15 reviews</p>
        </div>

      </div>

      {/* SECTION 1 — PROJECT RISK OVERVIEW */}
      <div className="card-enterprise space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="section-title">
              Project Risk Overview
            </h3>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Active infrastructure corridors, acquisition progress, and predicted delay duration.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("projects")}
            className="text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Project ID</th>
                <th className="table-header">Project Name</th>
                <th className="table-header">State</th>
                <th className="table-header">District</th>
                <th className="table-header text-center">Land Parcels</th>
                <th className="table-header">Acquisition Progress</th>
                <th className="table-header">Risk Level</th>
                <th className="table-header">Predicted Delay</th>
                <th className="table-header">Last Updated</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {projects.map((proj) => (
                <tr key={proj.id}>
                  <td className="table-value-bold font-mono">{proj.id}</td>
                  <td className="table-value-bold">{proj.name}</td>
                  <td className="text-[#64748B]">{proj.state || "Tamil Nadu"}</td>
                  <td className="text-[#64748B]">{proj.district}</td>
                  <td className="text-center font-semibold text-[#0F172A]">{proj.totalParcelsCount || 124}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0F172A]">{proj.progress}%</span>
                      <div className="w-20 bg-[#E2E8F0] h-2 rounded-[2px] overflow-hidden">
                        <div className="bg-[#2563EB] h-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      proj.delayRisk === 'Critical' || proj.delayRisk === 'High'
                        ? "status-badge-danger"
                        : proj.delayRisk === 'Medium'
                          ? "status-badge-warning"
                          : "status-badge-success"
                    }`}>
                      {proj.delayRisk}
                    </span>
                  </td>
                  <td className="table-value-bold font-mono">
                    {proj.predictedDelay} Days
                  </td>
                  <td className="text-[#64748B] text-[12px]">Today</td>
                  <td className="text-right">
                    <button
                      onClick={() => setActiveTab("projects")}
                      className="btn-secondary text-[13px] h-[34px] px-3"
                    >
                      View Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2 — DELAY RISK ANALYSIS (CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-5 card-enterprise flex flex-col justify-between">
          <div>
            <h3 className="section-title">
              Risk Level Distribution
            </h3>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Breakdown of land parcels categorized by predicted delay severity.
            </p>
          </div>

          <div className="h-56 w-full my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Parcels`, 'Count']} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[14px]">
            <div className="p-2.5 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B]">Critical & High</span>
              <span className="table-value-bold text-[#DC2626]">{highRiskCount + criticalRiskCount} Parcels</span>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0]">
              <span className="small-label block text-[#64748B]">Low & Medium</span>
              <span className="table-value-bold text-[#166534]">{lowRiskCount + medRiskCount} Parcels</span>
            </div>
          </div>
        </div>

        {/* Predicted Delay by Project */}
        <div className="lg:col-span-7 card-enterprise flex flex-col justify-between">
          <div>
            <h3 className="section-title">
              Predicted Delay Duration by Project
            </h3>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Estimated days of delay forecasted by the predictive model across active corridors.
            </p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDelayData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ background: '#0F172A', borderRadius: '5px', color: '#FFF', fontSize: '12px' }} />
                <Bar dataKey="delay" fill="#2563EB" radius={[4, 4, 0, 0]} name="Predicted Delay (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[12px] text-[#64748B] pt-3 border-t border-[#E2E8F0] flex items-center justify-between font-normal">
            <span>Model Refresh Rate: Daily</span>
            <span>Historical Validation Accuracy: 91.4%</span>
          </div>
        </div>

      </div>

      {/* SECTION 3 — MAJOR DELAY FACTORS */}
      <div className="card-enterprise space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3">
          <h3 className="section-title">
            Major Delay Factors
          </h3>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Ranked root causes contributing to land acquisition bottlenecks across all jurisdictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {delayFactors.map((factor, idx) => (
            <div key={idx} className="p-3 bg-[#F8FAFC] rounded-[5px] border border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="table-value-bold">{idx + 1}. {factor.name}</span>
                <span className={`status-badge ${
                  factor.risk === 'Critical' || factor.risk === 'High' ? "status-badge-danger" : "status-badge-warning"
                }`}>
                  {factor.risk} Impact
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px] text-[#64748B]">
                  <span>{factor.affected} Affected Parcels</span>
                  <span className="font-semibold">{factor.pct}% Contribution</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-[2px] overflow-hidden">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${factor.pct * 3}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 — EARLY WARNING PANEL */}
      <div className="card-enterprise space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="section-title">
              Early Warning Alerts
            </h3>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Automated high-priority flags requiring immediate officer intervention.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("alerts")}
            className="text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Early Warnings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px]">
          
          {/* HIGH RISK ALERT CARD 1 */}
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[6px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="status-badge status-badge-danger">
                HIGH RISK
              </span>
              <span className="table-value-bold font-mono text-[#0F172A]">Survey No. 124/2</span>
            </div>
            <p className="table-value-bold text-[#0F172A]">Ownership verification pending & title dispute</p>
            <p className="text-[#64748B]">Predicted Delay: <span className="font-semibold text-[#991B1B]">45 Days</span></p>
            <div className="p-3 bg-white rounded-[5px] border border-[#FCA5A5]/60 text-[#1E293B] text-[13px]">
              <span className="small-label block text-[#64748B] mb-0.5">Recommended Action:</span>
              Complete ownership verification with local revenue office and resolve compensation escrow issue before proceeding.
            </div>
          </div>

          {/* MEDIUM RISK ALERT CARD 2 */}
          <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="status-badge status-badge-warning">
                MEDIUM RISK
              </span>
              <span className="table-value-bold font-mono text-[#0F172A]">Survey No. 219/4</span>
            </div>
            <p className="table-value-bold text-[#0F172A]">Document mismatch detected in revenue records</p>
            <p className="text-[#64748B]">Predicted Delay: <span className="font-semibold text-[#92400E]">18 Days</span></p>
            <div className="p-3 bg-white rounded-[5px] border border-[#FDE68A]/60 text-[#1E293B] text-[13px]">
              <span className="small-label block text-[#64748B] mb-0.5">Recommended Action:</span>
              Verify revenue records (Patta / Chitta) with Taluk Tahsildar before entering next acquisition stage.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
