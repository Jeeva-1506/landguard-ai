import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  id: string;
  user: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  previousValue?: any;
  newValue?: any;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    user: { type: String, required: true, index: true },
    userRole: { type: String },
    action: { type: String, required: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
