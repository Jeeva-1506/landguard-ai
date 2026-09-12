import { Project, LandParcel, Alert, DocumentAnalysis } from "./types";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType || !contentType.includes("application/json")) {
    throw new Error("Failed to fetch projects JSON");
  }
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
  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType || !contentType.includes("application/json")) {
    throw new Error("Failed to fetch parcels JSON");
  }
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
  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType || !contentType.includes("application/json")) {
    throw new Error("Failed to fetch alerts JSON");
  }
  return res.json();
}

export async function resolveAlert(id: string): Promise<Alert> {
  const res = await fetch(`/api/alerts/${id}/resolve`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

export async function markAlertRead(id: string): Promise<Alert> {
  const res = await fetch(`/api/alerts/${id}/read`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark alert as read");
  return res.json();
}

export async function updateNotificationPreferences(preferences: any): Promise<any> {
  const res = await fetch("/api/auth/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences)
  });
  if (!res.ok) throw new Error("Failed to update notification preferences");
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

// AI Chatbot APIs (/api/chat)
export async function sendChatMessage(payload: {
  message: string;
  projectId?: string | null;
  userId?: string;
  userRole?: string;
  language?: "en" | "ta";
}): Promise<any> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
}

export async function fetchChatHistory(userId?: string): Promise<any> {
  const url = userId ? `/api/chat/history?userId=${encodeURIComponent(userId)}` : "/api/chat/history";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch chat history");
  return res.json();
}

export async function clearChatHistory(userId?: string): Promise<any> {
  const res = await fetch("/api/chat/clear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error("Failed to clear chat history");
  return res.json();
}

export async function trainMLModel(): Promise<any> {
  const res = await fetch("/api/train-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to train ML model");
  return res.json();
}

// Notification Prototype APIs (/api/notifications)
export async function fetchNotificationConfig(): Promise<any> {
  const res = await fetch("/api/notifications/config");
  if (!res.ok) throw new Error("Failed to fetch notification configuration");
  return res.json();
}

export async function sendPrototypeTestNotification(): Promise<any> {
  const res = await fetch("/api/notifications/test-send", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to send test notification");
  return res.json();
}

export async function fetchNotificationHistory(): Promise<any> {
  const res = await fetch("/api/notifications/history");
  if (!res.ok) throw new Error("Failed to fetch notification history");
  return res.json();
}

export async function sendLandRiskAlert(payload: {
  recipientEmail?: string;
  landId?: string;
  surveyNumber?: string;
  landRiskDetails?: any;
}): Promise<any> {
  const res = await fetch("/api/notifications/send-land-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || "Failed to send land risk alert email");
  }
  return data;
}

export async function sendTestHighRiskEmailAlert(landRecordId?: string): Promise<any> {
  const res = await fetch("/api/alerts/test-high-risk-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landRecordId })
  });
  if (!res.ok) throw new Error("Failed to trigger test high risk email alert");
  return res.json();
}

export async function sendReportPdfEmail(payload: {
  recipientEmail?: string;
  templateId?: string;
  title: string;
  date?: string;
  meta?: Record<string, any>;
  metrics?: Array<{ label: string; value: string }>;
  bodyText?: string;
}): Promise<any> {
  const res = await fetch("/api/reports/send-email-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || "Failed to send PDF report email");
  }
  return data;
}



