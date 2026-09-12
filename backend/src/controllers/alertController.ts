import { Request, Response } from "express";
import { AlertModel } from "../models/Alert";
import { NotificationService } from "../services/notificationService";
import { isDbConnected, getLegacySeedData } from "../services/dataHelper";

export const getAlerts = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const alerts = await AlertModel.find().sort({ createdAt: -1 }).lean();
      return res.json(alerts);
    }
    const seed = getLegacySeedData();
    return res.json(seed.alerts || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch early warning alerts" });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const alertData = req.body;
    if (!alertData.id) alertData.id = `ALT-${Date.now()}`;
    if (!alertData.timestamp) alertData.timestamp = new Date().toISOString();
    if (!alertData.issueType) alertData.issueType = "HIGH_DELAY_RISK";

    if (isDbConnected()) {
      const created = await AlertModel.create(alertData);
      NotificationService.dispatchAlertNotifications(created);
      return res.status(201).json(created);
    }

    return res.status(201).json(alertData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create early warning alert" });
  }
};

export const markAlertRead = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const updated = await AlertModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: { read: true } },
        { new: true }
      );
      if (updated) return res.json(updated);
    }
    return res.json({ id: req.params.id, read: true, status: "Open" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to mark alert as read" });
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const updated = await AlertModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: { status: "Resolved", read: true } },
        { new: true }
      );
      if (updated) return res.json(updated);
    }
    return res.json({ id: req.params.id, status: "Resolved", read: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to resolve alert" });
  }
};

export const testHighRiskEmailAlert = async (req: Request, res: Response) => {
  try {
    const { landRecordId, toEmail } = req.body || {};
    
    // Find or pick a high risk land if not specified
    let targetLandId = landRecordId;
    if (!targetLandId) {
      if (isDbConnected()) {
        const { LandRecordModel } = await import("../models/LandRecord");
        const highLand = await LandRecordModel.findOne({
          $or: [{ riskScore: { $gte: 70 } }, { delayProbability: { $gte: 70 } }, { riskLevel: "High" }, { courtCase: true }]
        }).lean();
        if (highLand) targetLandId = highLand.id || highLand.surveyNumber;
      }
    }
    if (!targetLandId) targetLandId = "LA1021";

    const result = await NotificationService.checkAndTriggerHighRiskAlert(targetLandId, {
      riskScore: 85,
      delayProbability: 85,
      riskLevel: "High",
      expectedDelayDays: 45,
      recommendedAction: "High Risk Automated Alert Test: Verify land titles and initiate legal intervention.",
      riskFactors: ["Automated High Risk Email Alert Test", "Risk Score >= 70% Trigger"]
    });

    return res.json({
      message: "High risk email alert test trigger completed",
      targetLandId,
      result
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to trigger test high risk email alert" });
  }
};
