import mongoose, { Schema, Document } from "mongoose";

export type IssueTypeCategory = 
  | 'HIGH_DELAY_RISK'
  | 'LEGAL_ISSUE'
  | 'DOCUMENT_MISMATCH'
  | 'COMPENSATION_PENDING'
  | 'SURVEY_ISSUE'
  | 'CRITICAL_ALERT';

export interface IAlert extends Document {
  id: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectId: string;
  projectName: string;
  parcelId: string;
  surveyNumber?: string;
  issue: string;
  issueType: IssueTypeCategory;
  expectedDelay: number;
  recommendedAction: string;
  status: 'Open' | 'Assigned' | 'Resolved';
  read: boolean;
  emailStatus: 'PENDING' | 'SENT' | 'FAILED';
  whatsappStatus: 'PENDING' | 'SENT' | 'FAILED';
  deliveryLogs?: Array<{
    channel: 'EMAIL' | 'WHATSAPP' | 'IN_APP';
    status: 'SENT' | 'FAILED' | 'DEMO';
    message: string;
    timestamp: string;
  }>;
  lastNotifiedAt?: string;
  timestamp: string;
}

const AlertSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    parcelId: { type: String, required: true, index: true },
    surveyNumber: { type: String, index: true },
    issue: { type: String, required: true },
    issueType: {
      type: String,
      enum: ['HIGH_DELAY_RISK', 'LEGAL_ISSUE', 'DOCUMENT_MISMATCH', 'COMPENSATION_PENDING', 'SURVEY_ISSUE', 'CRITICAL_ALERT'],
      default: 'HIGH_DELAY_RISK',
      index: true
    },
    expectedDelay: { type: Number, default: 0 },
    recommendedAction: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Assigned', 'Resolved'], default: 'Open', index: true },
    read: { type: Boolean, default: false, index: true },
    emailStatus: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    whatsappStatus: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    deliveryLogs: [{
      channel: { type: String },
      status: { type: String },
      message: { type: String },
      timestamp: { type: String }
    }],
    lastNotifiedAt: { type: String },
    timestamp: { type: String, required: true }
  },
  { timestamps: true }
);

export const AlertModel = mongoose.model<IAlert>("Alert", AlertSchema);
