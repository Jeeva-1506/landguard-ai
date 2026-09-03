import React, { useState, useEffect } from "react";
import Navbar, { UserProfileData } from "./components/Navbar";
import Footer from "./components/Footer";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import ParcelsView from "./components/ParcelsView";
import DelayForecastView from "./components/DelayForecastView";
import DocumentsView from "./components/DocumentsView";
import ObjectionsView from "./components/ObjectionsView";
import CompensationView from "./components/CompensationView";
import GisMap from "./components/GisMap";
import AlertsView from "./components/AlertsView";
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

  // User Profile State with LocalStorage Persistence
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem("landtrack_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error(err);
    }
    return {
      name: "J. Selvam",
      title: "Project Director (Land Acquisition)",
      role: "Administrator",
      department: "Infrastructure Monitoring Directorate",
      district: "All Tamil Nadu Corridors",
      email: "j.selvam@landtrack.gov.in",
      phone: "+91 94440 12345",
      initials: "JS"
    };
  });

  // Custom Toast Notification State
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
      setError("Operating in offline fallback mode.");
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
      showToast(`Project ${newProj.id} registered.`);
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
      showToast(`Parcel ${newParcel.id} registered.`);
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
      showToast(`Parcel ${id} updated.`);
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error(err);
      showToast("Failed to update parcel.", "error");
    }
  };

  const handleWithDeleteParcel = async (id: string) => {
    try {
      await deleteParcel(id);
      setParcels(prev => prev.filter(p => p.id !== id));
      showToast(`Parcel ${id} removed.`);
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
      showToast("Early warning resolved.");
    } catch (err) {
      console.error(err);
      showToast("Failed to resolve alert.", "error");
    }
  };

  // Helper: jump directly to parcel profile
  const triggerViewParcelDetails = (parcelId: string) => {
    setActiveParcelId(parcelId);
    setActiveTab("parcels");
  };

  const handleUpdateUserProfile = (updated: UserProfileData) => {
    setUserProfile(updated);
    try {
      localStorage.setItem("landtrack_user_profile", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast("Profile updated successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "parcels") setActiveParcelId(null);
        }}
        alerts={alerts}
        userProfile={userProfile}
        userRole={userRole}
        setUserRole={(role) => {
          setUserRole(role);
          const updated = { ...userProfile, role };
          setUserProfile(updated);
          localStorage.setItem("landtrack_user_profile", JSON.stringify(updated));
        }}
        onUpdateProfile={handleUpdateUserProfile}
        onSearch={(term) => setGlobalSearchTerm(term)}
        globalSearchTerm={globalSearchTerm}
        onViewParcel={triggerViewParcelDetails}
        projects={projects}
        parcels={parcels}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-3">
              Syncing LANDTRACK Predictive Analytics Engine...
            </p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
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
                globalSearchTerm={globalSearchTerm}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleWithDeleteProject}
                showToast={showToast}
              />
            )}

            {activeTab === "parcels" && (
              <ParcelsView 
                parcels={parcels}
                projects={projects}
                alerts={alerts}
                globalSearchTerm={globalSearchTerm}
                onAddParcel={handleAddParcel}
                onUpdateParcel={handleUpdateParcel}
                onDeleteParcel={handleWithDeleteParcel}
                activeParcelId={activeParcelId}
                setActiveParcelId={setActiveParcelId}
                showToast={showToast}
              />
            )}

            {activeTab === "predict-delay" && (
              <DelayForecastView showToast={showToast} />
            )}

            {activeTab === "documents" && (
              <DocumentsView onUpdateParcel={handleUpdateParcel} showToast={showToast} />
            )}

            {activeTab === "objections" && (
              <ObjectionsView showToast={showToast} />
            )}

            {activeTab === "compensation" && (
              <CompensationView 
                parcels={parcels}
                globalSearchTerm={globalSearchTerm}
                onUpdateParcel={handleUpdateParcel}
                showToast={showToast}
              />
            )}

            {activeTab === "map" && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <h3 className="font-bold text-slate-900 text-sm">Geographic Risk Map</h3>
                  <p className="text-xs text-slate-500">Spatial distribution of land acquisition corridors & survey boundaries by risk tier.</p>
                </div>
                <GisMap projects={projects} parcels={parcels} onViewParcel={triggerViewParcelDetails} />
              </div>
            )}

            {activeTab === "alerts" && (
              <AlertsView 
                alerts={alerts}
                globalSearchTerm={globalSearchTerm}
                onResolveAlert={handleResolveAlert}
                onViewParcel={triggerViewParcelDetails}
                showToast={showToast}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView 
                projects={projects}
                parcels={parcels}
                showToast={showToast}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView onRefreshData={loadAllData} showToast={showToast} />
            )}

            {activeTab === "users" && (
              <UsersView showToast={showToast} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border animate-slide-up flex items-center gap-3 max-w-sm ${
          toast.type === "success" 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-red-600 border-red-500 text-white"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
          )}
          <span className="text-xs font-bold leading-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
