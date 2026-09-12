import { Request, Response } from "express";
import { DocumentModel } from "../models/Document";
import { DocumentAiProcessor } from "../services/documentAiService";

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await DocumentModel.find().lean();
    return res.json(docs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch document analyses" });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findOne({ id: req.params.id }).lean();
    if (!doc) {
      return res.status(404).json({ error: "Document analysis record not found" });
    }
    return res.json(doc);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch document analysis" });
  }
};

export const uploadAndAnalyzeDocument = async (req: Request, res: Response) => {
  try {
    const { text, parcelId, name } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Document text content is required" });
    }

    const extracted = DocumentAiProcessor.extractFieldsFromText(text);
    const targetParcelId = parcelId || extracted.surveyNumber || "LA1024";
    const discrepancy = await DocumentAiProcessor.compareWithDatabase(targetParcelId, extracted);

    const docId = `DOC-${Date.now()}`;
    const newDoc = await DocumentModel.create({
      id: docId,
      name: name || `Document_Analysis_${docId}.pdf`,
      parcelId: targetParcelId,
      surveyNumber: extracted.surveyNumber || "124/2",
      text,
      category: discrepancy.discrepancyCategory !== 'NONE' ? 'Documentation Issue' : 'Other',
      risk: discrepancy.riskImpact,
      riskClassification: discrepancy.riskImpact,
      verificationStatus: discrepancy.verificationStatus,
      issuesDetected: discrepancy.issuesDetected.join("; "),
      confidence: 85,
      importantTerms: ["Patta", "Landowner", "Survey Record"],
      uploadDate: new Date().toLocaleDateString()
    });

    return res.status(201).json({
      ...newDoc.toObject(),
      extractedFields: extracted,
      discrepancyAnalysis: discrepancy
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to upload and analyze document" });
  }
};

export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const { verificationStatus } = req.body;
    const updated = await DocumentModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { verificationStatus: verificationStatus || "Verified" } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Document not found to verify" });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to verify document" });
  }
};
