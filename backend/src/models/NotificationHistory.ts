import mongoose, { Schema, Document } from "mongoose";

export type WhatsAppDeliveryStatus = 'PENDING' | 'ACCEPTED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type EmailDeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface INotificationHistory extends Document {
  notificationId: string;
  eventId: string;
  offerId: number;
  recipient: {
    whatsappMasked: string;
    emailMasked: string;
  };
  channels: ("WhatsApp" | "Email")[];
  whatsappStatus: WhatsAppDeliveryStatus;
  emailStatus: EmailDeliveryStatus;
  whatsappProviderMessageId?: string;
  emailProviderMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  isTest: boolean;
  eventDetails?: Record<string, any>;
}

const NotificationHistorySchema: Schema = new Schema(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    eventId: { type: String, required: true, index: true },
    offerId: { type: Number, required: true, default: 1 },
    recipient: {
      whatsappMasked: { type: String, required: true },
      emailMasked: { type: String, required: true }
    },
    channels: [{ type: String }],
    whatsappStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'PENDING'
    },
    emailStatus: {
      type: String,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
      default: 'PENDING'
    },
    whatsappProviderMessageId: { type: String },
    emailProviderMessageId: { type: String },
    errorCode: { type: String },
    errorMessage: { type: String },
    createdAt: { type: String, required: true },
    sentAt: { type: String },
    deliveredAt: { type: String },
    readAt: { type: String },
    isTest: { type: Boolean, default: false },
    eventDetails: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const NotificationHistoryModel = mongoose.model<INotificationHistory>(
  "NotificationHistory",
  NotificationHistorySchema
);

// In-Memory Storage Fallback for Prototype when DB connection is not present
export const inMemoryNotificationHistory: Array<any> = [];
