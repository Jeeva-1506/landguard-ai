export interface Project {
  id: string;
  name: string;
  state: string; // Tamil Nadu, Karnataka, etc.
  district: string;
  type: string; // Highway, Railway, Power, Industrial, Urban, Water, etc.
  landRequired: number; // in hectares
  landAcquired: number; // in hectares
  landPending?: number; // in hectares
  progress: number; // percentage
  delayRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  predictedDelay: number; // in days
  costOverrun: number; // in Crores (e.g., 9.41)
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
  estimatedCost: number; // In Rupees
  totalParcelsCount?: number;
  startDate?: string;
  targetCompletionDate?: string;
  currentStage?: string;
}

export interface LandParcel {
  id: string; // e.g. LA1021
  surveyNumber?: string; // e.g. 124/2
  village?: string;
  taluk?: string;
  district: string;
  state?: string;
  projectId: string;
  landArea: number; // in Acres
  landType: 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Barren';
  ownersCount: number;
  ownershipStatus?: 'Clear Title' | 'Under Verification' | 'Disputed' | 'Joint Family Title' | 'Verified';
  ownershipDispute: boolean;
  documentsComplete: boolean;
  legalStatus?: 'Clear' | 'Notice Issued' | 'Section-15 Objection' | 'Court Stay Order';
  compensationStatus: 'Paid' | 'Pending' | 'Disputed';
  compensationAmount: number; // in Rupees
  objectionFiled: boolean;
  courtCase: boolean;
  surveyCompleted: boolean;
  environmentalClearance: boolean;
  governmentApproval: boolean;
  acquisitionStage: 'Land Identification' | 'Survey & Verification' | 'Notification' | 'Objection' | 'Compensation' | 'Award' | 'Payment' | 'Possession';
  previousDelay: boolean;
  distanceFromProject: number; // in km
  
  // Predictive Analytics Model Outputs
  predictedDelayDays?: number;
  delayProbability?: number; // 0-100
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction?: string;
  expectedAdditionalCost?: number; // in Rupees
  expectedFinalCost?: number; // in Rupees
  costOverrunPercentage?: number; // 0-100
  legalRiskProbability?: number; // 0-100
  legalRiskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // GIS & Spatial Data
  ownerName?: string;
  area?: number;
  areaUnit?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  polygon?: [number, number][];
  riskScore?: number; // 0-100
  
  // Objection / NLP details
  nlpCategory?: string;
  nlpConfidence?: number;
  nlpKeywords?: string[];
  complaintText?: string;
}

export interface Alert {
  id: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectId: string;
  projectName: string;
  parcelId: string;
  surveyNumber?: string;
  issue: string;
  expectedDelay: number; // days
  recommendedAction: string;
  status: 'Open' | 'Assigned' | 'Resolved';
  timestamp: string;
}

export interface DocumentAnalysis {
  id: string;
  name: string;
  parcelId: string;
  surveyNumber?: string;
  text: string;
  category: 'Compensation Issue' | 'Ownership Issue' | 'Documentation Issue' | 'Environmental Issue' | 'Legal Issue' | 'Other';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskClassification?: 'Low' | 'Medium' | 'High' | 'Critical';
  verificationStatus: 'Verified' | 'Pending' | 'Mismatch' | 'Requires Review';
  issuesDetected?: string;
  confidence: number; // 0-1 or 0-100
  importantTerms: string[];
  keyDisputes?: string[];
  compensationIssue?: string;
  disputedLandDetails?: string;
  legalCitations?: string[];
  aiRecommendation?: string;
  uploadDate: string;
}

export interface ObjectionRecord {
  id: string;
  surveyNumber: string;
  parcelId: string;
  project: string;
  objectionType: 'Ownership' | 'Compensation' | 'Boundary' | 'Legal' | 'Public Objection' | 'Other';
  submittedDate: string;
  status: 'Received' | 'Under Inquiry' | 'Hearing Scheduled' | 'Resolved' | 'Rejected';
  riskImpact: 'High' | 'Medium' | 'Low' | 'Critical';
  expectedResolution: string;
  description: string;
}

export interface PredictionHistory {
  id: string;
  parcelId: string;
  projectId: string;
  timestamp: string;
  type: 'Delay' | 'Cost' | 'Legal' | 'NLP';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}
