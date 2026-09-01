import React from "react";
import { 
  Project, 
  LandParcel, 
  Alert 
} from "../types";
import GisMap from "./GisMap";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Briefcase, 
  Layers, 
  AlertTriangle, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Upload, 
  Wand2, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface DashboardViewProps {
  projects: Project[];
  parcels: LandParcel[];
  alerts: Alert[];
  setActiveTab: (tab: string) => void;
  onViewParcel: (parcelId: string) => void;
}

export default function DashboardView({ projects, parcels, alerts, setActiveTab, onViewParcel }: DashboardViewProps) {
  // Compute true KPI figures dynamically based on state
  const totalProjects = projects.length;
  const totalParcelsCount = parcels.length;
  
  // Total pending vs acquired
  let totalLandRequired = 0;
  let totalLandAcquired = 0;
  projects.forEach(p => {
    totalLandRequired += p.landRequired;
    totalLandAcquired += p.landAcquired;
  });
  const landAcquiredPercent = totalLandRequired > 0 ? Math.round((totalLandAcquired / totalLandRequired) * 100) : 78;

  // Count high risk projects
  const highRiskProjectsCount = projects.filter(p => p.delayRisk === "High").length;
  
  // Avg Delay
  const totalDelay = parcels.reduce((sum, p) => sum + (p.predictedDelayDays || 0), 0);
  const avgDelayDays = totalParcelsCount > 0 ? Math.round(totalDelay / totalParcelsCount) : 62;

  // Estimated Cost Overrun Sum
  const totalOverrunCr = projects.reduce((sum, p) => sum + p.costOverrun, 0);

  // Donut chart: Delay Risk Distribution
  const lowRiskParcels = parcels.filter(p => p.riskLevel === "Low").length;
  const medRiskParcels = parcels.filter(p => p.riskLevel === "Medium").length;
  const highRiskParcels = parcels.filter(p => p.riskLevel === "High").length;

  const riskData = [
    { name: "Low Risk", value: lowRiskParcels || 8, color: "#10B981" },
    { name: "Medium Risk", value: medRiskParcels || 6, color: "#F59E0B" },
    { name: "High Risk", value: highRiskParcels || 6, color: "#EF4444" }
  ];

  // Line chart: Delay Trend (Predicted vs Actual)
  const delayTrendData = [
    { month: "Jan", "Actual Delay": 45, "Predicted Delay": 52 },
    { month: "Feb", "Actual Delay": 78, "Predicted Delay": 58 },
    { month: "Mar", "Actual Delay": 50, "Predicted Delay": 42 },
    { month: "Apr", "Actual Delay": 72, "Predicted Delay": 64 },
    { month: "May", "Actual Delay": 62, "Predicted Delay": 54 },
    { month: "Jun", "Actual Delay": 75, "Predicted Delay": 68 }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Projects</p>
            <h3 className="text-3xl font-bold text-slate-900">{totalProjects}</h3>
          </div>
          <p className="text-emerald-600 text-xs mt-2 font-medium">↑ Active Infrastructure</p>
        </div>

        {/* Land Acquired */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Land Acquired</p>
            <h3 className="text-3xl font-bold text-slate-900">{landAcquiredPercent}%</h3>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${landAcquiredPercent}%` }}></div>
          </div>
        </div>

        {/* High Risk Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">High Risk Projects</p>
            <h3 className="text-3xl font-bold text-slate-900">{highRiskProjectsCount}</h3>
          </div>
          <p className="text-rose-600 text-xs mt-2 font-medium">Requires Intervention</p>
        </div>

        {/* Average Delay */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Avg. Delay Duration</p>
            <h3 className="text-3xl font-bold text-slate-900">{avgDelayDays} <span className="text-xs text-slate-400 font-normal">Days</span></h3>
          </div>
          <p className="text-amber-600 text-xs mt-2 font-medium">Predicted increase: +5%</p>
        </div>

        {/* Estimated Cost Overrun */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Estimated Overrun</p>
            <h3 className="text-3xl font-bold text-slate-900">₹{totalOverrunCr.toFixed(1)} <span className="text-xs text-slate-400 font-normal font-sans">Cr</span></h3>
          </div>
          <p className="text-rose-600 text-xs mt-2 font-medium">Critical factor: Disputes</p>
        </div>
      </div>

      {/* GIS Mapping System */}
      <div className="w-full">
        <GisMap projects={projects} parcels={parcels} onViewParcel={onViewParcel} />
      </div>

      {/* Main Charts & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left main column (8 spans out of 12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Delay Trend Line Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800">Delay Trend (Days)</h3>
              <p className="text-[11px] text-slate-400">Chronological trend of actual delays vs model estimations</p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={delayTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0F172A', borderRadius: '8px', color: '#FFF', border: 'none', fontSize: 11 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                  <Line type="monotone" dataKey="Actual Delay" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Predicted Delay" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Acquisition Projects Table */}
          <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Active Acquisition Projects</h3>
                <p className="text-[11px] text-slate-400">Real-time land acquisition progress & risk assessment metrics</p>
              </div>
              <button 
                onClick={() => setActiveTab("projects")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View All Projects
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Project ID</th>
                    <th className="px-4 py-3 whitespace-nowrap">Project Name</th>
                    <th className="px-4 py-3 whitespace-nowrap">District</th>
                    <th className="px-4 py-3 whitespace-nowrap">Progress</th>
                    <th className="px-4 py-3 whitespace-nowrap">Delay Risk</th>
                    <th className="px-4 py-3 whitespace-nowrap">Est. Overrun</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {projects.slice(0, 5).map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 font-mono whitespace-nowrap">{project.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{project.name}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{project.district}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2 font-semibold text-slate-800">{project.progress}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full" 
                              style={{ width: `${project.progress}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
                          project.delayRisk === "High" 
                            ? "bg-rose-50 text-rose-700 border-rose-200" 
                            : project.delayRisk === "Medium"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {project.delayRisk} Risk
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-bold whitespace-nowrap ${project.costOverrun > 5 ? "text-rose-600" : "text-slate-700"}`}>
                        ₹{project.costOverrun} Cr
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setActiveTab("projects")} 
                          className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (4 spans out of 12) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* System Alerts widget (Slate dark mode card) */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-lg shrink-0">
            <h4 className="text-sm font-bold mb-4 flex items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-pulse"></span>
              System Alerts (Early Warning)
            </h4>
            <div className="space-y-4">
              {alerts.slice(0, 2).map((alert) => (
                <div 
                  key={alert.id}
                  onClick={() => onViewParcel(alert.parcelId)}
                  className={`p-3 bg-slate-800 rounded-lg border-l-2 cursor-pointer hover:bg-slate-750 transition-colors ${
                    alert.priority === "High" ? "border-rose-500" : "border-amber-500"
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    {alert.priority === "High" ? "DELAY RISK ELEVATION" : "DOCUMENT REVIEW REQUIRED"}
                  </p>
                  <p className="text-xs font-medium mt-1 text-slate-200">
                    Parcel {alert.parcelId}: {alert.issue}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {alert.projectName}
                  </p>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="p-3 bg-slate-800 text-slate-400 text-xs rounded-lg text-center">
                  No active system alerts detected.
                </div>
              )}
            </div>
          </div>

          {/* Delay Risk Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Delay Risk Distribution</h4>
              <p className="text-[11px] text-slate-400 mb-4">Ratio of risk class among active land parcels</p>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="w-28 h-28 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Parcels`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-xl font-bold text-slate-800">{totalParcelsCount}</span>
                  <p className="text-[8px] text-slate-400 uppercase font-bold">Plots</p>
                </div>
              </div>

              <div className="text-xs space-y-2 font-semibold text-slate-600">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full mr-2"></span>
                  High Risk ({highRiskParcels})
                </div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full mr-2"></span>
                  Medium Risk ({medRiskParcels})
                </div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full mr-2"></span>
                  Low Risk ({lowRiskParcels})
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Primary Risk Factors</p>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Ownership Dispute</span>
                  <span className="text-rose-600 font-bold">Critical</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Doc Verification</span>
                  <span className="text-amber-600 font-bold">Moderate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Administrative Actions</h3>
              <p className="text-[11px] text-slate-400">Direct shortcuts to access primary administrative workflows</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => { setActiveTab("parcels") }}
                className="p-3 bg-slate-800 hover:bg-slate-750 rounded-lg text-[11px] font-bold text-left transition-colors cursor-pointer border border-slate-700/50"
              >
                <p className="text-white">Add Plot</p>
                <p className="text-[9px] text-slate-400 font-medium">New survey</p>
              </button>

              <button 
                onClick={() => { setActiveTab("settings") }}
                className="p-3 bg-slate-800 hover:bg-slate-750 rounded-lg text-[11px] font-bold text-left transition-colors cursor-pointer border border-slate-700/50"
              >
                <p className="text-white">CSV Upload</p>
                <p className="text-[9px] text-slate-400 font-medium">Batch import</p>
              </button>

              <button 
                onClick={() => { setActiveTab("predict-delay") }}
                className="p-3 bg-slate-800 hover:bg-slate-750 rounded-lg text-[11px] font-bold text-left transition-colors cursor-pointer border border-slate-700/50"
              >
                <p className="text-white">Delay Risks</p>
                <p className="text-[9px] text-slate-400 font-medium">ML Forest</p>
              </button>

              <button 
                onClick={() => { setActiveTab("reports") }}
                className="p-3 bg-slate-800 hover:bg-slate-750 rounded-lg text-[11px] font-bold text-left transition-colors cursor-pointer border border-slate-700/50"
              >
                <p className="text-white">Generate Audit</p>
                <p className="text-[9px] text-slate-400 font-medium">S-15 clearance</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
