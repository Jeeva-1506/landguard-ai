import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  id: string;
  name: string;
  state: string;
  district: string;
  type: string;
  landRequired: number;
  landAcquired: number;
  landPending: number;
  progress: number;
  delayRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  predictedDelay: number;
  costOverrun: number;
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
  estimatedCost: number;
  totalParcelsCount?: number;
  startDate?: string;
  targetCompletionDate?: string;
  currentStage?: string;
}

const ProjectSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    type: { type: String, required: true },
    landRequired: { type: Number, required: true },
    landAcquired: { type: Number, required: true },
    landPending: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    delayRisk: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low', index: true },
    predictedDelay: { type: Number, default: 0 },
    costOverrun: { type: Number, default: 0 },
    status: { type: String, enum: ['On Track', 'Delayed', 'Critical', 'Completed'], default: 'On Track' },
    estimatedCost: { type: Number, required: true },
    totalParcelsCount: { type: Number, default: 0 },
    startDate: { type: String },
    targetCompletionDate: { type: String },
    currentStage: { type: String, default: 'Land Identification' }
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.model<IProject>("Project", ProjectSchema);
