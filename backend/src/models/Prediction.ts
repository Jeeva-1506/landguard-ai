import mongoose, { Schema, Document } from "mongoose";

export interface IPrediction extends Document {
  id: string;
  parcelId: string;
  projectId: string;
  timestamp: string;
  type: 'Delay' | 'Cost' | 'Legal' | 'NLP';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

const PredictionSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    parcelId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    timestamp: { type: String, required: true },
    type: { type: String, enum: ['Delay', 'Cost', 'Legal', 'NLP'], required: true },
    inputs: { type: Schema.Types.Mixed },
    outputs: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const PredictionModel = mongoose.model<IPrediction>("Prediction", PredictionSchema);
