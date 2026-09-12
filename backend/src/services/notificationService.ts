import { getActiveOfferConfig, maskPhoneNumber, maskEmail } from "../config/notificationOffers";
import { NotificationHistoryModel, inMemoryNotificationHistory } from "../models/NotificationHistory";
import { WhatsAppService, WhatsAppDispatchResult } from "./whatsappService";
import { EmailService, EmailDispatchResult } from "./emailService";

// Cache for idempotency duplicate prevention in memory
const sentIdempotencyKeys = new Set<string>();

export class NotificationService {
  /**
   * Dispatches notifications for LandGuard AI Events via active Offer (Offer 1)
   */
  /**
   * Dispatches notifications for LandGuard AI Events via active Offer
   */
  public static async dispatchEventNotification(
    eventId: string,
    eventType: string,
    payload: {
      projectName: string;
      surveyNumber: string;
      riskLevel: string;
      delayProbability: number | string;
      expectedDelayDays: number | string;
      issue?: string;
      recommendedAction: string;
      ownerName?: string;
      state?: string;
      district?: string;
      taluk?: string;
      village?: string;
      landArea?: number | string;
      landType?: string;
      legalIssues?: string;
      documentIssues?: string;
      documentStatus?: string;
      compensationStatus?: string;
      riskFactors?: string[];
      recipientEmail?: string;
    },
    isTest = false
  ): Promise<any> {
    // Step 9 Validation — Ensure critical data exists for real alert notifications
    if (!isTest) {
      const missingFields = [];
      if (!payload.projectName) missingFields.push("projectName");
      if (!payload.surveyNumber) missingFields.push("surveyNumber");
      if (!payload.district) missingFields.push("district");
      if (!payload.riskLevel) missingFields.push("riskLevel");
      if (payload.delayProbability == null) missingFields.push("delayProbability");
      if (payload.expectedDelayDays == null) missingFields.push("expectedDelayDays");

      if (missingFields.length > 0) {
        console.warn(`[NotificationService] Validation Failed for Event ${eventId}. Missing fields: ${missingFields.join(", ")}`);
        return {
          success: false,
          status: 'FAILED',
          message: "Unable to send risk alert because land risk details are incomplete.",
          missingFields
        };
      }
    }

    const offer = getActiveOfferConfig();

    if (!offer || !offer.enabled) {
      console.log(`[NotificationService] No active offer enabled. Notification skipped.`);
      return null;
    }

    const offerId = offer.id;
    const activeChannels = offer.channels || ["Email"];
    const isWhatsAppEnabled = activeChannels.includes("WhatsApp");
    const isEmailEnabled = activeChannels.includes("Email");

    const whatsappRecipient = offer.whatsappNumber || process.env.PROTOTYPE_WHATSAPP_NUMBER || "+917871534167";
    const emailRecipient = payload.recipientEmail || offer.email || process.env.PROTOTYPE_EMAIL || "jeevaselva0614@gmail.com";

    // Idempotency Key check for duplicate prevention
    const idempotencyKey = `${eventId}_Offer_${offerId}`;
    if (!isTest && sentIdempotencyKeys.has(idempotencyKey)) {
      console.log(`[NotificationService] Duplicate prevention trigger: Event ${idempotencyKey} already notified.`);
      return { skipped: true, reason: "Duplicate notification prevented by idempotency lock." };
    }

    const notificationId = `NOTIF-#${String(Date.now()).slice(-6)}`;
    const createdAt = new Date().toISOString();

    const maskedWhatsApp = maskPhoneNumber(whatsappRecipient);
    const maskedEmail = maskEmail(emailRecipient);

    // Step 10 Debugging Logs
    console.log("Selected Land / Risk Details:", {
      projectName: payload.projectName,
      surveyNumber: payload.surveyNumber,
      ownerName: payload.ownerName,
      district: payload.district,
      riskLevel: payload.riskLevel,
      delayProbability: payload.delayProbability,
      expectedDelayDays: payload.expectedDelayDays
    });
    console.log("Risk Result:", {
      riskLevel: payload.riskLevel,
      delayProbability: payload.delayProbability,
      expectedDelayDays: payload.expectedDelayDays,
      recommendedAction: payload.recommendedAction,
      riskFactors: payload.riskFactors
    });
    console.log("Email Payload Routing:", { eventId, eventType, recipient: maskedEmail, channels: activeChannels });

    // Execute active channel dispatches
    const waPromise = isWhatsAppEnabled
      ? (isTest
          ? WhatsAppService.sendPrototypeTestWhatsApp(whatsappRecipient)
          : WhatsAppService.sendWhatsAppMessage(whatsappRecipient, {
              projectName: payload.projectName,
              surveyNumber: payload.surveyNumber,
              riskLevel: payload.riskLevel,
              delayProbability: payload.delayProbability,
              expectedDelayDays: payload.expectedDelayDays,
              issue: payload.issue || `High Risk Alert for Survey ${payload.surveyNumber}`,
              recommendedAction: payload.recommendedAction
            }))
      : Promise.resolve({
          success: true,
          status: 'PENDING' as any,
          message: 'WhatsApp channel disabled in notification config.'
        });

    const emailPromise = isEmailEnabled
      ? (isTest
          ? EmailService.sendPrototypeTestEmail(emailRecipient)
          : EmailService.sendAlertEmail(emailRecipient, {
              projectName: payload.projectName,
              surveyNumber: payload.surveyNumber,
              ownerName: payload.ownerName,
              state: payload.state,
              district: payload.district,
              taluk: payload.taluk,
              village: payload.village,
              landArea: payload.landArea,
              landType: payload.landType,
              riskLevel: payload.riskLevel,
              delayProbability: payload.delayProbability,
              expectedDelayDays: payload.expectedDelayDays,
              riskFactors: payload.riskFactors,
              legalIssues: payload.legalIssues,
              documentIssues: payload.documentIssues,
              documentStatus: payload.documentStatus,
              compensationStatus: payload.compensationStatus,
              recommendedAction: payload.recommendedAction
            }))
      : Promise.resolve({
          success: true,
          status: 'PENDING' as any,
          message: 'Email channel disabled in notification config.'
        });

    const [waRes, emailRes] = await Promise.all([waPromise, emailPromise]);

    // Track idempotency after dispatch
    if (!isTest && (waRes.success || emailRes.success)) {
      sentIdempotencyKeys.add(idempotencyKey);
    }

    // Determine error summaries safely without revealing secrets
    const safeErrorMessages: string[] = [];
    if (isWhatsAppEnabled && !waRes.success) safeErrorMessages.push(`WhatsApp: ${waRes.message}`);
    if (isEmailEnabled && !emailRes.success) safeErrorMessages.push(`Email: ${emailRes.message}`);

    const historyRecord = {
      notificationId,
      eventId,
      offerId,
      recipient: {
        whatsappMasked: maskedWhatsApp,
        emailMasked: maskedEmail
      },
      channels: activeChannels,
      whatsappStatus: isWhatsAppEnabled ? waRes.status : 'PENDING',
      emailStatus: isEmailEnabled ? emailRes.status : 'PENDING',
      whatsappProviderMessageId: waRes.providerMessageId,
      emailProviderMessageId: emailRes.providerMessageId,
      errorCode: waRes.errorCode || emailRes.errorCode || undefined,
      errorMessage: safeErrorMessages.length > 0 ? safeErrorMessages.join(" | ") : undefined,
      createdAt,
      sentAt: (waRes.success || emailRes.success) ? createdAt : undefined,
      eventDetails: {
        eventType,
        projectName: payload.projectName,
        projectId: payload.projectId,
        surveyNumber: payload.surveyNumber,
        ownerName: payload.ownerName,
        district: payload.district,
        riskLevel: payload.riskLevel,
        delayProbability: payload.delayProbability,
        expectedDelayDays: payload.expectedDelayDays
      }
    };

    // Save to database & in-memory fallback list
    try {
      if (NotificationHistoryModel.db && NotificationHistoryModel.db.readyState === 1) {
        await NotificationHistoryModel.create(historyRecord);
      }
    } catch (err) {
      console.warn(`[NotificationService] Warning: Could not persist history to MongoDB:`, err);
    }

    inMemoryNotificationHistory.unshift(historyRecord);
    // Keep max 50 records in memory
    if (inMemoryNotificationHistory.length > 50) {
      inMemoryNotificationHistory.pop();
    }

    return historyRecord;
  }

  /**
   * Executes manual prototype test notification for Offer 1 using an ACTUAL HIGH-risk database record
   */
  public static async sendPrototypeTestNotification(): Promise<any> {
    const { isDbConnected, getLegacySeedData } = await import("./dataHelper");
    const { LandRecordModel } = await import("../models/LandRecord");
    const { ProjectModel } = await import("../models/Project");

    let highRiskLand: any = null;

    if (isDbConnected()) {
      highRiskLand = await LandRecordModel.findOne({
        $or: [
          { riskLevel: "High" },
          { riskLevel: "Critical" },
          { riskScore: { $gte: 60 } },
          { delayProbability: { $gte: 60 } },
          { courtCase: true }
        ]
      }).lean();
    }

    if (!highRiskLand) {
      const seed = getLegacySeedData();
      highRiskLand = (seed.parcels || []).find((p: any) =>
        p.riskLevel === "High" ||
        p.riskLevel === "Critical" ||
        (p.riskScore && p.riskScore >= 60) ||
        (p.delayProbability && p.delayProbability >= 60) ||
        p.courtCase === true
      );
    }

    if (!highRiskLand) {
      return {
        success: false,
        status: "FAILED",
        message: "No high-risk land record is available for testing."
      };
    }

    // Lookup associated project
    let project: any = null;
    if (isDbConnected() && highRiskLand.projectId) {
      project = await ProjectModel.findOne({ id: highRiskLand.projectId }).lean();
    }
    if (!project) {
      const seed = getLegacySeedData();
      project = (seed.projects || []).find((prj: any) => prj.id === highRiskLand.projectId);
    }

    const testEventId = `TEST-${Date.now()}`;
    return this.dispatchEventNotification(
      testEventId,
      "PROTOTYPE_TEST_NOTIFICATION",
      {
        projectName: project?.name || highRiskLand.projectName || highRiskLand.projectId || "Land Acquisition Corridor",
        projectId: highRiskLand.projectId,
        projectType: project?.type || "Highway Infrastructure",

        surveyNumber: highRiskLand.surveyNumber || highRiskLand.id,
        subdivisionNumber: highRiskLand.subdivisionNumber || "1A",
        ownerName: highRiskLand.ownerName || "Title Holder",

        state: highRiskLand.state || project?.state || "Tamil Nadu",
        district: highRiskLand.district || project?.district || "Kanchipuram",
        taluk: highRiskLand.taluk || (highRiskLand.location ? highRiskLand.location.split(",")[0] : "Taluk Office"),
        village: highRiskLand.village || (highRiskLand.location ? highRiskLand.location.split(",")[0] : "Village Jurisdiction"),

        landArea: highRiskLand.landArea || highRiskLand.area,
        area: highRiskLand.area || highRiskLand.landArea,
        landType: highRiskLand.landType || "Agricultural",
        purpose: "National Highway Acquisition",

        acquisitionStatus: highRiskLand.acquisitionStage || "Survey & Verification",
        compensationStatus: highRiskLand.compensationStatus || "Under Assessment",
        legalStatus: highRiskLand.legalStatus || (highRiskLand.courtCase ? "Court Stay Order" : "Clear"),
        documentStatus: highRiskLand.documentsComplete ? "Verified" : "Under Verification",
        objectionStatus: highRiskLand.objectionFiled ? "Objection Filed" : "None",
        surveyStatus: highRiskLand.surveyCompleted ? "Completed" : "In Progress",
        clearanceStatus: highRiskLand.environmentalClearance ? "Approved" : "Pending Clearance",

        riskLevel: highRiskLand.riskLevel || "High",
        delayProbability: highRiskLand.delayProbability ?? 82,
        expectedDelayDays: highRiskLand.predictedDelayDays ?? 45,
        costOverrunRisk: highRiskLand.costOverrunPercentage ? `${highRiskLand.costOverrunPercentage}% Overrun` : "Medium",
        legalRisk: highRiskLand.legalRiskLevel || "High",

        riskFactors: highRiskLand.riskFactors || [
          highRiskLand.courtCase ? "Active Court Stay Order" : "Pending Title Deed Verification",
          highRiskLand.ownershipDispute ? "Multiple Ownership Claims" : "Compensation Award Assessment",
          "Valuation Objection Pending"
        ],

        legalIssues: highRiskLand.courtCase ? "Active Court Case Injunction" : highRiskLand.ownershipDispute ? "Title Ownership Dispute" : "None",
        documentIssues: highRiskLand.documentsComplete ? "None" : "Revenue Patta Deed Mismatch",
        compensationIssues: highRiskLand.compensationStatus === "Disputed" ? "Award Objection Filed" : "Valuation Pending",
        surveyIssues: highRiskLand.surveyCompleted ? "None" : "Boundary Resurvey Demanded",

        recommendedAction: highRiskLand.recommendedAction || "Complete legal verification and compensation review.",

        latitude: highRiskLand.latitude || 11.9377,
        longitude: highRiskLand.longitude || 79.4831
      },
      true
    );
  }

  /**
   * Dispatches risk notifications by aggregating actual database records:
   * LandRecord -> Project -> Prediction -> LegalIssue -> Document -> Compensation -> Notification
   */
  public static async sendRiskNotification(params: {
    landRecordId: string;
    eventType?: string;
    recipientEmail?: string;
  }): Promise<any> {
    const { isDbConnected, getLegacySeedData } = await import("./dataHelper");
    const { LandRecordModel } = await import("../models/LandRecord");
    const { ProjectModel } = await import("../models/Project");

    let land: any = null;
    if (isDbConnected()) {
      land = await LandRecordModel.findOne({
        $or: [{ id: params.landRecordId }, { surveyNumber: params.landRecordId }]
      }).lean();
    }

    if (!land) {
      const seed = getLegacySeedData();
      land = (seed.parcels || []).find(
        (p: any) => p.id === params.landRecordId || (p.surveyNumber || "").toLowerCase() === params.landRecordId.toLowerCase()
      );
    }

    if (!land) {
      return {
        success: false,
        status: "FAILED",
        message: `Land record '${params.landRecordId}' not found in database.`
      };
    }

    let project: any = null;
    if (isDbConnected() && land.projectId) {
      project = await ProjectModel.findOne({ id: land.projectId }).lean();
    }
    if (!project) {
      const seed = getLegacySeedData();
      project = (seed.projects || []).find((prj: any) => prj.id === land.projectId);
    }

    const payload = {
      projectName: project?.name || land.projectName || land.projectId || "Land Acquisition Corridor",
      projectId: land.projectId,
      projectType: project?.type || "Highway Infrastructure",

      surveyNumber: land.surveyNumber || land.id,
      subdivisionNumber: land.subdivisionNumber || "1A",
      ownerName: land.ownerName || "Title Holder",

      state: land.state || project?.state || "Tamil Nadu",
      district: land.district || project?.district || "Kanchipuram",
      taluk: land.taluk || (land.location ? land.location.split(",")[0] : "Taluk Jurisdiction"),
      village: land.village || (land.location ? land.location.split(",")[0] : "Village Jurisdiction"),

      landArea: land.landArea || land.area,
      area: land.area || land.landArea,
      landType: land.landType || "Agricultural",
      purpose: "National Highway Expansion",

      acquisitionStatus: land.acquisitionStage || "Survey & Verification",
      compensationStatus: land.compensationStatus || "Under Assessment",
      legalStatus: land.legalStatus || (land.courtCase ? "Court Stay Order" : "Clear"),
      documentStatus: land.documentsComplete ? "Verified" : "Under Verification",
      objectionStatus: land.objectionFiled ? "Objection Filed" : "None",
      surveyStatus: land.surveyCompleted ? "Completed" : "In Progress",
      clearanceStatus: land.environmentalClearance ? "Approved" : "Pending Clearance",

      riskLevel: land.riskLevel || "High",
      delayProbability: land.delayProbability ?? 75,
      expectedDelayDays: land.predictedDelayDays ?? 45,
      costOverrunRisk: land.costOverrunPercentage ? `${land.costOverrunPercentage}% Overrun` : "Medium",
      legalRisk: land.legalRiskLevel || "High",

      riskFactors: land.riskFactors || [
        land.courtCase ? "Active Court Case Pending" : "Standard Timeline Verification",
        land.ownershipDispute ? "Title Ownership Claim Objection" : "Compensation Assessment",
        "Revenue Deed Inquiry"
      ],

      legalIssues: land.courtCase ? "Active Court Injunction Stay" : land.ownershipDispute ? "Title Dispute Active" : "None",
      documentIssues: land.documentsComplete ? "None" : "Revenue Deed Verification Pending",
      compensationIssues: land.compensationStatus === "Disputed" ? "Award Valuation Objection" : "Assessment Active",
      surveyIssues: land.surveyCompleted ? "None" : "Boundary Resurvey Flagged",

      recommendedAction: land.recommendedAction || "Conduct title deed verification and revenue officer review.",

      latitude: land.latitude || 11.9377,
      longitude: land.longitude || 79.4831,
      recipientEmail: params.recipientEmail
    };

    const eventId = `NOTIF-${Date.now()}`;
    return this.dispatchEventNotification(
      eventId,
      params.eventType || "HIGH_DELAY_RISK",
      payload,
      false
    );
  }

  /**
   * Dispatches notifications for created Alert models using actual land risk details
   */
  public static async dispatchAlertNotifications(alert: any): Promise<any> {
    const eventId = alert.id || `ALT-${Date.now()}`;
    return this.dispatchEventNotification(
      eventId,
      alert.issueType || "HIGH_DELAY_RISK",
      {
        projectName: alert.projectName || alert.projectId || "Land Acquisition Corridor",
        surveyNumber: alert.surveyNumber || alert.parcelId || "N/A",
        riskLevel: alert.priority === "High" || alert.priority === "Critical" ? "High" : "Medium",
        delayProbability: alert.delayProbability != null ? alert.delayProbability : 65,
        expectedDelayDays: alert.expectedDelayDays != null ? alert.expectedDelayDays : 45,
        issue: alert.issue || "Early Warning Risk Flagged",
        recommendedAction: alert.recommendedAction || "Investigate land survey records and legal claims.",
        district: alert.district || "Kanchipuram",
        riskFactors: alert.riskFactors || [alert.issue || "High Delay Risk"]
      }
    );
  }

  /**
   * Update notification history delivery status based on WhatsApp Cloud API Webhook payload
   */
  public static async handleWhatsAppWebhookStatusUpdate(
    providerMessageId: string,
    status: 'delivered' | 'read' | 'failed',
    timestamp?: string
  ): Promise<boolean> {
    const statusMap: Record<string, 'DELIVERED' | 'READ' | 'FAILED'> = {
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED'
    };

    const newStatus = statusMap[status];
    if (!newStatus) return false;

    const timeStr = timestamp ? new Date(parseInt(timestamp, 10) * 1000).toISOString() : new Date().toISOString();

    // 1. Update In-Memory Store
    const itemMemory = inMemoryNotificationHistory.find(
      (h) => h.whatsappProviderMessageId === providerMessageId
    );
    if (itemMemory) {
      itemMemory.whatsappStatus = newStatus;
      if (newStatus === 'DELIVERED') itemMemory.deliveredAt = timeStr;
      if (newStatus === 'READ') itemMemory.readAt = timeStr;
    }

    // 2. Update Database Record if connected
    try {
      if (NotificationHistoryModel.db && NotificationHistoryModel.db.readyState === 1) {
        const updateFields: any = { whatsappStatus: newStatus };
        if (newStatus === 'DELIVERED') updateFields.deliveredAt = timeStr;
        if (newStatus === 'READ') updateFields.readAt = timeStr;

        await NotificationHistoryModel.updateOne(
          { whatsappProviderMessageId: providerMessageId },
          { $set: updateFields }
        );
      }
    } catch (e) {
      console.error("[NotificationService] Webhook DB update exception:", e);
    }

    return true;
  }

  /**
   * Evaluates high-risk conditions for a land parcel and sends an automatic email alert via Brevo if risk >= 70%.
   * Enforces duplicate alert prevention using database state (`highRiskAlertSent`).
   */
  public static async checkAndTriggerHighRiskAlert(
    landRecordId: string,
    predictionResult?: {
      riskScore?: number;
      delayProbability?: number;
      riskLevel?: string;
      expectedDelayDays?: number;
      recommendedAction?: string;
      riskFactors?: string[];
    }
  ): Promise<{ triggered: boolean; success?: boolean; reason?: string; emailResult?: any }> {
    try {
      const { isDbConnected, getLegacySeedData } = await import("./dataHelper");
      const { LandRecordModel } = await import("../models/LandRecord");
      const { ProjectModel } = await import("../models/Project");

      let land: any = null;
      if (isDbConnected()) {
        land = await LandRecordModel.findOne({
          $or: [{ id: landRecordId }, { surveyNumber: landRecordId }]
        });
      }

      if (!land) {
        const seed = getLegacySeedData();
        land = (seed.parcels || []).find(
          (p: any) => p.id === landRecordId || (p.surveyNumber || "").toLowerCase() === landRecordId.toLowerCase()
        );
      }

      if (!land) {
        console.warn(`[HighRiskAlert] Land record '${landRecordId}' not found.`);
        return { triggered: false, reason: "LAND_NOT_FOUND" };
      }

      const effectiveRiskScore = predictionResult?.riskScore ?? land.riskScore ?? 0;
      const effectiveDelayProb = predictionResult?.delayProbability ?? land.delayProbability ?? 0;
      const isHighRisk = effectiveRiskScore >= 70 || effectiveDelayProb >= 70 || predictionResult?.riskLevel === "High" || predictionResult?.riskLevel === "Critical" || land.riskLevel === "High" || land.riskLevel === "Critical";

      if (!isHighRisk) {
        console.log(`[HighRiskAlert] Land '${land.surveyNumber || land.id}' is not high risk (Risk Score: ${effectiveRiskScore}%, Delay Prob: ${effectiveDelayProb}%). No alert triggered.`);
        return { triggered: false, reason: "NOT_HIGH_RISK" };
      }

      // Check duplicate alert flag
      if (land.highRiskAlertSent) {
        console.log(`[HighRiskAlert] Alert already sent for Land '${land.surveyNumber || land.id}' at ${land.highRiskAlertSentAt}. Skipping duplicate dispatch.`);
        return { triggered: false, reason: "ALERT_ALREADY_SENT" };
      }

      let project: any = null;
      if (isDbConnected() && land.projectId) {
        project = await ProjectModel.findOne({ id: land.projectId }).lean();
      }
      if (!project) {
        const seed = getLegacySeedData();
        project = (seed.projects || []).find((prj: any) => prj.id === land.projectId);
      }

      const emailPayload = {
        projectName: project?.name || land.projectName || land.projectId || "Land Acquisition Corridor",
        projectId: land.projectId,
        projectType: project?.type || "Highway Infrastructure",

        surveyNumber: land.surveyNumber || land.id,
        subdivisionNumber: land.subdivisionNumber || "1A",
        ownerName: land.ownerName || "Title Holder",

        state: land.state || project?.state || "Tamil Nadu",
        district: land.district || project?.district || "Kanchipuram",
        taluk: land.taluk || (land.location ? land.location.split(",")[0] : "Taluk Jurisdiction"),
        village: land.village || (land.location ? land.location.split(",")[0] : "Village Jurisdiction"),

        landArea: land.landArea || land.area,
        area: land.area || land.landArea,
        landType: land.landType || "Agricultural",
        purpose: "National Highway Expansion",

        acquisitionStatus: land.acquisitionStage || "Survey & Verification",
        compensationStatus: land.compensationStatus || "Under Assessment",
        legalStatus: land.legalStatus || (land.courtCase ? "Court Stay Order" : "Clear"),
        documentStatus: land.documentsComplete ? "Verified" : "Under Verification",
        objectionStatus: land.objectionFiled ? "Objection Filed" : "None",
        surveyStatus: land.surveyCompleted ? "Completed" : "In Progress",
        clearanceStatus: land.environmentalClearance ? "Approved" : "Pending Clearance",

        riskLevel: predictionResult?.riskLevel || land.riskLevel || "High",
        delayProbability: effectiveDelayProb,
        expectedDelayDays: predictionResult?.expectedDelayDays ?? land.predictedDelayDays ?? 45,
        costOverrunRisk: land.costOverrunPercentage ? `${land.costOverrunPercentage}% Overrun` : "Medium",
        legalRisk: land.legalRiskLevel || "High",

        riskFactors: predictionResult?.riskFactors || land.riskFactors || [
          land.courtCase ? "Active Court Case Pending" : "High Delay Risk Threshold Met (>= 70%)",
          land.ownershipDispute ? "Title Ownership Claim Objection" : "Acquisition Schedule Delay Flagged"
        ],

        legalIssues: land.courtCase ? "Active Court Injunction Stay" : land.ownershipDispute ? "Title Dispute Active" : "None",
        documentIssues: land.documentsComplete ? "None" : "Revenue Deed Verification Pending",
        compensationIssues: land.compensationStatus === "Disputed" ? "Award Valuation Objection" : "Assessment Active",
        surveyIssues: land.surveyCompleted ? "None" : "Boundary Resurvey Flagged",

        recommendedAction: predictionResult?.recommendedAction || land.recommendedAction || "Immediate intervention required: Verify title deeds and resolve compensation objections.",

        latitude: land.latitude || 11.9377,
        longitude: land.longitude || 79.4831
      };

      console.log(`[HighRiskAlert] Dispatching automatic high risk email alert for Survey #${emailPayload.surveyNumber}...`);
      const emailResult = await EmailService.sendHighRiskLandAlert(emailPayload);

      const now = new Date();
      if (emailResult.success) {
        if (isDbConnected() && typeof land.save === "function") {
          land.highRiskAlertSent = true;
          land.highRiskAlertSentAt = now;
          land.lastAlertStatus = 'SENT';
          land.lastAlertError = undefined;
          await land.save();
        } else if (isDbConnected()) {
          await LandRecordModel.updateOne(
            { _id: land._id },
            {
              $set: {
                highRiskAlertSent: true,
                highRiskAlertSentAt: now,
                lastAlertStatus: 'SENT',
                lastAlertError: null
              }
            }
          );
        } else {
          land.highRiskAlertSent = true;
          land.highRiskAlertSentAt = now.toISOString();
          land.lastAlertStatus = 'SENT';
        }

        console.log(`[HighRiskAlert] High risk alert successfully sent and DB updated for Land '${land.surveyNumber || land.id}'.`);
        return { triggered: true, success: true, emailResult };
      } else {
        if (isDbConnected() && typeof land.save === "function") {
          land.lastAlertStatus = 'FAILED';
          land.lastAlertError = emailResult.message;
          await land.save();
        } else if (isDbConnected()) {
          await LandRecordModel.updateOne(
            { _id: land._id },
            {
              $set: {
                lastAlertStatus: 'FAILED',
                lastAlertError: emailResult.message
              }
            }
          );
        } else {
          land.lastAlertStatus = 'FAILED';
          land.lastAlertError = emailResult.message;
        }

        console.error(`[HighRiskAlert] High risk alert failed for Land '${land.surveyNumber || land.id}': ${emailResult.message}`);
        return { triggered: true, success: false, reason: emailResult.message, emailResult };
      }
    } catch (err: any) {
      console.error(`[HighRiskAlert] Exception in checkAndTriggerHighRiskAlert:`, err);
      return { triggered: false, reason: err.message || "INTERNAL_EXCEPTION" };
    }
  }
}
