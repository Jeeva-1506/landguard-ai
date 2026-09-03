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
    { name: "Low Risk", value: 35, color: "#10B981" },
    { name: "Medium Risk", value: 28, color: "#F59E0B" },
    { name: "High Risk", value: 24, color: "#F97316" },
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
    { factor: "Ownership Disputes", impact: 85, weight: "High" },
    { factor: "Compensation Disagreements", impact: 72, weight: "High" },
    { factor: "Court Stay Applications", impact: 68, weight: "Critical" },
    { factor: "Incomplete Survey Records", impact: 45, weight: "Medium" },
    { factor: "Revenue Record Mismatches", impact: 38, weight: "Medium" }
  ];

  return (
    <div className="space-y-8 font-sans antialiased text-slate-800 pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Delay Forecast & Predictive Risk Scoring
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              The system analyzes historical acquisition records, project progress, land details, objections, compensation status and other project indicators to estimate the likelihood and duration of delay.
            </p>
          </div>

          <button
            onClick={() => showToast("Recalibrating predictive model variables...", "success")}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalibrate Model</span>
          </button>
        </div>
      </div>

      {/* MODEL PERFORMANCE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Prediction Accuracy</span>
          <p className="text-2xl font-extrabold text-emerald-600">91.4%</p>
          <span className="text-[11px] text-slate-500">Validated against historical projects</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Model Status</span>
          <p className="text-2xl font-extrabold text-blue-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Active
          </p>
          <span className="text-[11px] text-slate-500">Random Forest Regressor</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Records Analyzed</span>
          <p className="text-2xl font-extrabold text-slate-900">1,420</p>
          <span className="text-[11px] text-slate-500">Land survey parcels</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Last Update</span>
          <p className="text-2xl font-extrabold text-slate-900">Today</p>
          <span className="text-[11px] text-slate-500">08:30 AM System Sync</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Risk Class Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Historical Delay Trend vs Model Forecast
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of actual recorded delay days against model predictions.
            </p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ background: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '11px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                <Line type="monotone" dataKey="Actual Delay" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Forecast Delay" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* MAJOR RISK FACTOR WEIGHTINGS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Primary Risk Factors & Feature Weights
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key input variables ranked by their quantitative impact on predicted delay duration.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {factorRankings.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                <span className="font-bold text-slate-900">{item.factor}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-700 h-full rounded-full" style={{ width: `${item.impact}%` }} />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.weight === 'Critical' ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-800"
                }`}>
                  {item.weight} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
