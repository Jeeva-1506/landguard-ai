import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../../backend/src/config/db";
import { ProjectModel } from "../../backend/src/models/Project";
import { LandRecordModel } from "../../backend/src/models/LandRecord";
import { AlertModel } from "../../backend/src/models/Alert";
import { DocumentModel } from "../../backend/src/models/Document";
import { PredictionModel } from "../../backend/src/models/Prediction";
import { UserModel } from "../../backend/src/models/User";
import { CompensationModel } from "../../backend/src/models/Compensation";
import bcrypt from "bcryptjs";

dotenv.config();

export async function runMigration() {
  console.log("🚀 Starting MongoDB Seed Migration...");

  const isConnected = await connectDB();
  if (!isConnected) {
    console.error("❌ Migration aborted: Could not connect to MongoDB.");
    process.exit(1);
  }

  const dbPath = path.join(__dirname, "../data/db.json");
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Legacy data file not found at: ${dbPath}`);
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(dbPath, "utf-8");
    const seedData = JSON.parse(rawData);

    // 1. Migrate Projects
    if (Array.isArray(seedData.projects)) {
      console.log(`📦 Migrating ${seedData.projects.length} Projects...`);
      for (const p of seedData.projects) {
        await ProjectModel.updateOne({ id: p.id }, { $set: p }, { upsert: true });
      }
      console.log("✅ Projects migration completed.");
    }

    // 2. Migrate Parcels / Land Records
    if (Array.isArray(seedData.parcels)) {
      console.log(`📦 Migrating ${seedData.parcels.length} Land Records...`);
      for (const parcel of seedData.parcels) {
        await LandRecordModel.updateOne({ id: parcel.id }, { $set: parcel }, { upsert: true });
        
        // Also auto-create Compensation record if compensationAmount is available
        if (parcel.compensationAmount) {
          const compStatus = parcel.compensationStatus === 'Paid' ? 'PAID' : parcel.compensationStatus === 'Disputed' ? 'DISPUTED' : 'PENDING';
          await CompensationModel.updateOne(
            { id: `COMP-${parcel.id}` },
            {
              $set: {
                id: `COMP-${parcel.id}`,
                parcelId: parcel.id,
                surveyNumber: parcel.surveyNumber || `SURVEY-${parcel.id}`,
                estimatedAmount: parcel.compensationAmount,
                offeredAmount: Math.round(parcel.compensationAmount * 0.95),
                paidAmount: compStatus === 'PAID' ? parcel.compensationAmount : 0,
                pendingAmount: compStatus === 'PAID' ? 0 : parcel.compensationAmount,
                status: compStatus
              }
            },
            { upsert: true }
          );
        }
      }
      console.log("✅ Land Records migration completed.");
    }

    // 3. Migrate Alerts
    if (Array.isArray(seedData.alerts)) {
      console.log(`📦 Migrating ${seedData.alerts.length} Alerts...`);
      for (const alert of seedData.alerts) {
        await AlertModel.updateOne({ id: alert.id }, { $set: alert }, { upsert: true });
      }
      console.log("✅ Alerts migration completed.");
    }

    // 4. Migrate Documents
    if (Array.isArray(seedData.documents)) {
      console.log(`📦 Migrating ${seedData.documents.length} Documents...`);
      for (const doc of seedData.documents) {
        await DocumentModel.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
      }
      console.log("✅ Documents migration completed.");
    }

    // 5. Seed Default Admin & Officer Users
    console.log("👤 Seeding initial default administrative users...");
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("admin123", salt);

    const defaultUsers = [
      {
        id: "USR-001",
        email: "admin@landguard.gov.in",
        passwordHash: defaultPassword,
        name: "District Collector / Lead Officer",
        role: "ADMIN",
        department: "Land Acquisition Department",
        district: "All"
      },
      {
        id: "USR-002",
        email: "revenue@landguard.gov.in",
        passwordHash: defaultPassword,
        name: "Revenue Divisional Officer",
        role: "REVENUE_OFFICER",
        department: "Revenue Department",
        district: "Chennai"
      },
      {
        id: "USR-003",
        email: "survey@landguard.gov.in",
        passwordHash: defaultPassword,
        name: "Chief Land Inspector",
        role: "SURVEY_OFFICER",
        department: "Survey & Settlement",
        district: "Coimbatore"
      },
      {
        id: "USR-004",
        email: "legal@landguard.gov.in",
        passwordHash: defaultPassword,
        name: "Senior Legal Advocate",
        role: "LEGAL_OFFICER",
        department: "Legal Cell",
        district: "All"
      }
    ];

    for (const u of defaultUsers) {
      await UserModel.updateOne({ email: u.email }, { $set: u }, { upsert: true });
    }
    console.log("✅ Administrative Users seeded successfully.");

    console.log("🎉 Migration process completed successfully!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Migration failed with error:", err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}
