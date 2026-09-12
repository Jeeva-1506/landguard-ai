import { Request, Response } from "express";
import {
  getMaskedOfferConfigs,
  getActiveOfferConfig,
  isPrototypeMode,
  maskPhoneNumber,
  maskEmail
} from "../config/notificationOffers";
import { NotificationService } from "../services/notificationService";
import { NotificationHistoryModel, inMemoryNotificationHistory } from "../models/NotificationHistory";

export const getNotificationConfig = async (req: Request, res: Response) => {
  try {
    const offers = getMaskedOfferConfigs();
    const activeOffer = getActiveOfferConfig();
    const prototypeMode = isPrototypeMode();

    const maskedWhatsApp = activeOffer?.whatsappNumber
      ? maskPhoneNumber(activeOffer.whatsappNumber)
      : maskPhoneNumber(process.env.PROTOTYPE_WHATSAPP_NUMBER || "+917871534167");

    const maskedEmail = activeOffer?.email
      ? maskEmail(activeOffer.email)
      : maskEmail(process.env.PROTOTYPE_EMAIL || "jeevaselva0614@gmail.com");

    return res.json({
      prototypeMode,
      activeOfferId: activeOffer?.id || 1,
      recipient: {
        whatsappMasked: maskedWhatsApp,
        emailMasked: maskedEmail
      },
      channels: ["WhatsApp", "Email"],
      offers
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to retrieve notification configuration" });
  }
};

export const sendPrototypeTestNotification = async (req: Request, res: Response) => {
  try {
    const result = await NotificationService.sendPrototypeTestNotification();
    return res.status(200).json({
      success: true,
      message: "Prototype test notification executed.",
      result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to execute prototype test notification"
    });
  }
};

export const sendLandRiskEmailAlert = async (req: Request, res: Response) => {
  try {
    const { recipientEmail, landId, surveyNumber, landRiskDetails } = req.body;
    let land: any = null;

    // Fetch actual land record if landId or surveyNumber is supplied
    if (landId || surveyNumber) {
      const { isDbConnected, getLegacySeedData } = await import("../services/dataHelper");
      const { LandRecordModel } = await import("../models/LandRecord");

      if (isDbConnected()) {
        if (landId) land = await LandRecordModel.findOne({ id: landId }).lean();
        if (!land && surveyNumber) land = await LandRecordModel.findOne({ surveyNumber }).lean();
      }

      if (!land) {
        const seed = getLegacySeedData();
        if (landId) land = (seed.parcels || []).find((p: any) => p.id === landId);
        if (!land && surveyNumber) {
          land = (seed.parcels || []).find(
            (p: any) => (p.surveyNumber || "").toLowerCase() === String(surveyNumber).toLowerCase()
          );
        }
      }
    }

    const payload = {
      projectName: landRiskDetails?.projectName || land?.projectName || land?.projectId || (landId ? `Project ${landId}` : undefined),
      surveyNumber: landRiskDetails?.surveyNumber || land?.surveyNumber || surveyNumber,
      ownerName: landRiskDetails?.ownerName || land?.ownerName,
      state: landRiskDetails?.state || land?.state || "Tamil Nadu",
      district: landRiskDetails?.district || land?.district,
      taluk: landRiskDetails?.taluk || land?.taluk || (land?.location ? land.location.split(",")[0] : undefined),
      village: landRiskDetails?.village || land?.village || (land?.location ? land.location.split(",")[0] : undefined),
      landArea: landRiskDetails?.landArea ?? land?.landArea ?? land?.area,
      landType: landRiskDetails?.landType || land?.landType,
      riskLevel: landRiskDetails?.riskLevel || land?.riskLevel,
      delayProbability: landRiskDetails?.delayProbability ?? land?.delayProbability,
      expectedDelayDays: landRiskDetails?.expectedDelayDays ?? land?.predictedDelayDays,
      legalIssues: landRiskDetails?.legalIssues || (land?.courtCase ? "Active Court Case" : land?.ownershipDispute ? "Title Dispute" : "None"),
      documentStatus: landRiskDetails?.documentStatus || (land?.documentsComplete ? "Verified" : "Under Review"),
      compensationStatus: landRiskDetails?.compensationStatus || land?.compensationStatus || "Under Assessment",
      recommendedAction: landRiskDetails?.recommendedAction || land?.recommendedAction || "Conduct title deed verification and revenue officer review.",
      riskFactors: landRiskDetails?.riskFactors || (land?.riskFactors ? land.riskFactors : [
        land?.courtCase ? "Active Court Case" : "Standard Timeline Risk"
      ]),
      recipientEmail
    };

    // Debugging logs as per Step 10
    console.log("Selected Land:", land);
    console.log("Risk Result:", {
      riskLevel: payload.riskLevel,
      delayProbability: payload.delayProbability,
      expectedDelayDays: payload.expectedDelayDays
    });
    console.log("Email Payload:", payload);

    const eventId = `ALERT-${Date.now()}`;
    const result = await NotificationService.dispatchEventNotification(
      eventId,
      "LAND_RISK_ALERT",
      payload,
      false
    );

    if (result && result.status === 'FAILED') {
      return res.status(400).json({
        success: false,
        error: result.message || "Unable to send risk alert because land risk details are incomplete.",
        result
      });
    }

    return res.status(200).json({
      success: true,
      message: `Risk alert notification dispatched for Survey #${payload.surveyNumber}`,
      result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to send land risk email alert"
    });
  }
};

export const getNotificationHistory = async (req: Request, res: Response) => {
  try {
    let dbHistory: any[] = [];
    if (NotificationHistoryModel.db && NotificationHistoryModel.db.readyState === 1) {
      dbHistory = await NotificationHistoryModel.find().sort({ createdAt: -1 }).lean();
    }

    // Merge DB history with in-memory records, eliminating duplicates by notificationId
    const map = new Map<string, any>();
    [...inMemoryNotificationHistory, ...dbHistory].forEach(item => {
      if (!map.has(item.notificationId)) {
        map.set(item.notificationId, item);
      }
    });

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json(combined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch notification history" });
  }
};

// Meta WhatsApp Cloud API Webhook Verification Endpoint
export const verifyWhatsAppWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "landguard_whatsapp_webhook_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Meta WhatsApp Webhook Verification Successful!");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

// Meta WhatsApp Cloud API Incoming Webhook Events Endpoint
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account" && body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value && change.value.statuses) {
              for (const statusObj of change.value.statuses) {
                const messageId = statusObj.id;
                const status = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
                const timestamp = statusObj.timestamp;

                await NotificationService.handleWhatsAppWebhookStatusUpdate(
                  messageId,
                  status,
                  timestamp
                );
              }
            }
          }
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  } catch (err: any) {
    console.error("WhatsApp Webhook processing error:", err);
    return res.status(200).send("EVENT_RECEIVED"); // Meta expects 200 OK to acknowledge receipt
  }
};
