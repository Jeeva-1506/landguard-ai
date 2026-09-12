import React, { useState } from "react";
import { 
  Mail, 
  Copy, 
  Check, 
  Download, 
  Send, 
  Sparkles, 
  Building, 
  User, 
  Phone, 
  FileText,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { sendLandRiskAlert, sendReportPdfEmail } from "../api";

interface DataInquiryEmailGeneratorProps {
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function DataInquiryEmailGenerator({ showToast }: DataInquiryEmailGeneratorProps) {
  const [templateType, setTemplateType] = useState<'HIGH_RISK_DATASET' | 'GENERAL'>('HIGH_RISK_DATASET');
  const [recipientAuthority, setRecipientAuthority] = useState("The District Revenue Officer (DRO) & Land Acquisition Authority");
  const [yourName, setYourName] = useState("Jeeva S");
  const [departmentYear, setDepartmentYear] = useState("Department of Computer Science & Engineering, 4th Year");
  const [institutionName, setInstitutionName] = useState("Anna University / Government College of Engineering");
  const [teamName, setTeamName] = useState("LandGuard AI Team (SIH 2026)");
  const [contactEmail, setContactEmail] = useState("jeevaselva0614@gmail.com");
  const [contactPhone, setContactPhone] = useState("+91 7871534167");
  const [targetEmail, setTargetEmail] = useState("jeevaselva0614@gmail.com");

  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const generateEmailText = () => {
    if (templateType === 'HIGH_RISK_DATASET') {
      return `Dear Sir/Madam,

We are working on an academic project titled "Predictive Analytics System for Early Detection of Land Acquisition Delays."

As part of our project, we are developing a system to identify high-risk land acquisition cases that may experience delays.

For academic and prototype development purposes, we kindly request guidance on the availability of publicly accessible or anonymized data related specifically to high-risk land acquisition cases.

The dataset fields relevant to our analysis include:
• Project ID
• State
• District
• Survey Number
• Land Area
• Land Type / Land Use
• Ownership Status
• Ownership Dispute
• Legal / Court Case Status
• Compensation Status
• Document Verification Status
• Acquisition Stage
• Clearance Status
• Previous / Existing Delay
• Delay Duration
• Delay Risk / Risk Category

We are particularly interested in records that have been identified as High Risk or have experienced significant delays due to factors such as legal disputes, ownership issues, compensation issues, documentation problems, or pending clearances.

We do not require confidential or personally identifiable information. Anonymized, aggregated, sample, or publicly available data would be sufficient for our academic prototype.

We kindly request you to provide information regarding the appropriate government portal, dataset, API, or procedure through which such data can be accessed.

The data will be used strictly for academic and research purposes and will be handled according to the applicable data security and privacy guidelines.

Thank you for your valuable support and guidance.

Yours faithfully,

${yourName || "[Your Name]"}
${departmentYear || "[Department / Year]"}
${institutionName || "[College / Institution Name]"}
Project: Predictive Analytics System for Early Detection of Land Acquisition Delays
Team Name: ${teamName || "[Team Name]"}
Email: ${contactEmail || "[Email Address]"}
Contact: ${contactPhone || "[Phone Number]"}`;
    }

    return `Dear Sir/Madam,

I am writing on behalf of our student project team to seek guidance and information regarding our project titled "Predictive Analytics System for Early Detection of Land Acquisition Delays."

The objective of our project is to develop a software-based predictive analytics system that can help identify potential delays in land acquisition at an early stage. The proposed system will analyse factors such as land records, ownership issues, compensation status, legal disputes, documentation issues, acquisition progress, and other relevant factors to estimate delay risk.

The major components of our proposed system are:
• AI/ML-based Land Acquisition Delay Prediction
• GIS-based Land Parcel Visualization
• Legal Risk Analysis
• Document Verification and Discrepancy Detection
• Cost Overrun Prediction
• Dashboard and Early-Warning Alerts

For developing and validating the prototype, we would like to understand what publicly available datasets, APIs, portals, reports, or open government data sources may be relevant to land acquisition, land records, cadastral maps, compensation, rehabilitation and resettlement, and acquisition project progress.

We kindly request your guidance regarding:
1. Government portals or publicly available datasets that can be used for academic/research purposes.
2. Availability of historical or anonymized land acquisition-related data.
3. Availability of GIS/cadastral map data and appropriate access procedures.
4. Any APIs or data services that can be legally used for academic projects.
5. The appropriate department or authority to contact if formal permission is required for accessing relevant data.

We will use any data only for academic/research and prototype development purposes and will follow the applicable data-access, privacy, and security guidelines. We are not requesting any confidential or personally sensitive information.

We would be grateful if you could guide us towards the appropriate government portal, dataset, department, or procedure for obtaining relevant publicly available information.

Thank you for your valuable time and support.

Yours faithfully,

${yourName || "[Your Name]"}
${departmentYear || "[Department / Year]"}
${institutionName || "[College / Institution Name]"}
Project: Predictive Analytics System for Early Detection of Land Acquisition Delays
Team Name: ${teamName || "[Team Name]"}
Email: ${contactEmail || "[Email Address]"}
Contact: ${contactPhone || "[Phone Number]"}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailText());
    setCopied(true);
    if (showToast) showToast("Email template copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = generateEmailText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Academic_LandAcquisition_Data_Request_${yourName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) showToast("Official Inquiry Letter downloaded!");
  };

  const handleSendViaEmailService = async () => {
    if (!targetEmail || !targetEmail.includes("@")) {
      if (showToast) showToast("Please enter a valid recipient email address.", "error");
      return;
    }

    setIsSendingEmail(true);
    try {
      const emailContent = generateEmailText();
      const res = await sendLandRiskAlert({
        recipientEmail: targetEmail,
        surveyNumber: "Academic Request",
        landRiskDetails: {
          projectName: "Predictive Analytics System for Early Detection of Land Acquisition Delays",
          ownerName: yourName,
          district: "State Revenue Department",
          riskLevel: "ACADEMIC_INQUIRY",
          delayProbability: 0,
          expectedDelayDays: 0,
          riskFactors: [
            "Academic Data Inquiry for Land Acquisition AI System",
            "Public Datasets & GIS Cadastral Map Request"
          ],
          recommendedAction: emailContent
        }
      });

      if (res.success) {
        if (showToast) showToast(`Inquiry email dispatched to ${targetEmail} via Brevo API!`);
      } else {
        if (showToast) showToast(`Email dispatch warning: ${res.message}`, "error");
      }
    } catch (err: any) {
      if (showToast) showToast(`Failed to send email: ${err.message}`, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendPdfAttachment = async () => {
    if (!targetEmail || !targetEmail.includes("@")) {
      if (showToast) showToast("Please enter a valid recipient email address.", "error");
      return;
    }

    setIsSendingEmail(true);
    try {
      const text = generateEmailText();
      const res = await sendReportPdfEmail({
        recipientEmail: targetEmail,
        templateId: "Academic_Inquiry",
        title: "Academic Inquiry: Land Acquisition Data Access Request",
        date: new Date().toLocaleDateString(),
        meta: {
          "Student Name": yourName,
          "Department": departmentYear,
          "Institution": institutionName,
          "Team Name": teamName,
          "Contact Email": contactEmail,
          "Contact Phone": contactPhone
        },
        bodyText: text
      });

      if (res.success) {
        if (showToast) showToast(`📄 PDF Inquiry Letter (${res.filename}) emailed to ${targetEmail} via Brevo API!`);
      } else {
        if (showToast) showToast(`Email dispatch error: ${res.message}`, "error");
      }
    } catch (err: any) {
      if (showToast) showToast(`Failed to send PDF email: ${err.message}`, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
                Official Data Access & Government Inquiry Email Generator
              </h4>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> ACADEMIC & RESEARCH COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Generate, customize, and dispatch formal academic inquiry letters to government revenue authorities & dataset portals.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-xs active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
            <span>{copied ? "Copied!" : "Copy Text"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Download Letter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Inputs */}
        <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200/80 p-5 rounded-2xl space-y-4">
          
          {/* Template Selection Pills */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Inquiry Letter Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('HIGH_RISK_DATASET')}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-center cursor-pointer transition-all border ${
                  templateType === 'HIGH_RISK_DATASET'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                High-Risk Dataset
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('GENERAL')}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-center cursor-pointer transition-all border ${
                  templateType === 'GENERAL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                General Inquiry
              </button>
            </div>
          </div>

          <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
            <User className="w-4 h-4 text-blue-600" /> Letter Parameters & Student Info
          </h5>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Student / Representative Name</label>
              <input
                type="text"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="Jeeva S"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Department / Academic Year</label>
              <input
                type="text"
                value={departmentYear}
                onChange={(e) => setDepartmentYear(e.target.value)}
                placeholder="Dept of Computer Science, 4th Year"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">College / Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Government College of Engineering"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Team Name (e.g. SIH 2026)</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="LandGuard AI Team"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="jeevaselva0614@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 7871534167"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            {/* Direct Send Section */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="block text-slate-700 font-extrabold uppercase text-[11px] tracking-wider">
                Direct Dispatch via Brevo Email API
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="recipient@domain.gov.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 bg-white mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSendViaEmailService}
                  disabled={isSendingEmail}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSendingEmail ? (
                    <RefreshCw className="w-3.5 h-3.5 text-blue-100 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-blue-100" />
                  )}
                  <span>Send Text</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendPdfAttachment}
                  disabled={isSendingEmail}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSendingEmail ? (
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>Send Attached PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Formatted Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Live Formatted Letter Preview
            </h5>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              Ready for Official Submission
            </span>
          </div>

          <div className="p-5 sm:p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed whitespace-pre-wrap shadow-inner overflow-y-auto max-h-[460px] scrollbar-thin">
            {generateEmailText()}
          </div>
        </div>
      </div>
    </div>
  );
}
