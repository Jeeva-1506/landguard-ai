import React, { useState } from "react";
import { LandParcel, Project } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, TrendingUp, HelpCircle, Map, PieChart as PieIcon } from "lucide-react";

interface AnalyticsViewProps {
  parcels: LandParcel[];
  projects: Project[];
}

export default function AnalyticsView({ parcels, projects }: AnalyticsViewProps) {
  const [metricTab, setMetricTab] = useState<'count' | 'delay' | 'cost'>('count');

  // Group land parcels data by district
  const districtMap: Record<string, { name: string; count: number; totalDelay: number; totalCost: number }> = {};
  
  parcels.forEach(p => {
    if (!districtMap[p.district]) {
      districtMap[p.district] = { name: p.district, count: 0, totalDelay: 0, totalCost: 0 };
    }
    districtMap[p.district].count += 1;
    districtMap[p.district].totalDelay += p.predictedDelayDays || 45;
    districtMap[p.district].totalCost += p.expectedAdditionalCost || 120000;
  });

  const chartData = Object.values(districtMap).map(d => ({
    District: d.name,
    "Registered Plots": d.count,
    "Average Delay (Days)": Math.round(d.totalDelay / d.count),
    "Overrun ( Lakhs)": parseFloat((d.totalCost / 100000).toFixed(1))
  }));

  // Classification breakdown
  const classMap: Record<string, number> = {};
  parcels.forEach(p => {
    classMap[p.landType] = (classMap[p.landType] || 0) + 1;
  });
  const COLORS = ["#0070F3", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const classChartData = Object.entries(classMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">SLA District Analytics Panel</h3>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Analyze comparative revenue indicators, acquisition bottlenecks, and cost escalations across Tamil Nadu districts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Metrics Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading">Comparative District Analytics</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Toggle metrics to compare performance across district jurisdictions</p>
            </div>

            {/* Metric buttons */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200">
              <button
                onClick={() => setMetricTab('count')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  metricTab === 'count' ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Plots Count
              </button>
              <button
                onClick={() => setMetricTab('delay')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  metricTab === 'delay' ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Avg Delay
              </button>
              <button
                onClick={() => setMetricTab('cost')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  metricTab === 'cost' ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Avg Overrun
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="District" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <Tooltip contentStyle={{ background: '#0B1E36', borderRadius: '12px', color: '#FFF', border: 'none', fontSize: 13 }} />
                <Legend iconSize={12} wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                {metricTab === 'count' && (
                  <Bar dataKey="Registered Plots" fill="#0070F3" radius={[6, 6, 0, 0]} barSize={40} />
                )}
                {metricTab === 'delay' && (
                  <Bar dataKey="Average Delay (Days)" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={40} />
                )}
                {metricTab === 'cost' && (
                  <Bar dataKey="Overrun ( Lakhs)" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={40} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classification Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading">Land Classifications Ratio</h4>
            <p className="text-xs text-slate-500 font-medium mb-4 mt-0.5">Ratio of registered parcel agricultural vs commercial types</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {classChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
            {classChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
