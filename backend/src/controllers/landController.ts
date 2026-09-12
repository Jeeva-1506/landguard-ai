import { Request, Response } from "express";
import { LandRecordModel } from "../models/LandRecord";
import { isDbConnected, getLegacySeedData } from "../services/dataHelper";

export const getLands = async (req: Request, res: Response) => {
  try {
    const { district, riskLevel, search, surveyNumber } = req.query;
    const seed = getLegacySeedData();

    if (isDbConnected()) {
      const filter: any = {};
      if (district) filter.district = district;
      if (riskLevel) filter.riskLevel = riskLevel;
      if (surveyNumber) filter.surveyNumber = new RegExp(String(surveyNumber), "i");
      if (search) {
        const regex = new RegExp(String(search), "i");
        filter.$or = [{ ownerName: regex }, { surveyNumber: regex }, { district: regex }, { village: regex }];
      }
      const lands = await LandRecordModel.find(filter).lean();
      if (lands && lands.length >= (seed.parcels || []).length) {
        return res.json(lands);
      }
    }

    // Hybrid fallback mode
    let parcels = seed.parcels || [];
    if (district) parcels = parcels.filter((p: any) => p.district === district);
    if (riskLevel) parcels = parcels.filter((p: any) => p.riskLevel === riskLevel);
    if (surveyNumber) parcels = parcels.filter((p: any) => (p.surveyNumber || "").toLowerCase().includes(String(surveyNumber).toLowerCase()));

    return res.json(parcels);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch land records" });
  }
};

export const getLandById = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const land = await LandRecordModel.findOne({ id: req.params.id }).lean();
      if (land) return res.json(land);
    }

    const seed = getLegacySeedData();
    const found = (seed.parcels || []).find((p: any) => p.id === req.params.id);
    if (found) return res.json(found);

    return res.status(404).json({ error: "Land record not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch land record" });
  }
};

export const getLandBySurveyNumber = async (req: Request, res: Response) => {
  try {
    const surveyNumber = req.params.surveyNumber;
    if (isDbConnected()) {
      const land = await LandRecordModel.findOne({ surveyNumber }).lean();
      if (land) return res.json(land);
    }

    const seed = getLegacySeedData();
    const found = (seed.parcels || []).find((p: any) => (p.surveyNumber || "").toLowerCase() === surveyNumber.toLowerCase());
    if (found) return res.json(found);

    return res.status(404).json({ error: `Land parcel with survey number ${surveyNumber} not found` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch land parcel by survey number" });
  }
};

export const createLand = async (req: Request, res: Response) => {
  try {
    const landData = req.body;
    if (!landData.id) landData.id = `LA${Date.now()}`;

    if (isDbConnected()) {
      const created = await LandRecordModel.create(landData);
      return res.status(201).json(created);
    }

    return res.status(201).json(landData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create land parcel" });
  }
};

export const updateLand = async (req: Request, res: Response) => {
  try {
    const landData = req.body;
    if (isDbConnected()) {
      const updated = await LandRecordModel.findOneAndUpdate({ id: req.params.id }, { $set: landData }, { new: true });
      if (updated) return res.json(updated);
    }
    return res.json({ id: req.params.id, ...landData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update land parcel" });
  }
};

export const deleteLand = async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      await LandRecordModel.findOneAndDelete({ id: req.params.id });
    }
    return res.json({ success: true, message: "Land parcel deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete land parcel" });
  }
};
