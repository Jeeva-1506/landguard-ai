import React, { useState } from "react";
import { Users, Shield, UserCheck, Eye, Plus, X, Check, Lock, Key } from "lucide-react";

interface UsersViewProps {
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

interface Officer {
  name: string;
  title: string;
  role: 'Administrator' | 'Project Officer';
  dept: string;
  district: string;
  status: string;
}

export default function UsersView({ showToast }: UsersViewProps) {
  const [users, setUsers] = useState<Officer[]>([
    { name: "Selvam J.", title: "Special District Revenue Officer (SDRO)", role: "Administrator", dept: "Revenue Department", district: "All Tamil Nadu", status: "Active" },
    { name: "Anandan K.", title: "Special Tahsildar (Land Acquisition)", role: "Project Officer", dept: "SLA Highway Division", district: "Kanchipuram", status: "Active" },
    { name: "Meenakshi Sundaram", title: "Sub-Collector & Arbitrator", role: "Administrator", dept: "Revenue Divisional Office", district: "Madurai & Tuticorin", status: "Active" },
    { name: "Rajesh Kumar", title: "Revenue Inspector (Survey)", role: "Project Officer", dept: "Survey and Settlement Dept", district: "Villupuram", status: "Active" },
    { name: "Geetha Ramasamy", title: "Special Tahsildar (SLA Metro)", role: "Project Officer", dept: "Metro Transit Board", district: "Chennai Metro Corridor", status: "Active" }
  ]);

  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Officer Form State
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState<'Administrator' | 'Project Officer'>("Project Officer");
  const [newDept, setNewDept] = useState("Revenue Department");
  const [newDistrict, setNewDistrict] = useState("Kanchipuram");

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim()) return;

    const newOfficer: Officer = {
      name: newName,
      title: newTitle,
      role: newRole,
      dept: newDept,
      district: newDistrict,
      status: "Active"
    };

    setUsers(prev => [newOfficer, ...prev]);
    setShowAddModal(false);
    setNewName("");
    setNewTitle("");

    if (showToast) {
      showToast(`Officer ${newOfficer.name} registered and granted ${newOfficer.role} authorization.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-heading">User Management & Jurisdictions</h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage access tokens, system roles, and assigned geographic districts for district collectors, tahsildars, and revenue inspectors</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Officer</span>
        </button>
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
                      onClick={() => setSelectedOfficer(u)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg ml-auto shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Permission Matrix</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix Modal */}
      {selectedOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-slide-up">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedOfficer.role} Authorization Matrix
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">{selectedOfficer.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{selectedOfficer.title} • {selectedOfficer.district}</p>
              </div>
              <button 
                onClick={() => setSelectedOfficer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Granted Module Privileges</h5>
              
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-slate-700">Survey Plot Entry & Verification</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Granted</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-slate-700">NLP Document Analysis & Entity Binding</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Granted</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-slate-700">Valuation Overrun Override & Escrow Clearance</span>
                  {selectedOfficer.role === "Administrator" ? (
                    <span className="text-purple-600 font-bold flex items-center gap-1"><Shield className="w-4 h-4" /> Admin Authorized</span>
                  ) : (
                    <span className="text-slate-400 font-bold flex items-center gap-1"><Lock className="w-4 h-4" /> Admin Required</span>
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="text-slate-700">Section-15 Statutory Audit Report Signoff</span>
                  {selectedOfficer.role === "Administrator" ? (
                    <span className="text-purple-600 font-bold flex items-center gap-1"><Shield className="w-4 h-4" /> Admin Authorized</span>
                  ) : (
                    <span className="text-slate-400 font-bold flex items-center gap-1"><Lock className="w-4 h-4" /> Read-Only</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOfficer(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">Register New Revenue Officer</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Officer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Ramanathan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Administrative Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Tahsildar (NH Highway Unit)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SLA System Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                  >
                    <option value="Project Officer">Project Officer</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jurisdiction District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                  >
                    <option value="Kanchipuram">Kanchipuram</option>
                    <option value="Villupuram">Villupuram</option>
                    <option value="Salem">Salem</option>
                    <option value="Nagapattinam">Nagapattinam</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Chennai Metro">Chennai Metro</option>
                    <option value="All Tamil Nadu">All Tamil Nadu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
