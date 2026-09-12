import { Request, Response } from "express";
import { ProjectModel } from "../models/Project";
import { LandRecordModel } from "../models/LandRecord";
import { AlertModel } from "../models/Alert";
import { DocumentModel } from "../models/Document";
import { CompensationModel } from "../models/Compensation";
import { isDbConnected, getLegacySeedData } from "../services/dataHelper";

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    let projects: any[] = [];
    let parcels: any[] = [];
    let alerts: any[] = [];
    let documents: any[] = [];
    let compensations: any[] = [];

    if (isDbConnected()) {
      projects = await ProjectModel.find().lean();
      parcels = await LandRecordModel.find().lean();
      alerts = await AlertModel.find({ status: { $ne: "Resolved" } }).lean();
      documents = await DocumentModel.find().lean();
      compensations = await CompensationModel.find().lean();
    } else {
      const seed = getLegacySeedData();
      projects = seed.projects || [];
      parcels = seed.parcels || [];
      alerts = seed.alerts || [];
      documents = seed.documents || [];
    }

    const totalProjects = projects.length;
    const totalParcels = parcels.length;

    const landRequired = projects.reduce((acc, p) => acc + (p.landRequired || 0), 0);
    const landAcquired = projects.reduce((acc, p) => acc + (p.landAcquired || 0), 0);
    const landPending = Math.max(0, landRequired - landAcquired);

    const highRiskCount = parcels.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical").length;
    const legalIssuesCount = parcels.filter(p => p.courtCase || p.ownershipDispute || p.legalStatus === "Court Stay Order").length;
    const documentIssuesCount = documents.filter(d => d.verificationStatus === "Mismatch" || d.verificationStatus === "Requires Review").length;

    const pendingCompRecords = parcels.filter(p => p.compensationStatus === "Pending" || p.compensationStatus === "Disputed");
    const compensationPendingAmount = pendingCompRecords.reduce((acc, p) => acc + (p.compensationAmount || 0), 0);
    const compensationPendingCount = pendingCompRecords.length;

    const avgDelayDays = parcels.length > 0
      ? Math.round(parcels.reduce((acc, p) => acc + (p.predictedDelayDays || 0), 0) / parcels.length)
      : 35;

    const riskBreakdown = {
      High: parcels.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical").length,
      Medium: parcels.filter(p => p.riskLevel === "Medium").length,
      Low: parcels.filter(p => p.riskLevel === "Low").length
    };

    return res.json({
      summary: {
        totalProjects,
        totalParcels,
        landRequired: parseFloat(landRequired.toFixed(1)),
        landAcquired: parseFloat(landAcquired.toFixed(1)),
        landPending: parseFloat(landPending.toFixed(1)),
        highRiskLandsCount: highRiskCount,
        legalIssuesCount,
        documentIssuesCount,
        compensationPendingCount,
        compensationPendingAmount,
        compensationPendingCrores: parseFloat((compensationPendingAmount / 10000000).toFixed(2)),
        avgDelayDays,
        openAlertsCount: alerts.length
      },
      riskBreakdown,
      projectsSummary: projects.map(p => ({ id: p.id, name: p.name, progress: p.progress, risk: p.delayRisk }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch dashboard analytics aggregates" });
  }
};
