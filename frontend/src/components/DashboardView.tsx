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
import { 
  ChevronRight, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  MoreVertical, 
  Clock, 
  AlertTriangle,
  FileCheck2,
  Building2,
  TrendingUp,
  MapPin
} from "lucide-react";

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
  // KPI Calculations
  const totalProjects = projects.length;
  const totalParcels = parcels.length;
  const highRiskParcels = parcels.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length;
  
  const avgDelayDays = parcels.length > 0
    ? Math.round(parcels.reduce((sum, p) => sum + (p.predictedDelayDays || 0), 0) / parcels.length)
    : 45;

  const totalCostExposureCrores = (parcels.reduce((sum, p) => sum + (p.expectedAdditionalCost || 0), 0) / 10000000).toFixed(2);
  const pendingDisputesCount = parcels.filter(p => p.ownershipDispute || p.courtCase).length;

  // Chart Data
  const lowRiskCount = parcels.filter(p => p.riskLevel === 'Low').length;
  const medRiskCount = parcels.filter(p => p.riskLevel === 'Medium').length;
  const highRiskCount = parcels.filter(p => p.riskLevel === 'High').length;
  const criticalRiskCount = parcels.filter(p => p.riskLevel === 'Critical').length;

  const riskData = [
    { name: "Low Risk", value: lowRiskCount || 14, color: "#22C55E" },
    { name: "Medium Risk", value: medRiskCount || 17, color: "#F59E0B" },
    { name: "High Risk", value: highRiskCount || 37, color: "#FF6B52" },
    { name: "Critical", value: criticalRiskCount || 4, color: "#EF4444" }
  ];

  // Bar Chart Data (Sample 6 Corridors with coral highlight)
  const barChartData = [
    { month: "NH-101", count: 78, isHighlight: false },
    { month: "NH-102", count: 34, isHighlight: false },
    { month: "PROJ-001", count: 67, isHighlight: true },
    { month: "PROJ-002", count: 28, isHighlight: false },
    { month: "PROJ-003", count: 39, isHighlight: false },
    { month: "PROJ-005", count: 80, isHighlight: false },
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#12241C] pb-12 animate-fade-in">

      {/* 1. TOP WELCOME TITLE BAR & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0F382C] font-['Outfit'] tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Welcome, Let's dive into your personalized land acquisition setup guide.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("projects")}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Create Infrastructure Project</span>
          </button>
        </div>
      </div>

      {/* 2. EMITLY STYLE ROW 1 — PERFORMANCE OVER TIME HORIZONTAL KPI METRICS */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F382C] font-['Outfit']">
              Land Acquisition Performance Over Time
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              06 Sept, 2026 • Live ML Evaluation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* 4 HORIZONTAL METRIC BLOCKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 pt-2">
          
          {/* Metric 1 */}
          <div className="space-y-1.5 pt-2 md:pt-0">
            <span className="text-xs font-semibold text-slate-400 block">Total Parcels Registered</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">{totalParcels}</span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                +0.02% <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="space-y-1.5 md:pl-6 pt-2 md:pt-0">
            <span className="text-xs font-semibold text-slate-400 block">High Risk Bottlenecks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">{highRiskParcels}</span>
              <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                +0.02% <ArrowDownRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="space-y-1.5 md:pl-6 pt-2 md:pt-0">
            <span className="text-xs font-semibold text-slate-400 block">Est. Cost Overrun Exposure</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">₹{totalCostExposureCrores} Cr</span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                +12% <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="space-y-1.5 md:pl-6 pt-2 md:pt-0">
            <span className="text-xs font-semibold text-slate-400 block">Active Corridors</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">{totalProjects}</span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                +0.02% <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. EMITLY STYLE ROW 2 — BAR CHART & SCHEDULE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Campaign Performance Bar Chart Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F382C] font-['Outfit']">
                Corridor Acquisition Performance
              </h3>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">₹{totalCostExposureCrores} Cr</span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                  ↑ 12% <span className="text-slate-500 font-normal ml-1">vs last month</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">06 Sept, 2026</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart Visualization matching Coral Bar Accent in Reference */}
          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0F382C', borderRadius: '12px', color: '#FFF', fontSize: '12px', border: 'none' }} 
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} name="Progress Pct">
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isHighlight ? '#FF6B52' : '#F3F4F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium">
            <span>Highlighted Corridor: <strong className="text-[#FF6B52]">PROJ-001 (67% Acquired)</strong></span>
            <button 
              onClick={() => setActiveTab("reports")}
              className="text-[#0F382C] font-bold hover:underline"
            >
              Export ML Report →
            </button>
          </div>
        </div>

        {/* Schedule Campaign & Action Events Right Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F382C] font-['Outfit']">
              Schedule Action Reviews
            </h3>
            <span className="text-xs font-bold text-slate-400">September 2026</span>
          </div>

          {/* Calendar Day Picker Bar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-2 text-center text-xs font-semibold">
            <div className="p-1 text-slate-400">Mon<br /><span className="text-slate-800">15</span></div>
            <div className="p-1 text-slate-400">Tue<br /><span className="text-slate-800">16</span></div>
            <div className="p-1 text-slate-400">Wed<br /><span className="text-slate-800">17</span></div>
            <div className="p-1 text-slate-400">Thu<br /><span className="text-slate-800">18</span></div>
            <div className="bg-[#D8F374] text-[#0F382C] font-extrabold px-3 py-1.5 rounded-xl shadow-2xs">
              Fri<br /><span>19</span>
            </div>
            <div className="p-1 text-slate-400">Sat<br /><span className="text-slate-800">20</span></div>
            <div className="p-1 text-slate-400">Sun<br /><span className="text-slate-800">21</span></div>
          </div>

          {/* Pastel Yellow Card (Element of Design Test style -> Land Hearing Review) */}
          <div className="bg-[#FEF08A] border border-amber-300 rounded-2xl p-4 space-y-2 text-[#0F382C] shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-200/80 rounded-xl flex items-center justify-center text-amber-900">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-['Outfit']">Section 15 Hearing: Vadipatti</h4>
                  <p className="text-[11px] font-medium text-amber-900/80">10:00 AM - 11:30 AM</p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-amber-900/60 cursor-pointer" />
            </div>
          </div>

          {/* Pastel Pink Card (Design Principle Test style -> Special Arbitration Camp) */}
          <div className="bg-[#F5D0FE] border border-purple-300 rounded-2xl p-4 space-y-2 text-[#0F382C] shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-200/80 rounded-xl flex items-center justify-center text-purple-900">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-['Outfit']">Special Compensation Camp</h4>
                  <p className="text-[11px] font-medium text-purple-900/80">02:00 PM - 04:30 PM</p>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-purple-900/60 cursor-pointer" />
            </div>
          </div>

        </div>
      </div>

      {/* 4. ACTIVE PROJECTS & BOTTLENECK PARCELS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F382C] font-['Outfit']">
              Registered Corridors & Priority Risk Status
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live tracking of registered land acquisition projects across state corridors.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("projects")}
            className="text-xs font-bold text-[#0F382C] hover:underline flex items-center gap-1 cursor-pointer"
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
                <th className="table-header">Corridor Name</th>
                <th className="table-header">State</th>
                <th className="table-header">District</th>
                <th className="table-header text-center">Land Parcels</th>
                <th className="table-header">Acquisition Progress</th>
                <th className="table-header">Risk Level</th>
                <th className="table-header">Predicted Delay</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {projects.slice(0, 6).map((proj) => (
                <tr key={proj.id} className="hover:bg-[#F6FAF5] transition-colors">
                  <td className="table-value-bold font-mono text-xs">{proj.id}</td>
                  <td className="table-value-bold font-['Outfit']">{proj.name}</td>
                  <td className="text-slate-500 text-xs font-medium">{proj.state || "Tamil Nadu"}</td>
                  <td className="text-slate-500 text-xs font-medium">{proj.district}</td>
                  <td className="text-center font-bold text-[#0F382C] text-xs">{proj.totalParcelsCount || 12}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0F382C]">{proj.progress}%</span>
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0F382C] h-full rounded-full" style={{ width: `${proj.progress}%` }} />
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
                  <td className="table-value-bold font-mono text-xs text-[#0F382C]">
                    {proj.predictedDelay} Days
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setActiveTab("projects")}
                      className="btn-secondary text-xs h-8 px-3 py-0"
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

    </div>
  );
}
