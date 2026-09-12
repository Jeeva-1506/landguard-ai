import mongoose, { Schema, Document } from "mongoose";

export interface ILandRecord extends Document {
  id: string;
  surveyNumber: string;
  subdivisionNumber?: string;
  ownerName: string;
  state: string;
  district: string;
  taluk?: string;
  village?: string;
  projectId: string;
  landArea: number;
  area: number;
  areaUnit: string;
  landType: 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial' | 'Barren';
  ownersCount: number;
  ownershipStatus: 'Clear Title' | 'Under Verification' | 'Disputed' | 'Joint Family Title' | 'Verified' | 'Private';
  ownershipDispute: boolean;
  documentsComplete: boolean;
  legalStatus: 'Clear' | 'Notice Issued' | 'Section-15 Objection' | 'Court Stay Order';
  compensationStatus: 'Paid' | 'Pending' | 'Disputed';
  compensationAmount: number;
  objectionFiled: boolean;
  courtCase: boolean;
  surveyCompleted: boolean;
  environmentalClearance: boolean;
  governmentApproval: boolean;
  acquisitionStage: 'Land Identification' | 'Survey & Verification' | 'Notification' | 'Objection' | 'Compensation' | 'Award' | 'Payment' | 'Possession' | 'Negotiation';
  previousDelay: boolean;
  distanceFromProject: number;
  
  predictedDelayDays: number;
  delayProbability: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction?: string;
  expectedAdditionalCost?: number;
  expectedFinalCost?: number;
  costOverrunPercentage?: number;
  legalRiskProbability?: number;
  legalRiskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  
  location?: string;
  latitude?: number;
  longitude?: number;
  polygon?: [number, number][];
  
  nlpCategory?: string;
  nlpConfidence?: number;
  nlpKeywords?: string[];
  complaintText?: string;

  highRiskAlertSent?: boolean;
  highRiskAlertSentAt?: string;
  lastAlertStatus?: 'SENT' | 'FAILED' | 'NO_ALERT';
  lastAlertError?: string;
}

const LandRecordSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    surveyNumber: { type: String, index: true },
    subdivisionNumber: { type: String },
    ownerName: { type: String, index: true },
    state: { type: String, default: 'Tamil Nadu', index: true },
    district: { type: String, required: true, index: true },
    taluk: { type: String },
    village: { type: String },
    projectId: { type: String, required: true, index: true },
    landArea: { type: Number, required: true },
    area: { type: Number, required: true },
    areaUnit: { type: String, default: 'Acres' },
    landType: {
      type: String,
      enum: ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Barren'],
      default: 'Agricultural'
    },
    ownersCount: { type: Number, default: 1 },
    ownershipStatus: { type: String, default: 'Under Verification' },
    ownershipDispute: { type: Boolean, default: false },
    documentsComplete: { type: Boolean, default: false },
    legalStatus: { type: String, default: 'Clear' },
    compensationStatus: { type: String, enum: ['Paid', 'Pending', 'Disputed'], default: 'Pending' },
    compensationAmount: { type: Number, default: 0 },
    objectionFiled: { type: Boolean, default: false },
    courtCase: { type: Boolean, default: false },
    surveyCompleted: { type: Boolean, default: false },
    environmentalClearance: { type: Boolean, default: true },
    governmentApproval: { type: Boolean, default: false },
    acquisitionStage: { type: String, default: 'Land Identification' },
    previousDelay: { type: Boolean, default: false },
    distanceFromProject: { type: Number, default: 1.0 },
    
    predictedDelayDays: { type: Number, default: 30 },
    delayProbability: { type: Number, default: 20 },
    riskScore: { type: Number, default: 20 },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low', index: true },
    recommendedAction: { type: String },
    expectedAdditionalCost: { type: Number, default: 0 },
    expectedFinalCost: { type: Number, default: 0 },
    costOverrunPercentage: { type: Number, default: 0 },
    legalRiskProbability: { type: Number, default: 10 },
    legalRiskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    polygon: { type: Schema.Types.Mixed },
    
    nlpCategory: { type: String },
    nlpConfidence: { type: Number },
    nlpKeywords: [{ type: String }],
    complaintText: { type: String },

    highRiskAlertSent: { type: Boolean, default: false },
    highRiskAlertSentAt: { type: String },
    lastAlertStatus: { type: String, enum: ['SENT', 'FAILED', 'NO_ALERT'], default: 'NO_ALERT' },
    lastAlertError: { type: String }
  },
  { timestamps: true }
);

export const LandRecordModel = mongoose.model<ILandRecord>("LandRecord", LandRecordSchema);
