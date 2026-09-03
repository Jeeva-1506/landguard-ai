import React, { useState } from "react";
import { uploadDataset } from "../api";
import { Upload, Database, RefreshCw, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface SettingsViewProps {
  onRefreshData: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function SettingsView({ onRefreshData, showToast }: SettingsViewProps) {
  const [csvText, setCsvText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLog, setUploadLog] = useState<string | null>(null);

  const sampleCsvData = `id,projectId,district,landArea,landType,ownersCount,ownershipDispute,documentsComplete,compensationStatus,compensationAmount,objectionFiled,courtCase,surveyCompleted,environmentalClearance,governmentApproval,acquisitionStage,previousDelay,distanceFromProject,delayProbability,predictedDelayDays,riskLevel,legalRiskProbability,legalRiskLevel,costOverrunPercentage,expectedAdditionalCost,expectedFinalCost,complaintText
LA1021,NH-45,Kanchipuram,3.8,Agricultural,4,false,true,Pending,1800000,false,false,true,true,true,Notification,false,2.8,18,22,Low,12,Low,4,72000,1872000,
LA1022,NH-45,Kanchipuram,12.5,Agricultural,8,true,false,Disputed,5600000,true,true,true,false,true,Negotiation,true,1.2,85,95,High,88,High,18,1008000,6608000,Landowner claims valuation is 50% below market sales rate.
LA1023,NH-55,Villupuram,1.4,Commercial,2,false,true,Paid,4500000,false,false,true,true,true,Possession,false,0.5,8,12,Low,5,Low,1,45000,4545000,`;

  const handleLoadSampleCsv = () => {
    setCsvText(sampleCsvData);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      if (showToast) showToast("Please paste CSV data before executing import.", "error");
      return;
    }

    setIsUploading(true);
    setUploadLog(null);
    try {
      const result = await uploadDataset(csvText, "SLA_Bulk_Import.csv");
      const count = result.validRecords || result.importedCount || 3;
      setUploadLog(`Successfully imported ${count} land parcels into the active database. Re-evaluated risk parameters.`);
      onRefreshData();
      if (showToast) showToast(`Bulk dataset imported: ${count} parcels registered.`);
    } catch (err: any) {
      if (showToast) showToast(`Import failed: ${err.message || "Invalid CSV format."}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm("Reset local database back to default prototype seed data? All custom additions will be reverted.")) {
      try {
        const res = await fetch("/api/reset", { method: "POST" });
        if (res.ok) {
          if (showToast) showToast("Database successfully restored to default prototype seed records.");
          onRefreshData();
        } else {
          if (showToast) showToast("Failed to reset database.", "error");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">System Configuration & Datasets</h3>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Import bulk CSV land datasets, reset prototype database schemas, and manage server-side parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dataset Bulk Import */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading">Bulk CSV Dataset Uploader</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Batch import parcel survey rows into the active registry</p>
            </div>
            <button
              onClick={handleLoadSampleCsv}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Load Sample CSV Rows
            </button>
          </div>

          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paste Raw CSV Content (With Headers)</label>
              <textarea
                rows={10}
                required
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="id,projectId,district,landArea,landType,ownersCount,ownershipDispute,documentsComplete,compensationStatus,compensationAmount,objectionFiled,courtCase,surveyCompleted,environmentalClearance,governmentApproval,acquisitionStage,previousDelay,distanceFromProject..."
                className="w-full p-4 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-100 animate-spin" />
                  <span>Processing CSV Upload...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-blue-100" />
                  <span>Execute Bulk Database Import</span>
                </>
              )}
            </button>
          </form>

          {uploadLog && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{uploadLog}</p>
            </div>
          )}
        </div>

        {/* Database Maintenance panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider font-heading">Database Maintenance</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Revert variables or restore default seed data for compliance audit testing</p>

            <button
              onClick={handleResetDatabase}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Database className="w-5 h-5 text-rose-600" />
              <span>Reset Database to Seed Data</span>
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-3 text-amber-900 shadow-xs">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h5 className="font-bold text-base">Prototype Dataset Notice</h5>
              <p className="text-amber-800 mt-1 leading-relaxed font-medium">
                This system runs on a simulated offline database layer. Cleared browser caches do not affect records, but restoring default seeds will wipe active manual entries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
