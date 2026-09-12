import React, { useState, useRef } from "react";
import { DocumentAnalysis, LandParcel } from "../types";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Upload, 
  Sparkles,
  File,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Archive,
  Plus,
  Trash2,
  Eye,
  Download,
  X,
  FileCheck,
  FolderOpen
} from "lucide-react";
import { analyzeDocument } from "../api";

interface DocumentsViewProps {
  onUpdateParcel?: (id: string, payload: Partial<LandParcel>) => void;
  showToast?: (message: string, type?: 'success' | 'error') => void;
}

export default function DocumentsView({ onUpdateParcel, showToast }: DocumentsViewProps) {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'Compensation Issue' | 'Ownership Issue' | 'Documentation Issue' | 'Environmental Issue' | 'Legal Issue' | 'Other'>('Documentation Issue');
  const [uploadSurveyNo, setUploadSurveyNo] = useState("124/2");
  const [uploadParcelId, setUploadParcelId] = useState("LA1021");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Document Verification List
  const [documentList, setDocumentList] = useState<DocumentAnalysis[]>([
    {
      id: "DOC-101",
      name: "Land Record (Patta #412).pdf",
      parcelId: "LA1021",
      surveyNumber: "124/2",
      text: "Revenue Patta copy issued by Taluk Tahsildar Kanchipuram for land area 1.5 acres.",
      category: "Documentation Issue",
      risk: "Low",
      verificationStatus: "Verified",
      issuesDetected: "None • Complete Title Record",
      confidence: 96,
      importantTerms: ["Patta", "Revenue Ledger"],
      fileType: "application/pdf",
      fileSize: "1.4 MB",
      uploadDate: "10 Feb 2026"
    },
    {
      id: "DOC-102",
      name: "Ownership Certificate (Family Partition).docx",
      parcelId: "LA1024",
      surveyNumber: "219/4",
      text: "Family partition deed filed with joint title claims across 3 brothers.",
      category: "Ownership Issue",
      risk: "High",
      verificationStatus: "Mismatch",
      issuesDetected: "Joint ownership dispute in civil suit #45/2024",
      confidence: 88,
      importantTerms: ["Partition Deed", "Title Dispute"],
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: "840 KB",
      uploadDate: "18 Feb 2026"
    },
    {
      id: "DOC-103",
      name: "Survey Measurement Map (Form 3).jpg",
      parcelId: "LA1025",
      surveyNumber: "305/1",
      text: "Field Measurement Book (FMB) survey drawing boundary map.",
      category: "Documentation Issue",
      risk: "Medium",
      verificationStatus: "Requires Review",
      issuesDetected: "Boundary discrepancy of 0.12 Acres with adjacent plot",
      confidence: 82,
      importantTerms: ["FMB Map", "Boundary Difference"],
      fileType: "image/jpeg",
      fileSize: "3.2 MB",
      uploadDate: "22 Feb 2026"
    },
    {
      id: "DOC-104",
      name: "Compensation Valuation Award.xlsx",
      parcelId: "LA1026",
      surveyNumber: "112/3",
      text: "Special District Revenue Officer valuation award calculation for agricultural land.",
      category: "Compensation Issue",
      risk: "Medium",
      verificationStatus: "Pending",
      issuesDetected: "Bank IFSC validation pending for direct credit",
      confidence: 90,
      importantTerms: ["Valuation", "Bank Transfer"],
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileSize: "512 KB",
      uploadDate: "26 Feb 2026"
    }
  ]);

  const [inspectingDoc, setInspectingDoc] = useState<DocumentAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to format bytes to human-readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper icon selector based on file extension / MIME type
  const getFileIcon = (fileType?: string, fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    const mime = fileType?.toLowerCase() || '';

    if (ext === 'pdf' || mime.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    if (['doc', 'docx'].includes(ext) || mime.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || mime.includes('sheet') || mime.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mime.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
      return <Archive className="w-5 h-5 text-amber-600" />;
    }
    if (['txt', 'json', 'xml', 'log'].includes(ext) || mime.includes('text') || mime.includes('json')) {
      return <FileCode className="w-5 h-5 text-indigo-600" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  // Text Analysis Form Submit
  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeDocument(inputText);
      setAnalysis(res);
      if (showToast) showToast("Document analyzed & key issues extracted successfully.", "success");
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Failed to analyze document text", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File selection handler
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
  };

  // Process Document Upload (supports ANY file type)
  const handleProcessUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      if (showToast) showToast("Please select a file to upload.", "error");
      return;
    }

    const file = selectedFile;
    const sizeStr = formatBytes(file.size);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newId = `DOC-${100 + documentList.length + 1}`;

    let extractedText = `Uploaded ${file.name} (${sizeStr}) - Content ready for review.`;
    let category: any = uploadCategory;
    let risk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let issuesDetected = "Document successfully uploaded and queued for administrative review.";
    let importantTerms: string[] = [file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT', 'Land Record'];

    // If text/csv/json file, read content and run automated AI evaluation
    const isTextReadable = file.type.includes('text') || 
                           file.name.endsWith('.txt') || 
                           file.name.endsWith('.csv') || 
                           file.name.endsWith('.json');

    if (isTextReadable) {
      try {
        const textContent = await file.text();
        if (textContent.trim()) {
          extractedText = textContent.slice(0, 1000);
          const aiRes = await analyzeDocument(textContent);
          if (aiRes) {
            category = aiRes.category || uploadCategory;
            risk = aiRes.risk || 'Medium';
            importantTerms = aiRes.importantTerms || importantTerms;
            issuesDetected = aiRes.keyDisputes?.[0] || aiRes.compensationIssue || "AI analysis completed cleanly.";
          }
        }
      } catch (readErr) {
        console.error("FileReader error:", readErr);
      }
    } else {
      // Determine default risk heuristics based on category
      if (uploadCategory === 'Legal Issue' || uploadCategory === 'Ownership Issue') {
        risk = 'High';
        issuesDetected = 'Pending title verification & legal citation check.';
      } else if (uploadCategory === 'Compensation Issue') {
        risk = 'Medium';
        issuesDetected = 'Valuation statement uploaded for bank disbursement.';
      }
    }

    const newDoc: DocumentAnalysis = {
      id: newId,
      name: file.name,
      parcelId: uploadParcelId || "LA1021",
      surveyNumber: uploadSurveyNo || "124/2",
      text: extractedText,
      category: category,
      risk: risk,
      verificationStatus: 'Pending',
      issuesDetected: issuesDetected,
      confidence: 92,
      importantTerms: importantTerms,
      fileType: file.type || 'application/octet-stream',
      fileSize: sizeStr,
      uploadDate: dateStr
    };

    setDocumentList(prev => [newDoc, ...prev]);
    setSelectedFile(null);
    setShowUploadModal(false);

    if (showToast) {
      showToast(`Document "${file.name}" uploaded successfully!`, "success");
    }
  };

  const handleDeleteDoc = (id: string, name: string) => {
    setDocumentList(prev => prev.filter(d => d.id !== id));
    if (showToast) showToast(`Document "${name}" removed.`, "success");
  };

  const filteredDocs = documentList.filter(doc => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return doc.name.toLowerCase().includes(term) ||
           doc.id.toLowerCase().includes(term) ||
           doc.surveyNumber?.toLowerCase().includes(term) ||
           doc.parcelId.toLowerCase().includes(term) ||
           doc.category.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-7 font-sans text-[#1E293B] pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* HEADER SECTION WITH ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title text-[26px] font-extrabold text-[#0F382C] font-['Outfit'] tracking-tight">
            Document Verification & Upload Workspace
          </h2>
          <p className="text-[14px] text-[#475569] mt-1 font-medium">
            Upload any land acquisition records (PDF, DOCX, Images, Excel, CSV, TXT, ZIP) for legal discrepancy & title parsing.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 bg-[#0F382C] hover:bg-[#1B4D3E] text-[#D8F374] font-extrabold text-sm rounded-2xl shadow-sm hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4 text-[#D8F374]" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* QUICK ANY-FILE-TYPE UPLOAD DROPZONE CARD */}
      <div className="bg-white border-2 border-dashed border-slate-300 hover:border-[#0F382C] rounded-[24px] p-6 shadow-2xs transition-all text-center relative bg-gradient-to-b from-white to-[#F6FAF5]">
        <input 
          type="file" 
          multiple
          accept="*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setSelectedFile(e.target.files[0]);
              setShowUploadModal(true);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-14 h-14 bg-[#EFF5ED] text-[#0F382C] rounded-2xl flex items-center justify-center mx-auto shadow-2xs border border-slate-200">
            <Upload className="w-7 h-7 text-[#0F382C]" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-[#0F382C] font-['Outfit']">
              Drag & Drop Any Land Document Here
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Supports <strong>PDF, Word (.docx), Images (.jpg, .png), Excel/CSV, Text (.txt), ZIP Archives</strong> & all formats.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 text-xs font-bold shadow-2xs">
            <FolderOpen className="w-3.5 h-3.5 text-[#0F382C]" />
            <span>Click to Browse Computer Files</span>
          </div>
        </div>
      </div>

      {/* DISCREPANCY ANALYZER CARD */}
      <div className="card-enterprise space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
          <div>
            <h3 className="section-title text-[#0F382C]">
              AI Document Discrepancy Text Analyzer
            </h3>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Paste landowner complaint, objection letter, or revenue deed text to extract legal citations and title issues.
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-[#0F382C]" />
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text from objection letter, court stay petition, or revenue Patta deed for instant legal NLP parsing..."
            className="w-full p-3 bg-white border border-[#CBD5E1] rounded-2xl text-[14px] text-[#1E293B] focus:border-[#0F382C] outline-none font-normal placeholder:text-[13px] transition-all"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="btn-primary cursor-pointer"
            >
              <span>{isAnalyzing ? "Analyzing Text..." : "Extract Document Issues"}</span>
            </button>
          </div>
        </form>

        {analysis && (
          <div className="p-4 bg-[#0F382C] text-white rounded-2xl text-[14px] space-y-2 animate-in fade-in border border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-[#1B4D3E] pb-2">
              <span className="font-extrabold text-[#D8F374] font-['Outfit']">Analysis Result</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#D8F374] text-[#0F382C]">
                {analysis.risk} Risk
              </span>
            </div>
            <div>
              <span className="small-label text-emerald-200 block text-[11px] uppercase tracking-wider font-bold">Category</span>
              <span className="font-extrabold text-white">{analysis.category}</span>
            </div>
            {analysis.importantTerms && (
              <div>
                <span className="small-label text-emerald-200 block text-[11px] uppercase tracking-wider font-bold">Extracted Legal Terms</span>
                <span className="font-medium text-[#D8F374]">{analysis.importantTerms.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DOCUMENT VERIFICATION LEDGER TABLE */}
      <div className="card-enterprise space-y-4">
        <div className="border-b border-[#E2E8F0] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="section-title text-[#0F382C]">
              Submitted Documents Registry ({filteredDocs.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live repository of uploaded land title deeds, gazettes, FMB maps and compensation files.
            </p>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search document, survey no..."
              className="input-enterprise w-full !pl-10 pr-4 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="table-header">Type</th>
                <th className="table-header">Document Title</th>
                <th className="table-header">Parcel / Survey No.</th>
                <th className="table-header">Category</th>
                <th className="table-header">Verification Status</th>
                <th className="table-header">Issue Detected</th>
                <th className="table-header">Uploaded Date</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F6FAF5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 inline-flex items-center justify-center">
                      {getFileIcon(doc.fileType, doc.name)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-extrabold text-[14px] text-[#0F382C] font-['Outfit'] leading-snug">
                        {doc.name}
                      </p>
                      {doc.fileSize && (
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {doc.fileSize}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-[13px] text-[#0F382C] font-['Outfit']">
                      Survey #{doc.surveyNumber || "124/2"}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 font-medium">{doc.parcelId}</div>
                  </td>
                  <td className="py-3 px-4 text-[13px] font-medium text-[#1E293B]">
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-[13px] font-medium text-slate-600 max-w-xs leading-tight">
                    {doc.issuesDetected || "No discrepancy recorded"}
                  </td>
                  <td className="py-3 px-4 text-[12px] font-medium text-slate-500">
                    {doc.uploadDate}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setInspectingDoc(doc)}
                        className="btn-secondary h-[34px] text-[12px] px-3 font-extrabold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 text-xs font-medium">
                    No documents matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL DIALOG */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#EFF5ED] text-[#0F382C] rounded-xl border border-slate-200">
                  <Upload className="w-5 h-5 text-[#0F382C]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F382C] font-['Outfit']">
                    Upload Land Document
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Select any file (PDF, Word, Excel, Image, CSV, TXT, ZIP)
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessUpload} className="space-y-4">
              
              {/* Dropzone File Selection Input */}
              <div>
                <label className="small-label block text-slate-600 mb-1.5 font-bold">Select File (Any Format)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0F382C] rounded-2xl p-4 bg-slate-50 text-center cursor-pointer transition-colors relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      {getFileIcon(selectedFile.type, selectedFile.name)}
                      <div className="text-left">
                        <p className="text-sm font-extrabold text-[#0F382C] font-['Outfit'] truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-xs font-mono text-slate-500">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Click to choose a file from your computer</p>
                      <p className="text-[11px] text-slate-400">PDF, DOCX, XLSX, JPG, PNG, CSV, TXT, ZIP etc.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Parcel / Survey Number Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="small-label block text-slate-600 mb-1 font-bold">Survey Number</label>
                  <input
                    type="text"
                    value={uploadSurveyNo}
                    onChange={(e) => setUploadSurveyNo(e.target.value)}
                    placeholder="e.g. 124/2"
                    className="input-enterprise w-full"
                  />
                </div>
                <div>
                  <label className="small-label block text-slate-600 mb-1 font-bold">Parcel ID</label>
                  <input
                    type="text"
                    value={uploadParcelId}
                    onChange={(e) => setUploadParcelId(e.target.value)}
                    placeholder="e.g. LA1021"
                    className="input-enterprise w-full"
                  />
                </div>
              </div>

              {/* Document Category Dropdown */}
              <div>
                <label className="small-label block text-slate-600 mb-1 font-bold">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="input-enterprise w-full font-semibold"
                >
                  <option value="Documentation Issue">Documentation Issue (Patta / Deed / FMB Map)</option>
                  <option value="Ownership Issue">Ownership Issue (Title Claim / Partition)</option>
                  <option value="Compensation Issue">Compensation Issue (Valuation Award / Bank)</option>
                  <option value="Legal Issue">Legal Issue (Court Injunction / Stay Writ)</option>
                  <option value="Environmental Issue">Environmental Issue (Forest / Water Body)</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Upload & Index Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT DOCUMENT DETAILS MODAL */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-2xl border border-slate-200">
                  {getFileIcon(inspectingDoc.fileType, inspectingDoc.name)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F382C] font-['Outfit']">
                    {inspectingDoc.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    ID: {inspectingDoc.id} • Survey #{inspectingDoc.surveyNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                <strong className="text-slate-900 text-sm">{inspectingDoc.category}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="status-badge status-badge-info mt-0.5">{inspectingDoc.verificationStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                <strong className="text-slate-900 text-sm font-mono">{inspectingDoc.fileSize || "1.2 MB"}</strong>
              </div>
            </div>

            <div className="p-4 bg-[#F6FAF5] rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-1.5">
              <span className="font-extrabold text-[#0F382C] block font-['Outfit']">Extracted Content & Issue Summary:</span>
              <p className="leading-relaxed text-slate-600 font-medium">{inspectingDoc.text}</p>
            </div>

            {inspectingDoc.importantTerms && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingDoc.importantTerms.map((term, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
