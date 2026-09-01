export interface Project {
  id: string;
  name: string;
  district: string;
  type: string; // Highway, Railway, Power, Industrial, Urban, Water, etc.
  landRequired: number; // in hectares
  landAcquired: number; // in hectares
  progress: number; // percentage
  delayRisk: 'Low' | 'Medium' | 'High';
  predictedDelay: number; // in days
  costOverrun: number; // in Crores (e.g., 9.41)
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
  estimatedCost: number; // In Rupees
}

export interface LandParcel {
  id: string;
  projectId: string;
  district: string;
  landArea: number; // in Acres
  landType: 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Barren';
  ownersCount: number;
  ownershipDispute: boolean;
  documentsComplete: boolean;
  compensationStatus: 'Paid' | 'Pending' | 'Disputed';
  compensationAmount: number; // in Rupees
  objectionFiled: boolean;
  courtCase: boolean;
  surveyCompleted: boolean;
  environmentalClearance: boolean;
  governmentApproval: boolean;
  acquisitionStage: 'Survey' | 'Notification' | 'Negotiation' | 'Compensation' | 'Agreement' | 'Possession';
  previousDelay: boolean;
  distanceFromProject: number; // in km
  
  // Model output fields (automatically computed or customized)
  predictedDelayDays?: number;
  delayProbability?: number; // 0-100
  riskLevel?: 'Low' | 'Medium' | 'High';
  expectedAdditionalCost?: number; // in Rupees
  expectedFinalCost?: number; // in Rupees
  costOverrunPercentage?: number; // 0-100
  legalRiskProbability?: number; // 0-100
  legalRiskLevel?: 'Low' | 'Medium' | 'High';
  
  // NLP analysis on any objection/complaint text associated
  nlpCategory?: string;
  nlpConfidence?: number;
  nlpKeywords?: string[];
  complaintText?: string;
}

export interface Alert {
  id: string;
  priority: 'Low' | 'Medium' | 'High';
  projectId: string;
  projectName: string;
  parcelId: string;
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
  text: string;
  category: 'Compensation Issue' | 'Ownership Issue' | 'Documentation Issue' | 'Environmental Issue' | 'Legal Issue' | 'Other';
  risk: 'Low' | 'Medium' | 'High';
  riskClassification?: 'Low' | 'Medium' | 'High';
  confidence: number; // 0-1 or 0-100
  importantTerms: string[];
  keyDisputes?: string[];
  compensationIssue?: string;
  disputedLandDetails?: string;
  legalCitations?: string[];
  aiRecommendation?: string;
  uploadDate: string;
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
