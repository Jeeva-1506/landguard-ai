import mongoose, { Schema, Document } from "mongoose";

export interface IDocumentAnalysis extends Document {
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
  confidence: number;
  importantTerms: string[];
  keyDisputes?: string[];
  compensationIssue?: string;
  disputedLandDetails?: string;
  legalCitations?: string[];
  aiRecommendation?: string;
  fileType?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadDate: string;
}

const DocumentSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    parcelId: { type: String, required: true, index: true },
    surveyNumber: { type: String, index: true },
    text: { type: String, required: true },
    category: { type: String, required: true },
    risk: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low', index: true },
    riskClassification: { type: String },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Mismatch', 'Requires Review'],
      default: 'Pending',
      index: true
    },
    issuesDetected: { type: String },
    confidence: { type: Number, default: 80 },
    importantTerms: [{ type: String }],
    keyDisputes: [{ type: String }],
    compensationIssue: { type: String },
    disputedLandDetails: { type: String },
    legalCitations: [{ type: String }],
    aiRecommendation: { type: String },
    fileType: { type: String, default: 'PDF' },
    fileSize: { type: String, default: '1.2 MB' },
    fileUrl: { type: String },
    uploadDate: { type: String }
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocumentAnalysis>("Document", DocumentSchema);
