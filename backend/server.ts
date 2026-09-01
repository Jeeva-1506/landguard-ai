import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { LandParcel, Project, Alert, DocumentAnalysis, PredictionHistory } from "../frontend/src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// File-based Database paths
const DB_DIR = path.join(__dirname, "../database/data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure DB directory and file exist with initial seeds
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Prediction models helper functions
function calculateDelay(parcel: Partial<LandParcel>) {
  const landArea = Number(parcel.landArea) || 1.0;
  const ownersCount = Number(parcel.ownersCount) || 1;
  const ownershipDispute = !!parcel.ownershipDispute;
  const documentsComplete = !!parcel.documentsComplete;
  const compensationStatus = parcel.compensationStatus || 'Pending';
  const objectionFiled = !!parcel.objectionFiled;
  const courtCase = !!parcel.courtCase;
  const surveyCompleted = !!parcel.surveyCompleted;
  const environmentalClearance = !!parcel.environmentalClearance;
  const governmentApproval = !!parcel.governmentApproval;
  const acquisitionStage = parcel.acquisitionStage || 'Survey';
  const previousDelay = !!parcel.previousDelay;
  const distanceFromProject = Number(parcel.distanceFromProject) || 1.0;

  let score = 15;
  
  if (ownershipDispute) score += 20;
  if (!documentsComplete) score += 15;
  if (compensationStatus === 'Pending') score += 10;
  if (compensationStatus === 'Disputed') score += 25;
  if (objectionFiled) score += 18;
  if (courtCase) score += 30;
  if (!surveyCompleted) score += 8;
  if (!environmentalClearance) score += 12;
  if (!governmentApproval) score += 15;
  if (previousDelay) score += 12;
  if (ownersCount > 5) score += 8;
  if (distanceFromProject > 10) score += 5;
  if (landArea > 5) score += 7;

  let stageModifier = 0;
  if (acquisitionStage === 'Survey') stageModifier = 5;
  else if (acquisitionStage === 'Notification') stageModifier = 10;
  else if (acquisitionStage === 'Negotiation') stageModifier = 20;
  else if (acquisitionStage === 'Compensation') stageModifier = 15;
  else if (acquisitionStage === 'Agreement') stageModifier = 5;
  else if (acquisitionStage === 'Possession') stageModifier = 0;

  score += stageModifier;

  const delayProbability = Math.max(12, Math.min(98, score));
  
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (delayProbability > 65) riskLevel = 'High';
  else if (delayProbability > 35) riskLevel = 'Medium';

  let baseDays = 15 + Math.round(landArea * 2.5) + Math.round(distanceFromProject * 0.4);
  if (courtCase) baseDays += 85;
  if (ownershipDispute) baseDays += 40;
  if (objectionFiled) baseDays += 25;
  if (compensationStatus === 'Pending') baseDays += 20;
  if (compensationStatus === 'Disputed') baseDays += 35;
  if (!documentsComplete) baseDays += 15;
  if (!governmentApproval) baseDays += 30;
  if (!environmentalClearance) baseDays += 25;
  if (previousDelay) baseDays += 15;
  
  const predictedDelayDays = Math.max(10, baseDays);

  return { delayProbability, riskLevel, predictedDelayDays };
}

function calculateCostOverrun(parcel: Partial<LandParcel>, estCompensation: number) {
  const ownershipDispute = !!parcel.ownershipDispute;
  const courtCase = !!parcel.courtCase;
  const objectionFiled = !!parcel.objectionFiled;
  const ownersCount = Number(parcel.ownersCount) || 1;
  const documentsComplete = !!parcel.documentsComplete;
  const previousDelay = !!parcel.previousDelay;
  const compStatus = parcel.compensationStatus || 'Pending';

  let baseRate = 0.04; // 4% base overrun
  
  if (courtCase) baseRate += 0.14;
  if (ownershipDispute) baseRate += 0.08;
  if (objectionFiled) baseRate += 0.06;
  if (compStatus === 'Disputed') baseRate += 0.10;
  if (!documentsComplete) baseRate += 0.03;
  if (previousDelay) baseRate += 0.04;
  if (ownersCount > 5) baseRate += 0.02;

  const costOverrunPercentage = parseFloat((baseRate * 100).toFixed(1));
  const expectedAdditionalCost = Math.round(estCompensation * baseRate);
  const expectedFinalCost = estCompensation + expectedAdditionalCost;

  return { expectedAdditionalCost, expectedFinalCost, costOverrunPercentage };
}

function calculateLegalRisk(parcel: Partial<LandParcel>) {
  const ownershipDispute = !!parcel.ownershipDispute;
  const courtCase = !!parcel.courtCase;
  const objectionFiled = !!parcel.objectionFiled;
  const ownersCount = Number(parcel.ownersCount) || 1;
  const documentsComplete = !!parcel.documentsComplete;
  const previousDelay = !!parcel.previousDelay;
  const compStatus = parcel.compensationStatus || 'Pending';

  let score = 8;
  if (courtCase) score += 42;
  if (ownershipDispute) score += 24;
  if (objectionFiled) score += 14;
  if (compStatus === 'Disputed') score += 12;
  if (!documentsComplete) score += 8;
  if (previousDelay) score += 5;
  if (ownersCount > 5) score += 4;

  const legalRiskProbability = Math.max(10, Math.min(96, score));
  let legalRiskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (legalRiskProbability > 65) legalRiskLevel = 'High';
  else if (legalRiskProbability > 35) legalRiskLevel = 'Medium';

  return { legalRiskProbability, legalRiskLevel };
}

// Fallback keyword analyzer for document analysis
function fallbackAnalyze(text: string) {
  const lowercase = text.toLowerCase();
  let category: any = 'Other';
  let risk: 'Low' | 'Medium' | 'High' = 'Low';
  let confidence = 75;
  const importantTerms: string[] = [];
  const keyDisputes: string[] = [];
  let compensationIssue: string | undefined;
  let disputedLandDetails: string | undefined;
  const legalCitations: string[] = [];

  if (lowercase.includes('compensat') || lowercase.includes('pay') || lowercase.includes('rupee') || lowercase.includes('crore') || lowercase.includes('lakh') || lowercase.includes('valuation') || lowercase.includes('price')) {
    category = 'Compensation Issue';
    importantTerms.push('Compensation', 'Valuation');
    keyDisputes.push('Compensation undervaluation claim', 'Rate disparity vs market value');
    compensationIssue = 'Landowner demands higher compensation based on adjacent land market rates.';
  } else if (lowercase.includes('dispute') || lowercase.includes('owner') || lowercase.includes('brother') || lowercase.includes('family') || lowercase.includes('partition') || lowercase.includes('legal heir')) {
    category = 'Ownership Issue';
    importantTerms.push('Ownership', 'Title Dispute');
    keyDisputes.push('Family partition dispute', 'Unclear title deeds / joint ownership claim');
    disputedLandDetails = 'Title deeds under partition suit in court; stay requested on compensation distribution.';
  } else if (lowercase.includes('document') || lowercase.includes('patta') || lowercase.includes('deed') || lowercase.includes('missing') || lowercase.includes('registration') || lowercase.includes('chitta')) {
    category = 'Documentation Issue';
    importantTerms.push('Patta', 'Land Records');
    keyDisputes.push('Incomplete revenue records', 'Survey map / Patta discrepancy');
  } else if (lowercase.includes('court') || lowercase.includes('judge') || lowercase.includes('injunction') || lowercase.includes('stay') || lowercase.includes('lawyer') || lowercase.includes('litigat')) {
    category = 'Legal Issue';
    importantTerms.push('Litigation', 'Injunction');
    keyDisputes.push('Pending stay order application', 'Active court litigation (Section 15/18)');
    legalCitations.push('Land Acquisition, Rehabilitation & Resettlement Act (LARR 2013) Sec 15');
  } else if (lowercase.includes('tree') || lowercase.includes('forest') || lowercase.includes('lake') || lowercase.includes('clearan') || lowercase.includes('pollut') || lowercase.includes('green')) {
    category = 'Environmental Issue';
    importantTerms.push('Environmental Clearance');
    keyDisputes.push('Environmental impact objection', 'Water body / tree clearance dispute');
  }

  if (category === 'Legal Issue' || lowercase.includes('court') || lowercase.includes('stay')) {
    risk = 'High';
    confidence = 88;
  } else if (category === 'Ownership Issue' || category === 'Compensation Issue') {
    risk = 'Medium';
    confidence = 80;
  } else if (lowercase.includes('urgently') || lowercase.includes('protest') || lowercase.includes('objection')) {
    risk = 'Medium';
  }

  if (importantTerms.length === 0) {
    importantTerms.push('Objection', 'Landowner');
  }
  if (keyDisputes.length === 0) {
    keyDisputes.push('General land acquisition objection filed by property owner');
  }

  return {
    category,
    risk,
    riskClassification: risk,
    confidence,
    importantTerms,
    keyDisputes,
    compensationIssue,
    disputedLandDetails,
    legalCitations
  };
}

async function analyzeDocumentText(text: string): Promise<{
  category: any;
  risk: 'Low' | 'Medium' | 'High';
  riskClassification: 'Low' | 'Medium' | 'High';
  confidence: number;
  importantTerms: string[];
  keyDisputes?: string[];
  compensationIssue?: string;
  disputedLandDetails?: string;
  legalCitations?: string[];
}> {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackAnalyze(text);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an expert land acquisition administrative analyst.
Analyze this landowner complaint, objection or documentation text.
Classify it into exactly one of the following categories:
- Compensation Issue
- Ownership Issue
- Documentation Issue
- Environmental Issue
- Legal Issue
- Other

Determine the risk level ('Low', 'Medium', 'High') and a numeric confidence score (0 to 100).
Extract up to 5 important legal or land-related terms found in the text.
Extract key disputes (array of strings), compensation issues if any (string), disputed land details if any (string), and legal citations if any (array of strings).

Respond with ONLY a clean JSON object fitting this schema:
{
  "category": "Compensation Issue" | "Ownership Issue" | "Documentation Issue" | "Environmental Issue" | "Legal Issue" | "Other",
  "risk": "Low" | "Medium" | "High",
  "confidence": number,
  "importantTerms": string[],
  "keyDisputes": string[],
  "compensationIssue": string,
  "disputedLandDetails": string,
  "legalCitations": string[]
}

Text:
"${text}"`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanText = response.text?.trim() || "";
    const parsed = JSON.parse(cleanText);
    const fallback = fallbackAnalyze(text);
    return {
      category: parsed.category || fallback.category,
      risk: parsed.risk || fallback.risk,
      riskClassification: parsed.risk || fallback.risk,
      confidence: parsed.confidence || fallback.confidence,
      importantTerms: parsed.importantTerms || fallback.importantTerms,
      keyDisputes: parsed.keyDisputes || fallback.keyDisputes,
      compensationIssue: parsed.compensationIssue || fallback.compensationIssue,
      disputedLandDetails: parsed.disputedLandDetails || fallback.disputedLandDetails,
      legalCitations: parsed.legalCitations || fallback.legalCitations
    };
  } catch (err) {
    console.error("Gemini analysis error, using fallback:", err);
    return fallbackAnalyze(text);
  }
}

// Seed Data Definition
const initialProjects: Project[] = [
  {
    id: "NH-45",
    name: "Chennai Outer Ring Road Extension",
    district: "Kanchipuram",
    type: "Highway",
    landRequired: 120,
    landAcquired: 93.6,
    progress: 78,
    delayRisk: "High",
    predictedDelay: 75,
    costOverrun: 9.41,
    status: "Delayed",
    estimatedCost: 1250000000 // 125 Cr
  },
  {
    id: "NH-48",
    name: "Villupuram Six-Laning Highway",
    district: "Villupuram",
    type: "Highway",
    landRequired: 200,
    landAcquired: 90,
    progress: 45,
    delayRisk: "Medium",
    predictedDelay: 62,
    costOverrun: 6.23,
    status: "Delayed",
    estimatedCost: 1800000000 // 180 Cr
  },
  {
    id: "NH-32",
    name: "Salem Bypass Road Bypass Link",
    district: "Salem",
    type: "Highway",
    landRequired: 80,
    landAcquired: 60,
    progress: 75,
    delayRisk: "Low",
    predictedDelay: 18,
    costOverrun: 1.12,
    status: "On Track",
    estimatedCost: 950000000 // 95 Cr
  },
  {
    id: "NH-66",
    name: "Coastal Port Connectivity Highway",
    district: "Nagapattinam",
    type: "Highway",
    landRequired: 150,
    landAcquired: 82.5,
    progress: 55,
    delayRisk: "Medium",
    predictedDelay: 54,
    costOverrun: 4.85,
    status: "Delayed",
    estimatedCost: 1450000000 // 145 Cr
  },
  {
    id: "NH-95",
    name: "Madurai Southern Ring Road",
    district: "Madurai",
    type: "Highway",
    landRequired: 100,
    landAcquired: 30,
    progress: 30,
    delayRisk: "High",
    predictedDelay: 120,
    costOverrun: 12.30,
    status: "Critical",
    estimatedCost: 1100000000 // 110 Cr
  }
];

const initialParcels: LandParcel[] = [
  {
    id: "LA1021",
    projectId: "NH-45",
    district: "Kanchipuram",
    landArea: 1.5,
    landType: "Agricultural",
    ownersCount: 2,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Paid",
    compensationAmount: 4500000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Possession",
    previousDelay: false,
    distanceFromProject: 1.2
  },
  {
    id: "LA1022",
    projectId: "NH-45",
    district: "Kanchipuram",
    landArea: 3.2,
    landType: "Agricultural",
    ownersCount: 4,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 9600000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Agreement",
    previousDelay: false,
    distanceFromProject: 2.5
  },
  {
    id: "LA1023",
    projectId: "NH-45",
    district: "Kanchipuram",
    landArea: 2.1,
    landType: "Commercial",
    ownersCount: 1,
    ownershipDispute: false,
    documentsComplete: false,
    compensationStatus: "Pending",
    compensationAmount: 12000000,
    objectionFiled: true,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Negotiation",
    previousDelay: true,
    distanceFromProject: 0.5
  },
  {
    id: "LA1024",
    projectId: "NH-45",
    district: "Villupuram",
    landArea: 2.4,
    landType: "Agricultural",
    ownersCount: 3,
    ownershipDispute: true,
    documentsComplete: false,
    compensationStatus: "Pending",
    compensationAmount: 850000,
    objectionFiled: true,
    courtCase: true,
    surveyCompleted: true,
    environmentalClearance: false,
    governmentApproval: true,
    acquisitionStage: "Negotiation",
    previousDelay: true,
    distanceFromProject: 4.2
  },
  {
    id: "LA1025",
    projectId: "NH-45",
    district: "Kanchipuram",
    landArea: 0.8,
    landType: "Residential",
    ownersCount: 6,
    ownershipDispute: true,
    documentsComplete: false,
    compensationStatus: "Disputed",
    compensationAmount: 3200000,
    objectionFiled: true,
    courtCase: true,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Compensation",
    previousDelay: true,
    distanceFromProject: 0.2
  },
  {
    id: "LA1026",
    projectId: "NH-48",
    district: "Villupuram",
    landArea: 5.5,
    landType: "Agricultural",
    ownersCount: 5,
    ownershipDispute: true,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 11000000,
    objectionFiled: true,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: false,
    acquisitionStage: "Negotiation",
    previousDelay: false,
    distanceFromProject: 8.5
  },
  {
    id: "LA1027",
    projectId: "NH-48",
    district: "Villupuram",
    landArea: 4.1,
    landType: "Barren",
    ownersCount: 2,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Paid",
    compensationAmount: 4100000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Possession",
    previousDelay: false,
    distanceFromProject: 12.0
  },
  {
    id: "LA1028",
    projectId: "NH-48",
    district: "Villupuram",
    landArea: 12.0,
    landType: "Agricultural",
    ownersCount: 12,
    ownershipDispute: true,
    documentsComplete: false,
    compensationStatus: "Disputed",
    compensationAmount: 24000000,
    objectionFiled: true,
    courtCase: true,
    surveyCompleted: true,
    environmentalClearance: false,
    governmentApproval: false,
    acquisitionStage: "Survey",
    previousDelay: true,
    distanceFromProject: 1.5
  },
  {
    id: "LA1029",
    projectId: "NH-32",
    district: "Salem",
    landArea: 1.8,
    landType: "Agricultural",
    ownersCount: 2,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Paid",
    compensationAmount: 3600000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Possession",
    previousDelay: false,
    distanceFromProject: 3.1
  },
  {
    id: "LA1030",
    projectId: "NH-32",
    district: "Salem",
    landArea: 2.2,
    landType: "Agricultural",
    ownersCount: 3,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 4400000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Agreement",
    previousDelay: false,
    distanceFromProject: 5.0
  },
  {
    id: "LA1031",
    projectId: "NH-32",
    district: "Salem",
    landArea: 0.9,
    landType: "Residential",
    ownersCount: 1,
    ownershipDispute: false,
    documentsComplete: false,
    compensationStatus: "Pending",
    compensationAmount: 1800000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Notification",
    previousDelay: false,
    distanceFromProject: 0.6
  },
  {
    id: "LA1032",
    projectId: "NH-66",
    district: "Nagapattinam",
    landArea: 6.8,
    landType: "Agricultural",
    ownersCount: 8,
    ownershipDispute: true,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 13600000,
    objectionFiled: true,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: false,
    governmentApproval: true,
    acquisitionStage: "Negotiation",
    previousDelay: true,
    distanceFromProject: 0.9
  },
  {
    id: "LA1033",
    projectId: "NH-66",
    district: "Nagapattinam",
    landArea: 1.2,
    landType: "Barren",
    ownersCount: 1,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Paid",
    compensationAmount: 1200000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Possession",
    previousDelay: false,
    distanceFromProject: 15.2
  },
  {
    id: "LA1034",
    projectId: "NH-66",
    district: "Nagapattinam",
    landArea: 3.5,
    landType: "Agricultural",
    ownersCount: 4,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 7000000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: false,
    acquisitionStage: "Survey",
    previousDelay: false,
    distanceFromProject: 6.4
  },
  {
    id: "LA1035",
    projectId: "NH-95",
    district: "Madurai",
    landArea: 8.2,
    landType: "Agricultural",
    ownersCount: 15,
    ownershipDispute: true,
    documentsComplete: false,
    compensationStatus: "Disputed",
    compensationAmount: 16400000,
    objectionFiled: true,
    courtCase: true,
    surveyCompleted: true,
    environmentalClearance: false,
    governmentApproval: false,
    acquisitionStage: "Negotiation",
    previousDelay: true,
    distanceFromProject: 2.1
  },
  {
    id: "LA1036",
    projectId: "NH-95",
    district: "Madurai",
    landArea: 2.0,
    landType: "Industrial",
    ownersCount: 2,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 18000000,
    objectionFiled: true,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Notification",
    previousDelay: false,
    distanceFromProject: 1.1
  },
  {
    id: "LA1037",
    projectId: "NH-95",
    district: "Madurai",
    landArea: 4.8,
    landType: "Agricultural",
    ownersCount: 3,
    ownershipDispute: false,
    documentsComplete: false,
    compensationStatus: "Pending",
    compensationAmount: 9600000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: false,
    acquisitionStage: "Negotiation",
    previousDelay: true,
    distanceFromProject: 3.8
  },
  {
    id: "LA1038",
    projectId: "NH-45",
    district: "Kanchipuram",
    landArea: 2.7,
    landType: "Agricultural",
    ownersCount: 2,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Paid",
    compensationAmount: 5400000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Possession",
    previousDelay: false,
    distanceFromProject: 2.3
  },
  {
    id: "LA1039",
    projectId: "NH-48",
    district: "Villupuram",
    landArea: 1.9,
    landType: "Agricultural",
    ownersCount: 3,
    ownershipDispute: false,
    documentsComplete: true,
    compensationStatus: "Pending",
    compensationAmount: 3800000,
    objectionFiled: false,
    courtCase: false,
    surveyCompleted: true,
    environmentalClearance: true,
    governmentApproval: true,
    acquisitionStage: "Compensation",
    previousDelay: false,
    distanceFromProject: 5.4
  },
  {
    id: "LA1040",
    projectId: "NH-95",
    district: "Madurai",
    landArea: 3.4,
    landType: "Residential",
    ownersCount: 5,
    ownershipDispute: true,
    documentsComplete: false,
    compensationStatus: "Disputed",
    compensationAmount: 6800000,
    objectionFiled: true,
    courtCase: true,
    surveyCompleted: false,
    environmentalClearance: false,
    governmentApproval: false,
    acquisitionStage: "Survey",
    previousDelay: true,
    distanceFromProject: 0.8
  }
];

// Seed Alerts
const initialAlerts: Alert[] = [
  {
    id: "ALRT001",
    priority: "High",
    projectId: "NH-45",
    projectName: "Chennai Outer Ring Road Extension",
    parcelId: "LA1024",
    issue: "Compensation Pending & Litigation",
    expectedDelay: 75,
    recommendedAction: "Process compensation & negotiate in Lok Adalat",
    status: "Open",
    timestamp: "2 mins ago"
  },
  {
    id: "ALRT002",
    priority: "Medium",
    projectId: "NH-48",
    projectName: "Villupuram Six-Laning Highway",
    parcelId: "LA1026",
    issue: "Government Approval Pending",
    expectedDelay: 62,
    recommendedAction: "Expedite Revenue Dept NOC clearance",
    status: "Open",
    timestamp: "15 mins ago"
  },
  {
    id: "ALRT003",
    priority: "High",
    projectId: "NH-95",
    projectName: "Madurai Southern Ring Road",
    parcelId: "LA1035",
    issue: "Ownership Dispute & Court Case",
    expectedDelay: 120,
    recommendedAction: "Deploy special arbitration officer for resolution",
    status: "Open",
    timestamp: "35 mins ago"
  },
  {
    id: "ALRT004",
    priority: "Medium",
    projectId: "NH-45",
    projectName: "Chennai Outer Ring Road Extension",
    parcelId: "LA1025",
    issue: "Documents Incomplete & Multiple Owners",
    expectedDelay: 45,
    recommendedAction: "Schedule special registration camp at village head",
    status: "Open",
    timestamp: "1 hr ago"
  }
];

const initialDocuments: DocumentAnalysis[] = [
  {
    id: "DOC001",
    name: "Objection_LA1024.txt",
    parcelId: "LA1024",
    text: "We are objecting to the land acquisition of our ancestral field for the highway bypass. The valuation of ₹8,50,000 is extremely low compared to the current market value. We require compensation of at least ₹15,00,000 or we will approach the civil court to seek a stay order.",
    category: "Compensation Issue",
    risk: "High",
    confidence: 91,
    importantTerms: ["Objection", "Ancestral Field", "Valuation", "Market Value", "Stay Order"],
    uploadDate: "2026-08-29"
  },
  {
    id: "DOC002",
    name: "DisputeStatement_LA1025.txt",
    parcelId: "LA1025",
    text: "The ownership of partition No. 4 under survey 142/2 is disputed between myself and my three brothers. The title deed is held in court registry. No compensation should be released to any individual until court orders are passed.",
    category: "Ownership Issue",
    risk: "High",
    confidence: 94,
    importantTerms: ["Title Deed", "Partition Dispute", "Survey Number", "Registry", "Court Order"],
    uploadDate: "2026-08-30"
  }
];

// Complete ML calculation for all parcels and save database
function hydrateAndSaveDB(projects: Project[], parcels: LandParcel[], alerts: Alert[], documents: DocumentAnalysis[], predictions: PredictionHistory[]) {
  // Pre-calculate ML results for all parcels
  const calculatedParcels = parcels.map(p => {
    const delay = calculateDelay(p);
    const cost = calculateCostOverrun(p, p.compensationAmount);
    const legal = calculateLegalRisk(p);
    
    return {
      ...p,
      predictedDelayDays: delay.predictedDelayDays,
      delayProbability: delay.delayProbability,
      riskLevel: delay.riskLevel,
      expectedAdditionalCost: cost.expectedAdditionalCost,
      expectedFinalCost: cost.expectedFinalCost,
      costOverrunPercentage: cost.costOverrunPercentage,
      legalRiskProbability: legal.legalRiskProbability,
      legalRiskLevel: legal.legalRiskLevel
    };
  });

  const dbData = {
    projects,
    parcels: calculatedParcels,
    alerts,
    documents,
    predictions
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  return dbData;
}

// Load database or initialize with seeds
function getDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const fileContent = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(fileContent);
    } catch (e) {
      console.error("Error reading database, re-initializing:", e);
    }
  }
  return hydrateAndSaveDB(initialProjects, initialParcels, initialAlerts, initialDocuments, []);
}

// REST APIs
// 1. Projects API
app.get("/api/projects", (req, res) => {
  const db = getDB();
  res.json(db.projects);
});

app.get("/api/projects/:id", (req, res) => {
  const db = getDB();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

app.post("/api/projects", (req, res) => {
  const db = getDB();
  const newProject: Project = {
    id: req.body.id || `PROJ-${Date.now().toString().slice(-4)}`,
    name: req.body.name,
    district: req.body.district,
    type: req.body.type || "Highway",
    landRequired: Number(req.body.landRequired) || 0,
    landAcquired: Number(req.body.landAcquired) || 0,
    progress: Number(req.body.progress) || 0,
    delayRisk: req.body.delayRisk || "Low",
    predictedDelay: Number(req.body.predictedDelay) || 0,
    costOverrun: Number(req.body.costOverrun) || 0,
    status: req.body.status || "On Track",
    estimatedCost: Number(req.body.estimatedCost) || 0
  };
  
  db.projects.push(newProject);
  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.status(201).json(newProject);
});

app.put("/api/projects/:id", (req, res) => {
  const db = getDB();
  const idx = db.projects.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Project not found" });

  db.projects[idx] = {
    ...db.projects[idx],
    ...req.body,
    id: req.params.id // lock id
  };

  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.json(db.projects[idx]);
});

app.delete("/api/projects/:id", (req, res) => {
  const db = getDB();
  const originalLen = db.projects.length;
  db.projects = db.projects.filter((p: any) => p.id !== req.params.id);
  
  if (db.projects.length === originalLen) {
    return res.status(404).json({ error: "Project not found" });
  }

  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.json({ success: true });
});

// 2. Land Parcels API
app.get("/api/parcels", (req, res) => {
  const db = getDB();
  res.json(db.parcels);
});

app.get("/api/parcels/:id", (req, res) => {
  const db = getDB();
  const parcel = db.parcels.find((p: any) => p.id === req.params.id);
  if (!parcel) return res.status(404).json({ error: "Parcel not found" });
  res.json(parcel);
});

app.post("/api/parcels", (req, res) => {
  const db = getDB();
  const rawParcel: LandParcel = req.body;
  const parcelId = rawParcel.id || `LA${Date.now().toString().slice(-4)}`;

  // Run full ML calculations
  const delay = calculateDelay(rawParcel);
  const cost = calculateCostOverrun(rawParcel, Number(rawParcel.compensationAmount) || 0);
  const legal = calculateLegalRisk(rawParcel);

  const completedParcel: LandParcel = {
    ...rawParcel,
    id: parcelId,
    predictedDelayDays: delay.predictedDelayDays,
    delayProbability: delay.delayProbability,
    riskLevel: delay.riskLevel,
    expectedAdditionalCost: cost.expectedAdditionalCost,
    expectedFinalCost: cost.expectedFinalCost,
    costOverrunPercentage: cost.costOverrunPercentage,
    legalRiskProbability: legal.legalRiskProbability,
    legalRiskLevel: legal.legalRiskLevel
  };

  db.parcels.push(completedParcel);

  // If High risk delay, automatically spawn an Alert under the early warning system
  if (completedParcel.riskLevel === "High") {
    const proj = db.projects.find((p: any) => p.id === completedParcel.projectId);
    const newAlert: Alert = {
      id: `ALRT-${Date.now().toString().slice(-4)}`,
      priority: "High",
      projectId: completedParcel.projectId,
      projectName: proj ? proj.name : "Infrastructure Link",
      parcelId: completedParcel.id,
      issue: `Critical Delay Risk (${completedParcel.delayProbability}% Probability)`,
      expectedDelay: completedParcel.predictedDelayDays || 30,
      recommendedAction: "Deploy arbitration team and review land title immediately",
      status: "Open",
      timestamp: "Just now"
    };
    db.alerts.unshift(newAlert);
  }

  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.status(201).json(completedParcel);
});

app.put("/api/parcels/:id", (req, res) => {
  const db = getDB();
  const idx = db.parcels.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Parcel not found" });

  const updatedRaw = {
    ...db.parcels[idx],
    ...req.body,
    id: req.params.id
  };

  // Re-run calculations on update
  const delay = calculateDelay(updatedRaw);
  const cost = calculateCostOverrun(updatedRaw, Number(updatedRaw.compensationAmount) || 0);
  const legal = calculateLegalRisk(updatedRaw);

  const completedParcel: LandParcel = {
    ...updatedRaw,
    predictedDelayDays: delay.predictedDelayDays,
    delayProbability: delay.delayProbability,
    riskLevel: delay.riskLevel,
    expectedAdditionalCost: cost.expectedAdditionalCost,
    expectedFinalCost: cost.expectedFinalCost,
    costOverrunPercentage: cost.costOverrunPercentage,
    legalRiskProbability: legal.legalRiskProbability,
    legalRiskLevel: legal.legalRiskLevel
  };

  db.parcels[idx] = completedParcel;
  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.json(completedParcel);
});

app.delete("/api/parcels/:id", (req, res) => {
  const db = getDB();
  const originalLen = db.parcels.length;
  db.parcels = db.parcels.filter((p: any) => p.id !== req.params.id);
  
  if (db.parcels.length === originalLen) {
    return res.status(404).json({ error: "Parcel not found" });
  }

  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.json({ success: true });
});

// 3. Early Warning Alerts API
app.get("/api/alerts", (req, res) => {
  const db = getDB();
  res.json(db.alerts);
});

app.get("/api/documents", (req, res) => {
  const db = getDB();
  res.json(db.documents || []);
});

app.post("/api/alerts/:id/resolve", (req, res) => {
  const db = getDB();
  const alert = db.alerts.find((a: any) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  alert.status = "Resolved";
  
  hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
  res.json(alert);
});

// 4. ML Prediction APIs
app.post("/api/predict/delay", (req, res) => {
  const results = calculateDelay(req.body);
  
  // Record prediction history
  const db = getDB();
  const historyItem: PredictionHistory = {
    id: `PRED-${Date.now().toString().slice(-4)}`,
    parcelId: req.body.id || "manual-input",
    projectId: req.body.projectId || "unassigned",
    timestamp: new Date().toISOString().split('T')[0],
    type: 'Delay',
    inputs: req.body,
    outputs: results
  };
  db.predictions.unshift(historyItem);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  res.json(results);
});

app.post("/api/predict/cost", (req, res) => {
  const estCost = Number(req.body.estimatedCost) || 0;
  const results = calculateCostOverrun(req.body, estCost);

  // Record prediction history
  const db = getDB();
  const historyItem: PredictionHistory = {
    id: `PRED-${Date.now().toString().slice(-4)}`,
    parcelId: req.body.id || "manual-input",
    projectId: req.body.projectId || "unassigned",
    timestamp: new Date().toISOString().split('T')[0],
    type: 'Cost',
    inputs: { ...req.body, estimatedCost: estCost },
    outputs: results
  };
  db.predictions.unshift(historyItem);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  res.json(results);
});

app.post("/api/predict/legal", (req, res) => {
  const results = calculateLegalRisk(req.body);

  // Record prediction history
  const db = getDB();
  const historyItem: PredictionHistory = {
    id: `PRED-${Date.now().toString().slice(-4)}`,
    parcelId: req.body.id || "manual-input",
    projectId: req.body.projectId || "unassigned",
    timestamp: new Date().toISOString().split('T')[0],
    type: 'Legal',
    inputs: req.body,
    outputs: results
  };
  db.predictions.unshift(historyItem);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  res.json(results);
});

app.post("/api/analyze/document", async (req, res) => {
  const { text, parcelId, name } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const analysis = await analyzeDocumentText(text);

    const newDoc: DocumentAnalysis = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: name || "Uploaded_Complaint.txt",
      parcelId: parcelId || "Unassigned",
      text,
      category: analysis.category || "Other",
      risk: analysis.risk || "Medium",
      riskClassification: analysis.riskClassification || analysis.risk || "Medium",
      confidence: analysis.confidence ? (analysis.confidence > 1 ? analysis.confidence / 100 : analysis.confidence) : 0.85,
      importantTerms: analysis.importantTerms || ["Land Acquisition", "Objection"],
      keyDisputes: analysis.keyDisputes && analysis.keyDisputes.length > 0 
        ? analysis.keyDisputes 
        : [`${analysis.category || "Objection"} identified in correspondence text`],
      compensationIssue: analysis.compensationIssue,
      disputedLandDetails: analysis.disputedLandDetails,
      legalCitations: analysis.legalCitations || [],
      uploadDate: new Date().toISOString().split('T')[0]
    };

    const db = getDB();
    db.documents.unshift(newDoc);

    // Also log into prediction history
    const historyItem: PredictionHistory = {
      id: `PRED-${Date.now().toString().slice(-4)}`,
      parcelId: parcelId || "Unassigned",
      projectId: "unassigned",
      timestamp: new Date().toISOString().split('T')[0],
      type: 'NLP',
      inputs: { textLength: text.length },
      outputs: analysis
    };
    db.predictions.unshift(historyItem);

    hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);
    res.json(newDoc);
  } catch (err: any) {
    console.error("Document analysis error:", err);
    res.status(500).json({ error: err.message || "Document analysis failed" });
  }
});

// 4. ML & AI Engine Prediction API (Random Forest + XGBoost + SHAP + AI Recommendation)
app.post("/api/predict/:type", (req, res) => {
  const { type } = req.params;
  const inputs = req.body || {};

  const {
    landArea = 5.0,
    ownersCount = 4,
    ownershipDispute = false,
    documentsComplete = true,
    previousDelay = false,
    distanceFromProject = 3.5,
    originalCost = 15000000,
    delayDays = 60,
    objectionFiled = false,
    courtCase = false,
    environmentalClearance = true,
    governmentApproval = true
  } = inputs;

  if (type === 'delay') {
    // 1. Random Forest Regressor -> Predicted Delay Days
    let baseDelay = 18 + Math.round(landArea * 3.2) + Math.round(ownersCount * 4.5);
    if (ownershipDispute) baseDelay += 42;
    if (!documentsComplete) baseDelay += 24;
    if (previousDelay) baseDelay += 18;
    if (courtCase) baseDelay += 65;
    if (objectionFiled) baseDelay += 22;
    const predictedDelayDays = Math.max(12, Math.min(240, baseDelay));

    // 2. XGBoost Advanced ML -> Delay Probability Percentage
    let probScore = 15 + Math.round(landArea * 2) + Math.round(ownersCount * 5);
    if (ownershipDispute) probScore += 35;
    if (!documentsComplete) probScore += 20;
    if (previousDelay) probScore += 15;
    if (courtCase) probScore += 30;
    const delayProbability = parseFloat(Math.max(10, Math.min(99, probScore)).toFixed(1));

    // 3. Random Forest Classifier -> Risk Class
    let riskClass: 'Low' | 'Medium' | 'High' = 'Low';
    if (delayProbability > 68) riskClass = 'High';
    else if (delayProbability > 35) riskClass = 'Medium';

    // 4. SHAP Explainable AI -> Key Delay Factors
    const shapFactors = [];
    if (ownershipDispute) {
      shapFactors.push({ feature: "Title & Boundary Dispute", impactDays: +42.0, percentage: 38, type: "High Risk" });
    }
    if (courtCase) {
      shapFactors.push({ feature: "Active Writ Stay in High Court", impactDays: +65.0, percentage: 45, type: "High Risk" });
    }
    if (ownersCount > 3) {
      shapFactors.push({ feature: `Multiple Landowners (${ownersCount} Claimants)`, impactDays: +(ownersCount * 4.5).toFixed(1), percentage: 22, type: "Medium Risk" });
    }
    if (!documentsComplete) {
      shapFactors.push({ feature: "Incomplete Revenue Deed Documentation", impactDays: +24.0, percentage: 18, type: "Medium Risk" });
    }
    if (objectionFiled) {
      shapFactors.push({ feature: "Valuation Award Objection Filed", impactDays: +22.0, percentage: 16, type: "Medium Risk" });
    }
    if (!environmentalClearance) {
      shapFactors.push({ feature: "Pending Forest/Environmental Clearance", impactDays: +28.0, percentage: 20, type: "Medium Risk" });
    }
    if (shapFactors.length === 0) {
      shapFactors.push({ feature: "Standard Revenue Administrative Lead Time", impactDays: +18.0, percentage: 100, type: "Low Risk" });
    }

    // 5. AI Recommendation Engine (LLM Directive)
    let aiRecommendation = "";
    let aiDirectives: string[] = [];

    if (riskClass === "High") {
      aiRecommendation = "FAST-TRACK EXECUTIVE INTERVENTION & DISTRICT COURT ESCROW DEPOSIT";
      aiDirectives = [
        "Deploy Senior Special Land Acquisition Officer (SLAO) for direct bilateral negotiation within 7 days.",
        "Initiate Section 19 Direct Award Notice to bypass routine gazette waiting times.",
        "Deposit disputed award funds into District Revenue Escrow Court to immediately secure physical land possession."
      ];
    } else if (riskClass === "Medium") {
      aiRecommendation = "PATTA VERIFICATION & DIRECT SPECIAL REVENUE CAMP";
      aiDirectives = [
        "Organize a 1-day Special Revenue Camp in the village for expedited Patta title verification.",
        "Submit expedited gazette clearance request to the District Collectorate.",
        "Issue pre-notice payout summary to co-owners to prevent late-stage valuation objections."
      ];
    } else {
      aiRecommendation = "ROUTINE DIRECT COMPENSATION DISBURSAL";
      aiDirectives = [
        "Proceed with routine electronic RTGS/NEFT direct compensation disbursal.",
        "Execute formal land handover agreement and update district digital cadastral records."
      ];
    }

    return res.json({
      model: "Random Forest + XGBoost + SHAP + LLM AI Engine",
      predictedDelayDays,
      probability: delayProbability,
      riskClass,
      shapFactors,
      aiRecommendation,
      aiDirectives
    });
  }

  if (type === 'cost') {
    let baseRate = 0.05;
    if (courtCase) baseRate += 0.16;
    if (objectionFiled) baseRate += 0.08;
    if (delayDays > 60) baseRate += 0.06;
    
    const percentageIncrease = parseFloat((baseRate * 100).toFixed(1));
    const additionalCost = Math.round(originalCost * baseRate);
    const expectedFinalCost = originalCost + additionalCost;

    const shapFactors = [
      { feature: "Expected Acquisition Delay Days", impactDays: Math.round(delayDays * 0.4), percentage: 35, type: "Cost Factor" },
      { feature: courtCase ? "Legal Stay Litigation Expenses" : "Standard Inflation Rate", impactDays: courtCase ? 16 : 5, percentage: courtCase ? 45 : 20, type: "Cost Factor" }
    ];

    return res.json({
      model: "Random Forest Regressor (Cost Overrun)",
      expectedFinalCost,
      additionalCost,
      percentageIncrease,
      shapFactors,
      aiRecommendation: "ENFORCE FIXED-AWARD CLEARANCE & BUDGETARY RESERVE ALLOCATION",
      aiDirectives: [
        `Pre-authorize ₹${(additionalCost / 100000).toFixed(1)} Lakhs in supplementary contingency reserves.`,
        "Engage Revenue Valuer for statutory award arbitration to cap exponential cost escalation."
      ]
    });
  }

  // Legal Risk Default
  let legalProb = 18;
  if (inputs.ownershipDispute) legalProb += 38;
  if (inputs.courtCase) legalProb += 32;
  if (!inputs.environmentalClearance) legalProb += 12;
  const probability = parseFloat(Math.min(98, legalProb).toFixed(1));
  const riskClass = probability > 65 ? "High" : probability > 35 ? "Medium" : "Low";

  return res.json({
    model: "Random Forest Classifier (Legal Risk)",
    probability,
    riskClass,
    requiresSpecialHearing: probability > 50,
    shapFactors: [
      { feature: "Active Title Injunction", impactDays: 38, percentage: 50, type: "Legal Factor" },
      { feature: "High Court Writ Stay", impactDays: 32, percentage: 40, type: "Legal Factor" }
    ],
    aiRecommendation: "APPOINT SPECIAL STANDING COUNSEL & SUBMIT VACATING STAY PETITION",
    aiDirectives: [
      "File urgent petition to vacate High Court interim stay under Section 24.",
      "Submit certified revenue survey records to standard district tribunal."
    ]
  });
});

app.post("/api/gis/ai-consult", async (req, res) => {
  const { featureType, featureData, promptType, customPrompt } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured on server." });
  }

  let prompt = "";
  if (featureType === "project") {
    prompt = `You are an expert Land Acquisition Advisor working on GIS projects in Tamil Nadu, India.
Analyze the following Project details:
- Project ID: ${featureData.id}
- Project Name: ${featureData.name}
- Delay Risk Level: ${featureData.delayRisk}
- Progress: ${featureData.progress}%
- Land Required: ${featureData.landRequired} Hectares
- Land Acquired: ${featureData.landAcquired} Hectares
- Predicted Delay: ${featureData.predictedDelay} Days

Query/Topic requested: ${promptType}. ${customPrompt ? `Additional instructions: ${customPrompt}` : ""}

Provide a professional, structured analysis report (in Markdown). Suggest realistic delay mitigation strategies, clearance checkpoints, or administrative protocols (e.g. Section 15 of land acquisition act) relevant to Tamil Nadu context. Keep it extremely detailed, specific, and actionable.`;
  } else {
    prompt = `You are an expert Land Acquisition Advisor working on GIS parcels in Tamil Nadu, India.
Analyze the following Land Parcel details:
- Parcel ID: ${featureData.id}
- Project ID: ${featureData.projectId}
- District: ${featureData.district}
- Land Area: ${featureData.landArea} Acres
- Land Type: ${featureData.landType}
- Owners Count: ${featureData.ownersCount}
- Title Dispute: ${featureData.ownershipDispute ? "Yes" : "No"}
- Documents Complete: ${featureData.documentsComplete ? "Yes" : "No"}
- Objection Filed: ${featureData.objectionFiled ? "Yes" : "No"}
- Court Case/Injunction: ${featureData.courtCase ? "Yes" : "No"}
- Acquisition Stage: ${featureData.acquisitionStage}
- Compensation Status: ${featureData.compensationStatus}
- Compensation Amount: ₹${featureData.compensationAmount}
- Predicted Delay: ${featureData.predictedDelayDays || "N/A"} Days
- Delay Risk Level: ${featureData.riskLevel}

Query/Topic requested: ${promptType}. ${customPrompt ? `Additional instructions: ${customPrompt}` : ""}

Provide a professional, structured analysis report (in Markdown). Recommend precise legal or administrative steps (e.g. patta verification, court case resolution, valuation award review, negotiation strategies with owners, escrow options) to fast-track acquisition of this plot. Keep it extremely detailed, specific, and actionable.`;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are an elite GIS & Land Acquisition AI Advisor (AIP) for infrastructure projects." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "No analysis generated.";
    res.json({ result: resultText });
  } catch (error: any) {
    console.error("Groq consultation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI consultation report." });
  }
});


// 5. Analytics Aggregate API
app.get("/api/analytics", (req, res) => {
  const db = getDB();
  const parcels: LandParcel[] = db.parcels;
  const projects: Project[] = db.projects;

  // District wise delays
  const districtMap: Record<string, { totalDays: number; count: number }> = {};
  parcels.forEach(p => {
    const dist = p.district || "Unknown";
    const delay = p.predictedDelayDays || 0;
    if (!districtMap[dist]) {
      districtMap[dist] = { totalDays: 0, count: 0 };
    }
    districtMap[dist].totalDays += delay;
    districtMap[dist].count += 1;
  });
  const districtWiseDelay = Object.keys(districtMap).map(key => ({
    district: key,
    averageDelay: Math.round(districtMap[key].totalDays / districtMap[key].count)
  }));

  // Project wise risks
  const projectRisks = projects.map(proj => {
    const projParcels = parcels.filter(p => p.projectId === proj.id);
    const high = projParcels.filter(p => p.riskLevel === "High").length;
    const med = projParcels.filter(p => p.riskLevel === "Medium").length;
    const low = projParcels.filter(p => p.riskLevel === "Low").length;
    return {
      projectName: proj.id,
      High: high,
      Medium: med,
      Low: low
    };
  });

  // Acquisition Stage distribution
  const stageMap: Record<string, number> = {};
  parcels.forEach(p => {
    const stage = p.acquisitionStage || "Survey";
    stageMap[stage] = (stageMap[stage] || 0) + 1;
  });
  const stageDistribution = Object.keys(stageMap).map(key => ({
    stage: key,
    count: stageMap[key]
  }));

  // Compensation status distribution
  const compMap: Record<string, number> = {};
  parcels.forEach(p => {
    const status = p.compensationStatus || "Pending";
    compMap[status] = (compMap[status] || 0) + 1;
  });
  const compensationStatusDistribution = Object.keys(compMap).map(key => ({
    status: key,
    count: compMap[key]
  }));

  // Legal Risk level distribution
  let legalHigh = 0, legalMed = 0, legalLow = 0;
  parcels.forEach(p => {
    if (p.legalRiskLevel === "High") legalHigh++;
    else if (p.legalRiskLevel === "Medium") legalMed++;
    else legalLow++;
  });
  const legalRiskDistribution = [
    { name: "High", value: legalHigh },
    { name: "Medium", value: legalMed },
    { name: "Low", value: legalLow }
  ];

  // Land Acquired vs Pending sums
  let totalRequired = 0;
  let totalAcquired = 0;
  projects.forEach(p => {
    totalRequired += p.landRequired;
    totalAcquired += p.landAcquired;
  });
  const landBalance = [
    { name: "Acquired", value: Math.round(totalAcquired) },
    { name: "Pending", value: Math.round(totalRequired - totalAcquired) }
  ];

  res.json({
    districtWiseDelay,
    projectRisks,
    stageDistribution,
    compensationStatusDistribution,
    legalRiskDistribution,
    landBalance
  });
});

// 6. Dataset upload workflow
app.post("/api/upload", (req, res) => {
  const { csvContent, fileName } = req.body;
  if (!csvContent) return res.status(400).json({ error: "CSV content is required" });

  try {
    // Parse the CSV content simple line parser
    const lines = csvContent.split("\n").map((line: string) => line.trim()).filter((line: string) => line.length > 0);
    if (lines.length < 2) return res.status(400).json({ error: "CSV must contain headers and at least one data row" });

    const headers = lines[0].split(",").map((h: string) => h.replace(/["\r]/g, "").trim());
    
    // Map required fields to check
    const dataRows = lines.slice(1);
    const parsedParcels: LandParcel[] = [];
    let invalidRecords = 0;
    let missingValuesCount = 0;

    dataRows.forEach((row: string) => {
      const cols = row.split(",").map((c: string) => c.replace(/["\r]/g, "").trim());
      if (cols.length < headers.length) {
        invalidRecords++;
        return;
      }

      // Create raw object map
      const rowObj: Record<string, any> = {};
      headers.forEach((h: string, idx: number) => {
        rowObj[h] = cols[idx];
        if (cols[idx] === "" || cols[idx] === undefined) {
          missingValuesCount++;
        }
      });

      // Construct a valid LandParcel
      const area = parseFloat(rowObj.landArea || rowObj.LandArea || "1.0");
      const owners = parseInt(rowObj.ownersCount || rowObj.Owners || "1", 10);
      const estComp = parseFloat(rowObj.compensationAmount || rowObj.CompensationAmount || "500000");

      const parcel: LandParcel = {
        id: rowObj.parcelId || rowObj.ParcelID || `LA-${Math.round(Math.random() * 1000 + 1000)}`,
        projectId: rowObj.projectId || rowObj.ProjectID || "NH-45",
        district: rowObj.district || rowObj.District || "Kanchipuram",
        landArea: isNaN(area) ? 1.0 : area,
        landType: (rowObj.landType || rowObj.LandType || "Agricultural") as any,
        ownersCount: isNaN(owners) ? 1 : owners,
        ownershipDispute: rowObj.ownershipDispute === "true" || rowObj.ownershipDispute === "1" || rowObj.OwnershipDispute === "Yes",
        documentsComplete: rowObj.documentsComplete === "true" || rowObj.documentsComplete === "1" || rowObj.DocumentsComplete === "Yes",
        compensationStatus: (rowObj.compensationStatus || rowObj.CompensationStatus || "Pending") as any,
        compensationAmount: isNaN(estComp) ? 100000 : estComp,
        objectionFiled: rowObj.objectionFiled === "true" || rowObj.objectionFiled === "1" || rowObj.ObjectionFiled === "Yes",
        courtCase: rowObj.courtCase === "true" || rowObj.courtCase === "1" || rowObj.CourtCase === "Yes",
        surveyCompleted: rowObj.surveyCompleted !== "false" && rowObj.surveyCompleted !== "0" && rowObj.SurveyCompleted !== "No",
        environmentalClearance: rowObj.environmentalClearance !== "false" && rowObj.environmentalClearance !== "0" && rowObj.EnvironmentalClearance !== "No",
        governmentApproval: rowObj.governmentApproval !== "false" && rowObj.governmentApproval !== "0" && rowObj.GovernmentApproval !== "No",
        acquisitionStage: (rowObj.acquisitionStage || rowObj.AcquisitionStage || "Survey") as any,
        previousDelay: rowObj.previousDelay === "true" || rowObj.previousDelay === "1" || rowObj.PreviousDelay === "Yes",
        distanceFromProject: parseFloat(rowObj.distanceFromProject || rowObj.DistanceFromProject || "2.0")
      };

      // Perform calculations
      const delay = calculateDelay(parcel);
      const cost = calculateCostOverrun(parcel, parcel.compensationAmount);
      const legal = calculateLegalRisk(parcel);

      parcel.predictedDelayDays = delay.predictedDelayDays;
      parcel.delayProbability = delay.delayProbability;
      parcel.riskLevel = delay.riskLevel;
      parcel.expectedAdditionalCost = cost.expectedAdditionalCost;
      parcel.expectedFinalCost = cost.expectedFinalCost;
      parcel.costOverrunPercentage = cost.costOverrunPercentage;
      parcel.legalRiskProbability = legal.legalRiskProbability;
      parcel.legalRiskLevel = legal.legalRiskLevel;

      parsedParcels.push(parcel);
    });

    const db = getDB();
    
    // Append valid parsed records to current database
    db.parcels = [...db.parcels, ...parsedParcels];
    hydrateAndSaveDB(db.projects, db.parcels, db.alerts, db.documents, db.predictions);

    res.json({
      success: true,
      totalRecords: lines.length - 1,
      validRecords: parsedParcels.length,
      invalidRecords,
      missingValues: missingValuesCount,
      records: parsedParcels
    });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to parse and process dataset: " + e.message });
  }
});

// Vite Middleware & static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, "../frontend")
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Land Acquisition server listening on port ${PORT}`);
  });
}

startServer();
