import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'ADMIN' | 'DISTRICT_OFFICER' | 'REVENUE_OFFICER' | 'SURVEY_OFFICER' | 'LEGAL_OFFICER' | 'VIEWER';
  department?: string;
  district?: string;
  phone?: string;
  emailNotificationsEnabled?: boolean;
  whatsappEnabled?: boolean;
  notificationPreferences?: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'DISTRICT_OFFICER', 'REVENUE_OFFICER', 'SURVEY_OFFICER', 'LEGAL_OFFICER', 'VIEWER'],
      default: 'VIEWER',
      index: true
    },
    department: { type: String, default: 'Land Acquisition Department' },
    district: { type: String, default: 'All' },
    phone: { type: String, default: '+91 98765 43210' },
    emailNotificationsEnabled: { type: Boolean, default: true },
    whatsappEnabled: { type: Boolean, default: true },
    notificationPreferences: {
      type: Schema.Types.Mixed,
      default: {
        HIGH_DELAY_RISK: true,
        LEGAL_ISSUE: true,
        DOCUMENT_MISMATCH: true,
        COMPENSATION_PENDING: true,
        SURVEY_ISSUE: true,
        CRITICAL_ALERT: true
      }
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
