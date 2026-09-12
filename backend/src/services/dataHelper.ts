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
  if (cachedJsonData) return cachedJsonData;
  const dbFile = path.join(__dirname, "../../../database/data/db.json");
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, "utf-8");
      cachedJsonData = JSON.parse(raw);
      if (cachedJsonData && cachedJsonData.landParcels && !cachedJsonData.parcels) {
        cachedJsonData.parcels = cachedJsonData.landParcels;
      }
      return cachedJsonData;
    } catch (e) {
      return { projects: [], parcels: [], landParcels: [], alerts: [], documents: [] };
    }
  }
  return { projects: [], parcels: [], landParcels: [], alerts: [], documents: [] };
}
