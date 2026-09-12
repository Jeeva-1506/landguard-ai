import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : __filename;
const __dirname = typeof import.meta !== "undefined" && import.meta.url ? path.dirname(__filename) : __dirname;

let cachedJsonData: any = null;

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getLegacySeedData(): any {
  const dbFile = path.join(__dirname, "../../../database/data/db.json");
  const datasetFile = path.join(__dirname, "../../../database/data/new_land_dataset.json");
  let data: any = { projects: [], parcels: [], landParcels: [], alerts: [], documents: [] };

  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, "utf-8");
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Error reading db.json:", e);
    }
  }

  const parcelMap = new Map<string, any>();
  if (Array.isArray(data.parcels)) {
    data.parcels.forEach((p: any) => parcelMap.set(p.id, p));
  }

  if (fs.existsSync(datasetFile)) {
    try {
      const rawDataset = fs.readFileSync(datasetFile, "utf-8");
      const parsedDataset = JSON.parse(rawDataset);
      if (parsedDataset && Array.isArray(parsedDataset.parcels)) {
        parsedDataset.parcels.forEach((p: any) => parcelMap.set(p.id, p));
      }
    } catch (e) {
      console.error("Error reading new_land_dataset.json:", e);
    }
  }

  const combinedParcels = Array.from(parcelMap.values());
  data.parcels = combinedParcels;
  data.landParcels = combinedParcels;

  return data;
}
