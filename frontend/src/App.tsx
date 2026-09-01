import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import ParcelsView from "./components/ParcelsView";
import CompensationView from "./components/CompensationView";
import DocumentsView from "./components/DocumentsView";
import PredictionsView from "./components/PredictionsView";
import AlertsView from "./components/AlertsView";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import UsersView from "./components/UsersView";

import { 
  fetchProjects, 
  fetchParcels, 
  fetchAlerts, 
  createProject, 
  updateProject, 
  deleteProject, 
  createParcel, 
  updateParcel, 
  deleteParcel, 
  resolveAlert 
} from "./api";
import { Project, LandParcel, Alert } from "./types";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeParcelId, setActiveParcelId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'Administrator' | 'Project Officer'>("Administrator");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // Core Database States
  const [projects, setProjects] = useState<Project[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Elegant Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projData, parcelData, alertData] = await Promise.all([
        fetchProjects(),
        fetchParcels(),
        fetchAlerts()
      ]);
      setProjects(projData);
      setParcels(parcelData);
      setAlerts(alertData);
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync records with database. Operating in offline fallback.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Projects
  const handleAddProject = async (projPayload: Partial<Project>) => {
    try {
      const newProj = await createProject(projPayload);
      setProjects(prev => [newProj, ...prev]);
      showToast(`Project ${newProj.id} registered successfully.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to register project.", "error");
    }
  };

  const handleUpdateProject = async (id: string, projPayload: Partial<Project>) => {
    try {
      const updatedProj = await updateProject(id, projPayload);
      setProjects(prev => prev.map(p => p.id === id ? updatedProj : p));
      showToast(`Project ${id} details updated.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update project.", "error");
    }
  };

  const handleWithDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast(`Project ${id} removed.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete project.", "error");
    }
  };

  // Handlers for Parcels
  const handleAddParcel = async (parcelPayload: Partial<LandParcel>) => {
    try {
      const newParcel = await createParcel(parcelPayload);
      setParcels(prev => [newParcel, ...prev]);
      showToast(`Parcel ${newParcel.id} survey record created.`);
      // Reload alerts as new parcel triggers risk evaluation
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error(err);
      showToast("Failed to register parcel.", "error");
    }
  };

  const handleUpdateParcel = async (id: string, parcelPayload: Partial<LandParcel>) => {
    try {
      const updatedParcel = await updateParcel(id, parcelPayload);
      setParcels(prev => prev.map(p => p.id === id ? { ...p, ...updatedParcel } : p));
      showToast(`Parcel ${id} variables updated.`);
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error(err);
      showToast("Failed to update parcel variables.", "error");
    }
  };

  const handleWithDeleteParcel = async (id: string) => {
    try {
      await deleteParcel(id);
      setParcels(prev => prev.filter(p => p.id !== id));
      showToast(`Parcel ${id} removed from survey registries.`);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete parcel.", "error");
    }
  };

  // Handler for Alerts
  const handleResolveAlert = async (id: string) => {
    try {
      const resolved = await resolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? resolved : a));
      showToast("Early warning resolved and logged.");
    } catch (err) {
      console.error(err);
      showToast("Failed to resolve alert.", "error");
    }
  };

  // Helper: jump directly to a parcel profile detail from anywhere
  const triggerViewParcelDetails = (parcelId: string) => {
    setActiveParcelId(parcelId);
    setActiveTab("parcels");
  };

  // Titles dictionary
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: "Executive Dashboard", subtitle: "National Highway & Infrastructure Acquisition Monitoring Corridor" },
    projects: { title: "Infrastructure Projects Registry", subtitle: "Active acquisition corridors & project boundaries" },
    parcels: { title: "Land Survey Ledger", subtitle: "Individual land plots status, owner claims & risk weights" },
    compensation: { title: "Valuation & Disbursements", subtitle: "Compensation escrow releases & awards clearance" },
    documents: { title: "NLP Document Analysis Engine", subtitle: "Objections parsing & claims extraction" },
    "predict-delay": { title: "Acquisition Delay Modeler", subtitle: "Random forest regression on survey delay estimates" },
    "predict-cost": { title: "Overrun Estimation Engine", subtitle: "Simulate budget escalations based on stays & objections" },
    "predict-legal": { title: "Legal Standings Sandbox", subtitle: "Writ stay stay likelihood & court case impacts" },
    alerts: { title: "Early Warning Desk", subtitle: "Automated flags, incomplete documents & critical milestones" },
    analytics: { title: "District Benchmarking analytics", subtitle: "Comparative spatial statistics across jurisdictions" },
    reports: { title: "Report & Audit Center", subtitle: "Section-15 compliant statutory report compiler" },
    settings: { title: "System Parameters & Import", subtitle: "Bulk CSV importing & database re-hydration" },
    users: { title: "Officer Jurisdictions Registry", subtitle: "Role authorizations & district tasks" }
  };

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: "J. Selvam",
    title: "Director SLA",
    role: "Administrator" as 'Administrator' | 'Project Officer',
    department: "Revenue Department",
    district: "All Tamil Nadu",
    email: "j.selvam@tn.gov.in",
    phone: "+91 94440 12345",
    initials: "JS"
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-row antialiased">
      {/* Sidebar - Fixed Left */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "parcels") setActiveParcelId(null);
        }}
        userRole={userRole}
        setUserRole={(role) => {
          setUserRole(role);
          setUserProfile(prev => ({ ...prev, role }));
        }}
      />

      {/* Main Content Pane - Scrollable Right */}
      <div className="flex-1 min-w-0 pl-64 flex flex-col h-screen">
        {/* Navbar */}
        <Navbar 
          title={tabTitles[activeTab]?.title || "Land Acquisition Portal"}
          subtitle={tabTitles[activeTab]?.subtitle || "SLA Clearance Monitor"}
          alerts={alerts}
          userProfile={userProfile}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          onSearch={(term) => setGlobalSearchTerm(term)}
          setActiveTab={setActiveTab}
          onViewParcel={triggerViewParcelDetails}
        />

        {/* Inner Tab Contents wrapper */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-6 scrollbar-none">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">
                Syncing SLA Records Ledger...
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === "dashboard" && (
                <DashboardView 
                  projects={projects} 
                  parcels={parcels} 
                  alerts={alerts}
                  setActiveTab={setActiveTab}
                  onViewParcel={triggerViewParcelDetails}
                />
              )}
              {activeTab === "projects" && (
                <ProjectsView 
                  projects={projects}
                  onAddProject={handleAddProject}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleWithDeleteProject}
                />
              )}
              {activeTab === "parcels" && (
                <ParcelsView 
                  parcels={parcels}
                  projects={projects}
                  alerts={alerts}
                  onAddParcel={handleAddParcel}
                  onUpdateParcel={handleUpdateParcel}
                  onDeleteParcel={handleWithDeleteParcel}
                  activeParcelId={activeParcelId}
                  setActiveParcelId={setActiveParcelId}
                />
              )}
              {activeTab === "compensation" && (
                <CompensationView 
                  parcels={parcels}
                  onUpdateParcel={handleUpdateParcel}
                />
              )}
              {activeTab === "documents" && (
                <DocumentsView />
              )}
              {activeTab === "predict-delay" && (
                <PredictionsView />
              )}
              {activeTab === "predict-cost" && (
                <PredictionsView />
              )}
              {activeTab === "predict-legal" && (
                <PredictionsView />
              )}
              {activeTab === "alerts" && (
                <AlertsView 
                  alerts={alerts}
                  onResolveAlert={handleResolveAlert}
                  onViewParcel={triggerViewParcelDetails}
                />
              )}
              {activeTab === "analytics" && (
                <AnalyticsView 
                  parcels={parcels}
                  projects={projects}
                />
              )}
              {activeTab === "reports" && (
                <ReportsView 
                  projects={projects}
                  parcels={parcels}
                />
              )}
              {activeTab === "settings" && (
                <SettingsView onRefreshData={loadAllData} />
              )}
              {activeTab === "users" && (
                <UsersView />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Elegant Custom Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border animate-slide-up flex items-center gap-3 max-w-sm ${
          toast.type === "success" 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0" />
          )}
          <span className="text-xs font-bold leading-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
