import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { Sparkles, Activity, CheckCircle2, RefreshCw, BarChart2, ShieldAlert, Layers } from "lucide-react";

interface DelayForecastViewProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function DelayForecastView({ showToast }: DelayForecastViewProps) {
  // Chart data
  const riskDistributionData = [
    { name: "Low Risk", value: 35, color: "#22C55E" },
    { name: "Medium Risk", value: 28, color: "#F59E0B" },
    { name: "High Risk", value: 24, color: "#FF6B52" },
    { name: "Critical Risk", value: 13, color: "#EF4444" }
  ];

  const historicalTrendData = [
    { month: "Jan", "Actual Delay": 42, "Forecast Delay": 45 },
    { month: "Feb", "Actual Delay": 68, "Forecast Delay": 62 },
    { month: "Mar", "Actual Delay": 51, "Forecast Delay": 48 },
    { month: "Apr", "Actual Delay": 74, "Forecast Delay": 70 },
    { month: "May", "Actual Delay": 59, "Forecast Delay": 56 },
    { month: "Jun", "Actual Delay": 65, "Forecast Delay": 63 }
  ];

  const factorRankings = [
    { code: "RF-01", factor: "Ownership Disputes & Title Claims", location: "Multi-Owner Partition Suits", impact: 85, weight: "Critical" },
    { code: "RF-02", factor: "Compensation Disagreements", location: "Market Valuation Rate Claims", impact: 72, weight: "High" },
    { code: "RF-03", factor: "Court Stay Applications", location: "Section 15 Writ Petitions", impact: 68, weight: "Critical" },
    { code: "RF-04", factor: "Incomplete Survey Records", location: "Field Measurement Discrepancies", impact: 45, weight: "Medium" },
    { code: "RF-05", factor: "Revenue Record Mismatches", location: "Patta / Chitta Discrepancy", impact: 38, weight: "Low" }
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#12241C] pb-12 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F382C] font-['Outfit']">
              Delay Forecast & Predictive Risk Scoring
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed font-medium">
              The system analyzes historical acquisition records, project progress, land details, objections, compensation status and other project indicators to estimate the likelihood and duration of delay.
            </p>
          </div>

          <button
            onClick={() => showToast("Recalibrating predictive model variables...", "success")}
            className="btn-primary shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalibrate Model</span>
          </button>
        </div>
      </div>

      {/* MODEL PERFORMANCE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Prediction Accuracy</span>
          <p className="text-3xl font-extrabold text-emerald-600 font-['Outfit']">91.4%</p>
          <span className="text-[11px] text-slate-500 font-medium">Validated against historical projects</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Model Status</span>
          <p className="text-3xl font-extrabold text-[#0F382C] font-['Outfit'] flex items-center gap-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Active
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Random Forest Regressor</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Records Analyzed</span>
          <p className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">1,420</p>
          <span className="text-[11px] text-slate-500 font-medium">Land survey parcels</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Last Update</span>
          <p className="text-3xl font-extrabold text-[#0F382C] font-['Outfit']">Today</p>
          <span className="text-[11px] text-slate-500 font-medium">08:30 AM System Sync</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F382C] font-['Outfit']">
              Risk Class Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Proportion of acquisition parcels grouped by predicted risk score.
            </p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Delay Trend */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F382C] font-['Outfit']">
              Historical Delay Trend vs Model Forecast
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Comparison of actual recorded delay days against model predictions.
            </p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ background: '#0F382C', borderRadius: '12px', color: '#FFF', fontSize: '11px', border: 'none' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                <Line type="monotone" dataKey="Actual Delay" stroke="#0F382C" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Forecast Delay" stroke="#FF6B52" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* MAJOR RISK FACTOR WEIGHTINGS — MATCHING USER REFERENCE TABLE STYLE */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(15,56,44,0.03)] space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-[#0F382C] font-['Outfit']">
            Primary Risk Factors & Feature Weights
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Key input variables ranked by their quantitative impact on predicted delay duration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Factor Code</th>
                <th className="table-header">Risk Factor Name & Category</th>
                <th className="table-header">Quantitative Impact</th>
                <th className="table-header">Risk Weight</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {factorRankings.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F6FAF5] transition-colors">
                  <td className="table-value-bold font-mono text-xs text-[#0F382C]">{item.code}</td>
                  <td>
                    <div>
                      <p className="font-extrabold text-[#0F382C] font-['Outfit'] text-sm">{item.factor}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.location}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-[#0F382C]">{item.impact}%</span>
                      <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#0F382C] h-full rounded-full" style={{ width: `${item.impact}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      item.weight === 'Critical'
                        ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FECDD3]"
                        : item.weight === 'High'
                          ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                          : "bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]"
                    }`}>
                      {item.weight}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => showToast(`Selected factor ${item.code} for deep analysis`, "success")}
                      className="bg-white border border-slate-200 hover:bg-[#F6FAF5] hover:border-[#0F382C] text-[#0F382C] font-extrabold text-xs px-5 py-1.5 rounded-full shadow-2xs cursor-pointer transition-all"
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
