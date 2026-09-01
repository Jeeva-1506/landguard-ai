import React from "react";
import { Users, Shield, UserCheck, Eye } from "lucide-react";

export default function UsersView() {
  const users = [
    { name: "Selvam J.", title: "Special District Revenue Officer (SDRO)", role: "Administrator", dept: "Revenue Department", district: "All Tamil Nadu", status: "Active" },
    { name: "Anandan K.", title: "Special Tahsildar (Land Acquisition)", role: "Project Officer", dept: "SLA Highway Division", district: "Kanchipuram", status: "Active" },
    { name: "Meenakshi Sundaram", title: "Sub-Collector & Arbitrator", role: "Administrator", dept: "Revenue Divisional Office", district: "Madurai & Tuticorin", status: "Active" },
    { name: "Rajesh Kumar", title: "Revenue Inspector (Survey)", role: "Project Officer", dept: "Survey and Settlement Dept", district: "Villupuram", status: "Active" },
    { name: "Geetha Ramasamy", title: "Special Tahsildar (SLA Metro)", role: "Project Officer", dept: "Metro Transit Board", district: "Chennai Metro Corridor", status: "Active" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">User Management & Jurisdictions</h3>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Manage access tokens, system roles, and assigned geographic districts for district collectors, tahsildars, and revenue inspectors</p>
      </div>

      {/* Access info banner */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-4 text-blue-900 shadow-xs">
        <Shield className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <h5 className="font-bold text-base font-heading">Role-Based Access Control (RBAC) Active</h5>
          <p className="text-blue-800 mt-1 text-sm leading-relaxed font-medium">
            Access keys and data editing limits are managed based on the officer's verified role. Administrators can override valuations and clear awards; Project Officers can register surveyed plots and analyze letters.
          </p>
        </div>
      </div>

      {/* Officers List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 font-semibold text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Officer Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Administrative Designation</th>
                <th className="px-4 py-3 whitespace-nowrap">Department</th>
                <th className="px-4 py-3 whitespace-nowrap">Jurisdiction</th>
                <th className="px-4 py-3 whitespace-nowrap">SLA Role</th>
                <th className="px-4 py-3 whitespace-nowrap">Session Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600 whitespace-nowrap">{u.title}</td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{u.dept}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{u.district}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                      u.role === "Administrator" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 text-xs whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => alert(`Showing permission matrix for ${u.name}.`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg ml-auto shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Permissions</span>
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
