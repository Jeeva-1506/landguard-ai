import mongoose, { Schema, Document } from "mongoose";

export interface ICompensation extends Document {
  id: string;
  parcelId: string;
  surveyNumber: string;
  estimatedAmount: number;
  offeredAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PENDING' | 'OFFERED' | 'PARTIALLY_PAID' | 'PAID' | 'DISPUTED';
  paymentDate?: string;
}

const CompensationSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    parcelId: { type: String, required: true, index: true },
    surveyNumber: { type: String, required: true, index: true },
    estimatedAmount: { type: Number, required: true },
    offeredAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'OFFERED', 'PARTIALLY_PAID', 'PAID', 'DISPUTED'],
      default: 'PENDING',
      index: true
    },
    paymentDate: { type: String }
  },
  { timestamps: true }
);

export const CompensationModel = mongoose.model<ICompensation>("Compensation", CompensationSchema);
