import { Request, Response } from "express";
import { PredictionModel } from "../models/Prediction";
import { LandRecordModel } from "../models/LandRecord";
import { NotificationService } from "../services/notificationService";

export const predictDelay = async (req: Request, res: Response) => {
  try {
    const parcelData = req.body;
    const ML_URL = process.env.PYTHON_ML_SERVICE_URL || "http://localhost:8000";

    let result: any = null;

    try {
      const response = await fetch(`${ML_URL}/predict/delay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parcelData)
      });
      if (response.ok) {
        result = await response.json();
      }
    } catch (e) {
      console.warn("Python ML Microservice unreachable, falling back to embedded ML rules engine.");
    }

    if (!result) {
      // Heuristic Fallback
      const court = !!parcelData.courtCase;
      const dispute = !!parcelData.ownershipDispute;
      const objection = !!parcelData.objectionFiled;
      
      let prob = 20 + (court ? 35 : 0) + (dispute ? 25 : 0) + (objection ? 15 : 0);
      prob = Math.min(98, Math.max(12, prob));
      const riskLevel = prob > 65 ? "High" : (prob > 35 ? "Medium" : "Low");
      const expectedDelayDays = 25 + (court ? 85 : 0) + (dispute ? 40 : 0);

      result = {
        delayProbability: prob,
        riskScore: prob,
        riskLevel,
        expectedDelayDays,
        riskFactors: [
          { factor: court ? "Active Court Case" : "Standard Timeline", weight: court ? "+35%" : "0%", category: "Legal" }
        ],
        recommendedActions: [
          court ? "Accelerate legal representation in high court." : "Proceed with 3D notification."
        ],
        modelVersion: "v1.2.0-fallback-rules"
      };
    }

    // Trigger high-risk email alert asynchronously if riskScore / delayProbability >= 70
    const landRecordId = parcelData.id || parcelData.parcelId || parcelData.surveyNumber;
    if (landRecordId) {
      const riskScore = result.riskScore ?? result.delayProbability ?? result.delay_probability ?? 0;
      const delayProb = result.delayProbability ?? result.delay_probability ?? riskScore;
      
      NotificationService.checkAndTriggerHighRiskAlert(landRecordId, {
        riskScore,
        delayProbability: delayProb,
        riskLevel: result.riskLevel || result.risk_level,
        expectedDelayDays: result.expectedDelayDays || result.predicted_delay_days,
        recommendedAction: Array.isArray(result.recommendedActions) ? result.recommendedActions[0] : result.recommendedAction,
        riskFactors: Array.isArray(result.riskFactors)
          ? result.riskFactors.map((rf: any) => typeof rf === 'string' ? rf : (rf.factor || JSON.stringify(rf)))
          : undefined
      }).catch(err => console.error("[PredictionController] High Risk Alert async error:", err));
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to calculate delay prediction" });
  }
};

export const predictCost = async (req: Request, res: Response) => {
  try {
    const parcelData = req.body;
    const ML_URL = process.env.PYTHON_ML_SERVICE_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${ML_URL}/predict/cost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parcelData)
      });
      if (response.ok) {
        const mlResult = await response.json();
        return res.json(mlResult);
      }
    } catch (e) {
      console.warn("Python ML Microservice unreachable, using fallback for cost prediction.");
    }

    const comp = Number(parcelData.compensationAmount) || 1000000;
    const rate = 0.05 + (parcelData.courtCase ? 0.15 : 0);
    const expectedAdditionalCost = Math.round(comp * rate);

    return res.json({
      estimatedAdditionalCost: expectedAdditionalCost,
      expectedFinalCost: comp + expectedAdditionalCost,
      costOverrunPercentage: parseFloat((rate * 100).toFixed(1)),
      riskLevel: rate > 0.15 ? "High" : "Medium"
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to calculate cost prediction" });
  }
};

export const predictLegal = async (req: Request, res: Response) => {
  try {
    const parcelData = req.body;
    const court = !!parcelData.courtCase;
    const dispute = !!parcelData.ownershipDispute;
    const legalRiskProbability = court ? 90 : (dispute ? 65 : 20);

    return res.json({
      legalRiskProbability,
      legalRiskLevel: legalRiskProbability > 65 ? "High" : "Low",
      riskFactors: [
        { factor: dispute ? "Title Dispute" : "Verified Documents", weight: dispute ? "+25%" : "0%", category: "Legal" }
      ],
      recommendedActions: [
        "Potential legal risk detected. Human/legal verification required."
      ]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to calculate legal risk" });
  }
};

export const getPredictionsForLand = async (req: Request, res: Response) => {
  try {
    const history = await PredictionModel.find({ parcelId: req.params.landId }).lean();
    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch land predictions history" });
  }
};
