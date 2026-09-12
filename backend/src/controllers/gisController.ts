import { Request, Response } from "express";
import { LandRecordModel } from "../models/LandRecord";
import { ProjectModel } from "../models/Project";

export const getGisLands = async (req: Request, res: Response) => {
  try {
    const lands = await LandRecordModel.find().lean();
    
    // Format as GeoJSON FeatureCollection
    const features = lands.map((land) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: land.polygon && land.polygon.length ? [land.polygon.map(pt => [pt[1], pt[0]])] : [
          [
            [(land.longitude || 79.4831) - 0.001, (land.latitude || 11.9377) - 0.001],
            [(land.longitude || 79.4831) + 0.001, (land.latitude || 11.9377) - 0.001],
            [(land.longitude || 79.4831) + 0.001, (land.latitude || 11.9377) + 0.001],
            [(land.longitude || 79.4831) - 0.001, (land.latitude || 11.9377) + 0.001],
            [(land.longitude || 79.4831) - 0.001, (land.latitude || 11.9377) - 0.001]
          ]
        ]
      },
      properties: {
        id: land.id,
        surveyNumber: land.surveyNumber || land.id,
        ownerName: land.ownerName,
        landArea: land.landArea,
        acquisitionStatus: land.acquisitionStage,
        compensationStatus: land.compensationStatus,
        legalStatus: land.legalStatus || 'Clear',
        documentStatus: land.documentsComplete ? 'Complete' : 'Incomplete',
        riskLevel: land.riskLevel,
        delayProbability: land.delayProbability,
        isSynthetic: true // Explicitly marked as DEMO/SYNTHETIC GIS DATA per requirements
      }
    }));

    return res.json({
      type: "FeatureCollection",
      dataDisclaimer: "DEMO/SYNTHETIC CADASTRAL BOUNDARY DATA FOR PREDICTIVE ANALYTICS DECISION SUPPORT",
      features
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch GIS land features" });
  }
};

export const getGisProjects = async (req: Request, res: Response) => {
  try {
    const projects = await ProjectModel.find().lean();
    return res.json(projects);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch GIS project layers" });
  }
};

export const getGisLandById = async (req: Request, res: Response) => {
  try {
    const land = await LandRecordModel.findOne({ id: req.params.id }).lean();
    if (!land) {
      return res.status(404).json({ error: "Land GIS record not found" });
    }
    return res.json(land);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch land GIS record" });
  }
};
