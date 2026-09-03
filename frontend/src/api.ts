import { Project, LandParcel, Alert, DocumentAnalysis } from "./types";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function deleteProject(id: string): Promise<boolean> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
  return true;
}

export async function fetchParcels(): Promise<LandParcel[]> {
  const res = await fetch("/api/parcels");
  if (!res.ok) throw new Error("Failed to fetch parcels");
  return res.json();
}

export async function fetchParcelById(id: string): Promise<LandParcel> {
  const res = await fetch(`/api/parcels/${id}`);
  if (!res.ok) throw new Error("Failed to fetch parcel detail");
  return res.json();
}

export async function createParcel(parcel: Partial<LandParcel>): Promise<LandParcel> {
  const res = await fetch("/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parcel)
  });
  if (!res.ok) throw new Error("Failed to create parcel");
  return res.json();
}

export async function updateParcel(id: string, parcel: Partial<LandParcel>): Promise<LandParcel> {
  const res = await fetch(`/api/parcels/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parcel)
  });
  if (!res.ok) throw new Error("Failed to update parcel");
  return res.json();
}

export async function deleteParcel(id: string): Promise<boolean> {
  const res = await fetch(`/api/parcels/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete parcel");
  return true;
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function resolveAlert(id: string): Promise<Alert> {
  const res = await fetch(`/api/alerts/${id}/resolve`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentAnalysis[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function analyzeDocument(text: string, parcelId?: string, name?: string): Promise<DocumentAnalysis> {
  const res = await fetch("/api/analyze/document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, parcelId, name })
  });
  if (!res.ok) throw new Error("Failed to analyze document");
  return res.json();
}

export async function uploadDataset(csvContent: string, fileName: string): Promise<any> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csvContent, fileName })
  });
  if (!res.ok) throw new Error("Failed to upload dataset");
  return res.json();
}

export async function fetchAnalytics(): Promise<any> {
  const res = await fetch("/api/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics aggregates");
  return res.json();
}

export async function runManualPrediction(type: 'delay' | 'cost' | 'legal', inputs: any): Promise<any> {
  const res = await fetch(`/api/predict/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs)
  });
  if (!res.ok) throw new Error(`Failed to calculate ${type} risk`);
  return res.json();
}

// Specialized GIS Land Risk APIs (/api/lands)
export async function fetchLands(format?: string): Promise<any> {
  const url = format ? `/api/lands?format=${format}` : "/api/lands";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch lands");
  return res.json();
}

export async function fetchLandBySurveyNumber(surveyNumber: string): Promise<any> {
  const res = await fetch(`/api/lands/${encodeURIComponent(surveyNumber)}`);
  if (!res.ok) throw new Error("Failed to fetch land details");
  return res.json();
}

export async function fetchHighRiskLands(): Promise<any> {
  const res = await fetch("/api/lands/risk/high");
  if (!res.ok) throw new Error("Failed to fetch high-risk lands");
  return res.json();
}

export async function createLand(landData: any): Promise<any> {
  const res = await fetch("/api/lands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(landData)
  });
  if (!res.ok) throw new Error("Failed to create land parcel");
  return res.json();
}

export async function updateLand(surveyNumber: string, landData: any): Promise<any> {
  const res = await fetch(`/api/lands/${encodeURIComponent(surveyNumber)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(landData)
  });
  if (!res.ok) throw new Error("Failed to update land parcel");
  return res.json();
}

export async function deleteLand(surveyNumber: string): Promise<any> {
  const res = await fetch(`/api/lands/${encodeURIComponent(surveyNumber)}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete land parcel");
  return res.json();
}

export async function uploadLandCSV(csvContent: string): Promise<any> {
  const res = await fetch("/api/lands/upload-csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csvContent })
  });
  if (!res.ok) throw new Error("Failed to upload land CSV");
  return res.json();
}

