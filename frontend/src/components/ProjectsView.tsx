import React, { useState } from "react";
import { Project } from "../types";
import { Plus, Search, MapPin, Briefcase, IndianRupee, Layers, Edit, Trash2, X, Check } from "lucide-react";

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (project: Partial<Project>) => void;
  onUpdateProject: (id: string, project: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectsView({ projects, onAddProject, onUpdateProject, onDeleteProject }: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form States
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Kanchipuram");
  const [type, setType] = useState("Highway");
  const [landRequired, setLandRequired] = useState(100);
  const [landAcquired, setLandAcquired] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(50000000);
  const [delayRisk, setDelayRisk] = useState<'Low' | 'Medium' | 'High'>("Low");
  const [status, setStatus] = useState<'On Track' | 'Delayed' | 'Critical' | 'Completed'>("On Track");

  const openAddModal = () => {
    setEditingProject(null);
    setId("");
    setName("");
    setDistrict("Kanchipuram");
    setType("Highway");
    setLandRequired(100);
    setLandAcquired(0);
    setEstimatedCost(50000000);
    setDelayRisk("Low");
    setStatus("On Track");
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setId(proj.id);
    setName(proj.name);
    setDistrict(proj.district);
    setType(proj.type);
    setLandRequired(proj.landRequired);
    setLandAcquired(proj.landAcquired);
    setEstimatedCost(proj.estimatedCost);
    setDelayRisk(proj.delayRisk);
    setStatus(proj.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name) {
      alert("Please provide a Project ID and Project Name.");
      return;
    }

    const payload: Partial<Project> = {
      id,
      name,
      district,
      type,
      landRequired: Number(landRequired),
      landAcquired: Number(landAcquired),
      progress: landRequired > 0 ? Math.round((landAcquired / landRequired) * 100) : 0,
      estimatedCost: Number(estimatedCost),
      delayRisk,
      status,
      costOverrun: delayRisk === "High" ? parseFloat((landRequired * 0.08).toFixed(2)) : delayRisk === "Medium" ? parseFloat((landRequired * 0.03).toFixed(2)) : 0,
      predictedDelay: delayRisk === "High" ? 85 : delayRisk === "Medium" ? 45 : 12
    };

    if (editingProject) {
      onUpdateProject(editingProject.id, payload);
    } else {
      onAddProject(payload);
    }
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">Administrative Infrastructure Projects</h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Add, edit and monitor large-scale infrastructure projects undergoing land acquisition</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="w-5 h-5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search projects by ID, name or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
          />
        </div>
        <span className="text-sm text-slate-500 font-medium">
          Showing <b className="text-slate-800">{filteredProjects.length}</b> of <b className="text-slate-800">{projects.length}</b> Projects
        </span>
      </div>

      {/* Projects Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div key={proj.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg border border-slate-200">
                  {proj.id}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                  proj.status === "On Track"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : proj.status === "Delayed"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {proj.status}
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-slate-900 truncate mb-1.5 font-heading" title={proj.name}>
                {proj.name}
              </h4>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-5 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{proj.district} District</span>
                <span className="text-slate-300">•</span>
                <span>{proj.type}</span>
              </div>

              {/* Progress and values */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-500">Land Acquired Ratio</span>
                  <span className="font-bold text-slate-800 font-mono text-base">{proj.landAcquired} / {proj.landRequired} ha</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      proj.progress > 70 
                        ? "bg-emerald-500" 
                        : proj.progress > 40 
                          ? "bg-blue-500" 
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${proj.progress}%` }} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Estimated Budget</span>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">₹{(proj.estimatedCost / 10000000).toFixed(1)} Cr</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Predicted Overrun</span>
                    <p className="text-base font-extrabold text-rose-600 mt-0.5">₹{proj.costOverrun} Cr</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 border-t border-slate-100 mt-6 pt-3.5 justify-end">
              <button
                onClick={() => openEditModal(proj)}
                className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Edit Details"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete project ${proj.id}? This will remove all associated statistics.`)) {
                    onDeleteProject(proj.id);
                  }
                }}
                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 font-heading">
                {editingProject ? "Edit Infrastructure Project" : "Register New Project"}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProject}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="e.g. NH-55"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 disabled:opacity-65 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Project Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  >
                    <option value="Highway">Highway Link</option>
                    <option value="Railway">Railway Corridor</option>
                    <option value="Power">Power Generation Plant</option>
                    <option value="Industrial">Industrial SIPCOT Park</option>
                    <option value="Urban">Urban Metro Transit</option>
                    <option value="Water">Water Irrigation Supply</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Madurai-Tuticorin Link Corridor"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    District Location
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Madurai"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Estimated Budget (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Total Land Required (Hectares)
                  </label>
                  <input
                    type="number"
                    required
                    value={landRequired}
                    onChange={(e) => setLandRequired(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Land Acquired So Far (Hectares)
                  </label>
                  <input
                    type="number"
                    required
                    value={landAcquired}
                    onChange={(e) => setLandAcquired(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Model Delay Risk
                  </label>
                  <select
                    value={delayRisk}
                    onChange={(e) => setDelayRisk(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium"
                  >
                    <option value="On Track">On Track</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Critical">Critical</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
