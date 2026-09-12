import { LandRecordModel } from "../models/LandRecord";
import { ProjectModel } from "../models/Project";
import { AlertModel } from "../models/Alert";
import { isDbConnected, getLegacySeedData } from "./dataHelper";

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp?: string;
  type?: "text" | "land_card" | "project_card" | "parcel_list" | "stage_info" | "error";
  data?: any;
  actions?: any[];
}

export interface ChatRequestPayload {
  message: string;
  projectId?: string | null;
  userId?: string;
  userRole?: string;
  language?: "en" | "ta";
}

export async function processChatMessage(payload: ChatRequestPayload): Promise<ChatMessage> {
  const rawMsg = payload.message || "";
  const query = rawMsg.replace(/[*#_~`•]/g, ' ').trim().toLowerCase();

  let parcels: any[] = [];
  let projects: any[] = [];
  let alerts: any[] = [];

  try {
    if (isDbConnected()) {
      parcels = await LandRecordModel.find().lean();
      projects = await ProjectModel.find().lean();
      alerts = await AlertModel.find({ status: { $ne: "Resolved" } }).lean();
    } else {
      const seed = getLegacySeedData();
      parcels = seed.parcels || seed.landParcels || [];
      projects = seed.projects || [];
      alerts = seed.alerts || [];
    }
  } catch (err) {
    console.warn("[ChatService] Database query error, using fallback seed data:", err);
    const seed = getLegacySeedData();
    parcels = seed.parcels || seed.landParcels || [];
    projects = seed.projects || [];
    alerts = seed.alerts || [];
  }

  // 1. Survey Number query (e.g. 124/2, 125/3, 126/4, LA1024, survey 124/2)
  const surveyMatch = rawMsg.match(/(?:survey|sn|s\.n|no\.?|parcel)?\s*#?\s*([0-9]{3}\/[0-9]{1,2}|la[0-9]{4})/i);
  if (surveyMatch) {
    const matchedNo = surveyMatch[1].toUpperCase();
    const parcel = parcels.find(
      (p) =>
        (p.surveyNumber && p.surveyNumber.toUpperCase() === matchedNo) ||
        (p.id && p.id.toUpperCase() === matchedNo)
    );

    if (parcel) {
      return {
        sender: "ai",
        text: `FACT: Survey #${parcel.surveyNumber || parcel.id} is registered under owner "${parcel.ownerName || 'N/A'}" in ${parcel.district}.\n\nPREDICTION: Delay Risk is ${parcel.riskLevel || 'Low'} (${parcel.delayProbability || 20}%) with expected delay of ${parcel.predictedDelayDays || 30} days.\n\nRECOMMENDATION: ${parcel.recommendedAction || 'Proceed with standard 3A/3D notification publication.'}`,
        type: "land_card",
        data: {
          surveyNumber: parcel.surveyNumber,
          parcelId: parcel.id,
          ownerName: parcel.ownerName,
          district: parcel.district,
          area: `${parcel.landArea} Acres`,
          stage: parcel.acquisitionStage,
          riskLevel: parcel.riskLevel,
          riskScore: parcel.delayProbability,
          compensationStatus: parcel.compensationStatus,
          compensationAmount: parcel.compensationAmount ? `₹${(parcel.compensationAmount / 100000).toFixed(2)} Lakhs` : "Pending Valuation",
          latitude: parcel.latitude,
          longitude: parcel.longitude
        },
        actions: [
          { label: "🗺️ Focus on GIS Map", type: "OPEN_GIS", surveyNumber: parcel.surveyNumber }
        ]
      };
    }
  }

  // 2. High Risk Query
  if (query.includes("high risk") || query.includes("risk") || query.includes("delay risk")) {
    const highRiskParcels = parcels.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical");
    return {
      sender: "ai",
      text: `FACT: Found ${highRiskParcels.length} high-risk land parcels across current projects.\n\nPREDICTION: Combined delay probability for these parcels exceeds 75% due to active court injunctions or title disputes.\n\nRECOMMENDATION: Prioritize legal hearing resolution for survey numbers: ${highRiskParcels.map(p => p.surveyNumber || p.id).join(", ")}.`,
      type: "parcel_list",
      data: { count: highRiskParcels.length, parcels: highRiskParcels.slice(0, 5) }
    };
  }

  // 3. Compensation Query
  if (query.includes("compensation") || query.includes("pending payment") || query.includes("paid")) {
    const pendingCount = parcels.filter(p => p.compensationStatus === "Pending" || p.compensationStatus === "Disputed").length;
    const totalPendingAmt = parcels.filter(p => p.compensationStatus === "Pending" || p.compensationStatus === "Disputed").reduce((acc, p) => acc + (p.compensationAmount || 0), 0);

    return {
      sender: "ai",
      text: `FACT: ${pendingCount} land parcels currently have pending/disputed compensation.\n\nPREDICTION: Financial cost exposure is estimated at ₹${(totalPendingAmt / 10000000).toFixed(2)} Crores.\n\nRECOMMENDATION: Convene District Compensation Committee tribunal to expedite 3G awards.`,
      type: "text"
    };
  }

  // 4. Default Assistant Answer
  return {
    sender: "ai",
    text: `FACT: System monitoring ${projects.length} national infrastructure projects and ${parcels.length} verified land records.\n\nPREDICTION: Overall corridor acquisition progress is currently at 65% on schedule.\n\nRECOMMENDATION: You can query specific survey numbers (e.g. 'survey 124/2'), check high-risk parcels, or view GIS map boundaries.`,
    actions: [
      { label: "🔍 Search Survey Number", type: "SEARCH_SURVEY" },
      { label: "⚠️ High Risk Lands", type: "SHOW_HIGH_RISK" },
      { label: "🗺️ Open GIS Map", type: "OPEN_GIS" }
    ]
  };
}
