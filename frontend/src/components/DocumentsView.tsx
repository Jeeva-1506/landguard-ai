import React, { useState } from "react";
import { DocumentAnalysis, LandParcel } from "../types";
import { FileText, CheckCircle2, Clock, AlertTriangle, XCircle, Search, Upload, Sparkles } from "lucide-react";
import { analyzeDocument } from "../api";

interface DocumentsViewProps {
  onUpdateParcel: (id: string, payload: Partial<LandParcel>) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function DocumentsView({ onUpdateParcel, showToast }: DocumentsViewProps) {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Sample document verification list
  const documentList: DocumentAnalysis[] = [
    {
      id: "DOC-101",
      name: "Land Record (Patta #412)",
      parcelId: "LA1021",
      surveyNumber: "124/2",
      text: "Revenue Patta copy issued by Taluk Tahsildar Kanchipuram for land area 1.5 acres.",
      category: "Documentation Issue",
      risk: "Low",
      verificationStatus: "Verified",
      issuesDetected: "None • Complete Title Record",
      confidence: 96,
      importantTerms: ["Patta", "Revenue Ledger"],
      uploadDate: "10 Feb 2026"
    },
    {
      id: "DOC-102",
      name: "Ownership Certificate (Family Partition)",
      parcelId: "LA1024",
      surveyNumber: "219/4",
      text: "Family partition deed filed with joint title claims across 3 brothers.",
      category: "Ownership Issue",
      risk: "High",
      verificationStatus: "Mismatch",
      issuesDetected: "Joint ownership dispute in civil suit #45/2024",
      confidence: 88,
      importantTerms: ["Partition Deed", "Title Dispute"],
      uploadDate: "18 Feb 2026"
    },
    {
      id: "DOC-103",
      name: "Survey Measurement Map (Form 3)",
      parcelId: "LA1025",
      surveyNumber: "305/1",
      text: "Field Measurement Book (FMB) survey drawing boundary map.",
      category: "Documentation Issue",
      risk: "Medium",
      verificationStatus: "Requires Review",
      issuesDetected: "Boundary discrepancy of 0.12 Acres with adjacent plot",
      confidence: 82,
      importantTerms: ["FMB Map", "Boundary Difference"],
      uploadDate: "22 Feb 2026"
    },
    {
      id: "DOC-104",
      name: "Compensation Valuation Award",
      parcelId: "LA1026",
      surveyNumber: "112/3",
      text: "Special District Revenue Officer valuation award calculation for agricultural land.",
      category: "Compensation Issue",
      risk: "Medium",
      verificationStatus: "Pending",
      issuesDetected: "Bank IFSC validation pending for direct credit",
      confidence: 90,
      importantTerms: ["Valuation", "Bank Transfer"],
      uploadDate: "26 Feb 2026"
    }
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeDocument(inputText);
      setAnalysis(res);
      showToast("Document analyzed & key issues extracted successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to analyze document text", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-7 font-sans text-[#1E293B] pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="page-title">
          Document Verification Workspace
        </h2>
        <p className="text-[14px] text-[#64748B] mt-1 font-normal">
          Verify revenue records, title deeds, Field Measurement Books (FMB), and parse landowner objection documents for legal discrepancies.
        </p>
      </div>

      {/* DISCREPANCY ANALYZER CARD */}
      <div className="card-enterprise space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3">
          <h3 className="section-title">
            Document Discrepancy Analyzer
          </h3>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Paste landowner complaint, objection letter, or revenue deed text to extract legal citations and title issues.
          </p>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-3">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text from objection letter, court stay petition, or revenue Patta deed..."
            className="w-full p-3 bg-white border border-[#CBD5E1] rounded-[5px] text-[14px] text-[#1E293B] focus:border-[#2563EB] outline-none font-normal placeholder:text-[13px]"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="btn-primary"
            >
              <span>{isAnalyzing ? "Analyzing Text..." : "Extract Document Issues"}</span>
            </button>
          </div>
        </form>

        {analysis && (
          <div className="p-4 bg-[#0F172A] text-white rounded-[6px] text-[14px] space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <span className="font-semibold text-[#FDE68A]">Analysis Result</span>
              <span className="status-badge status-badge-info">{analysis.risk} Risk</span>
            </div>
            <div>
              <span className="small-label text-[#94A3B8] block">Category</span>
              <span className="font-semibold text-[#E2E8F0]">{analysis.category}</span>
            </div>
            {analysis.importantTerms && (
              <div>
                <span className="small-label text-[#94A3B8] block">Extracted Legal Terms</span>
                <span className="font-medium text-[#FEF3C7]">{analysis.importantTerms.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DOCUMENT VERIFICATION LEDGER TABLE */}
      <div className="card-enterprise space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3">
          <h3 className="section-title">
            Submitted Documents & Verification Status ({documentList.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Document Title</th>
                <th className="table-header">Parcel / Survey No.</th>
                <th className="table-header">Category</th>
                <th className="table-header">Verification Status</th>
                <th className="table-header">Issue Detected</th>
                <th className="table-header">Last Updated</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {documentList.map((doc) => (
                <tr key={doc.id}>
                  <td className="font-semibold text-[14px] text-[#0F172A]">{doc.name}</td>
                  <td>
                    <div className="font-semibold text-[13px] text-[#0F172A]">Survey {doc.surveyNumber}</div>
                    <div className="text-[12px] font-normal text-[#64748B]">{doc.parcelId}</div>
                  </td>
                  <td className="text-[13px] font-normal text-[#1E293B]">{doc.category}</td>
                  <td>
                    <span className={`status-badge ${
                      doc.verificationStatus === 'Verified'
                        ? "status-badge-success"
                        : doc.verificationStatus === 'Mismatch'
                          ? "status-badge-danger"
                          : doc.verificationStatus === 'Requires Review'
                            ? "status-badge-warning"
                            : "status-badge-neutral"
                    }`}>
                      {doc.verificationStatus}
                    </span>
                  </td>
                  <td className="text-[13px] font-normal text-[#1E293B] max-w-xs">{doc.issuesDetected}</td>
                  <td className="text-[12px] font-medium text-[#64748B]">{doc.uploadDate}</td>
                  <td className="text-right">
                    <button
                      onClick={() => showToast(`Opening document ${doc.id}...`, "success")}
                      className="btn-secondary h-[36px] text-[13px] px-3 font-semibold"
                    >
                      Inspect File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
