import { Request, Response } from "express";
import { ProjectModel } from "../models/Project";
import { LandRecordModel } from "../models/LandRecord";
import { PdfReportService } from "../services/pdfReportService";
import { EmailService } from "../services/emailService";

export const generateProjectPdfReport = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      return res.status(404).json({ error: "Project not found for PDF report generation" });
    }

    const parcels = await LandRecordModel.find({ projectId });
    const pdfBuffer = await PdfReportService.generateProjectReport(project, parcels);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Project_Report_${projectId}.pdf`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate project PDF report" });
  }
};

export const generateLandPdfReport = async (req: Request, res: Response) => {
  try {
    const landId = req.params.id;
    const parcel = await LandRecordModel.findOne({ id: landId });
    if (!parcel) {
      return res.status(404).json({ error: "Land record not found for PDF report generation" });
    }

    const pdfBuffer = await PdfReportService.generateLandParcelReport(parcel);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Land_Parcel_Dossier_${landId}.pdf`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate land parcel PDF report" });
  }
};

export const sendAuditPdfReportEmail = async (req: Request, res: Response) => {
  try {
    const { recipientEmail, title, date, meta, metrics, bodyText, templateId } = req.body;
    const targetEmail = recipientEmail || process.env.ALERT_RECEIVER_EMAIL || "jeevaselva0614@gmail.com";

    // Generate PDF Buffer
    const pdfBuffer = await PdfReportService.generateAuditPdf({
      title: title || "Land Acquisition Official Audit Report",
      date: date || new Date().toLocaleDateString(),
      meta,
      metrics,
      bodyText
    });

    const filename = `SLA_Audit_Report_${(templateId || 'Official').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Dispatch Email via Brevo API with PDF Attachment
    const dispatchResult = await EmailService.sendAlertEmail(
      targetEmail,
      {
        projectName: title || "Land Acquisition Report",
        surveyNumber: templateId || "SLA Audit",
        district: "Tamil Nadu Revenue Department",
        riskLevel: "AUDIT_REPORT",
        delayProbability: 0,
        expectedDelayDays: 0,
        recommendedAction: `Find attached official PDF report: ${filename}`,
        pdfBuffer,
        pdfFilename: filename
      },
      `📄 Official SLA PDF Audit Report Attached: ${title || "Land Acquisition Dossier"}`
    );

    return res.json({
      success: dispatchResult.success,
      message: dispatchResult.message,
      emailResult: dispatchResult,
      filename
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to send PDF report email" });
  }
};
