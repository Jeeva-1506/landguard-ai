import mongoose, { Schema, Document } from "mongoose";

export interface ILegalIssue extends Document {
  id: string;
  parcelId: string;
  surveyNumber: string;
  project: string;
  issueType: 'Ownership' | 'Compensation' | 'Boundary' | 'Legal' | 'Public Objection' | 'Other';
  submittedDate: string;
  status: 'Received' | 'Under Inquiry' | 'Hearing Scheduled' | 'Resolved' | 'Rejected';
  riskImpact: 'High' | 'Medium' | 'Low' | 'Critical';
  expectedResolution: string;
  description: string;
}

const LegalIssueSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    parcelId: { type: String, required: true, index: true },
    surveyNumber: { type: String, required: true, index: true },
    project: { type: String, required: true },
    issueType: { type: String, required: true },
    submittedDate: { type: String, required: true },
    status: { type: String, default: 'Received' },
    riskImpact: { type: String, enum: ['High', 'Medium', 'Low', 'Critical'], default: 'Medium' },
    expectedResolution: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

export const LegalIssueModel = mongoose.model<ILegalIssue>("LegalIssue", LegalIssueSchema);
