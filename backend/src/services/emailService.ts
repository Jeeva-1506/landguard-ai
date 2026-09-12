import dotenv from "dotenv";

dotenv.config();

export type EmailStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface EmailDispatchResult {
  success: boolean;
  status: EmailStatus;
  message: string;
  providerMessageId?: string;
  providerDetails?: any;
  errorCode?: string;
}

export interface EmailAlertDetails {
  projectName: string;
  projectId?: string;
  projectType?: string;

  surveyNumber: string;
  subdivisionNumber?: string;
  ownerName?: string;

  state?: string;
  district?: string;
  taluk?: string;
  village?: string;

  landArea?: number | string;
  area?: number | string;
  landType?: string;
  purpose?: string;

  acquisitionStatus?: string;
  compensationStatus?: string;
  legalStatus?: string;
  documentStatus?: string;
  documentIssues?: string;
  objectionStatus?: string;
  surveyStatus?: string;
  clearanceStatus?: string;

  riskLevel: string;
  delayProbability: number | string;
  expectedDelayDays: number | string;
  costOverrunRisk?: string;
  legalRisk?: string;

  riskFactors?: string[];

  legalIssues?: string;
  compensationIssues?: string;
  surveyIssues?: string;

  recommendedAction: string;

  latitude?: number | string;
  longitude?: number | string;
  timestamp?: string;
  isTest?: boolean;
  pdfBuffer?: Buffer;
  pdfFilename?: string;
}

export class EmailService {
  /**
   * Validate Email Service configuration
   */
  public static validateConfig(toEmail: string): { valid: boolean; error?: string } {
    if (!toEmail || !toEmail.includes("@")) {
      return { valid: false, error: `Invalid recipient email address: ${toEmail}` };
    }

    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return { valid: false, error: "BREVO_API_KEY / EMAIL_API_KEY is not configured in environment variables." };
    }

    return { valid: true };
  }

  /**
   * Dedicated high risk land email trigger
   */
  public static async sendHighRiskLandAlert(
    details: EmailAlertDetails,
    overrideReceiver?: string
  ): Promise<EmailDispatchResult> {
    const toEmail = overrideReceiver || process.env.ALERT_RECEIVER_EMAIL || process.env.PROTOTYPE_EMAIL || "jeevaselva0614@gmail.com";
    const customSubject = `🚨 HIGH RISK LAND ALERT – Survey No: ${details.surveyNumber}`;
    return this.sendAlertEmail(toEmail, details, customSubject);
  }

  /**
   * Dispatches transactional risk alert email via Brevo or Resend
   */
  public static async sendAlertEmail(
    toEmail: string,
    details: EmailAlertDetails,
    customSubject?: string
  ): Promise<EmailDispatchResult> {
    const validation = this.validateConfig(toEmail);
    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY;
    const fromEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || "jeevaselva0614@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "LandGuard AI";

    if (!validation.valid || !apiKey) {
      console.warn(`[EmailService] Validation Warning: ${validation.error}`);
      return {
        success: false,
        status: 'FAILED',
        message: validation.error || "Email service API key unconfigured.",
        errorCode: "CONFIG_MISSING"
      };
    }

    const testBanner = details.isTest
      ? `<div style="background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 10px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 16px; font-size: 13px;">
          ⚠️ PROTOTYPE TEST NOTIFICATION — Using actual LandGuard AI database record (Survey #${details.surveyNumber})
         </div>`
      : "";

    const subject = customSubject || `LandGuard AI — ${details.riskLevel} Risk Alert — Survey ${details.surveyNumber}`;

    const riskFactorsList = (details.riskFactors && details.riskFactors.length > 0)
      ? details.riskFactors.map(f => `<li style="margin-bottom: 4px;">• ${f}</li>`).join("")
      : "<li>No specific risk factors flagged</li>";

    const formattedArea = details.area != null ? String(details.area) : details.landArea != null ? `${details.landArea} Acres` : "N/A";
    const timestampStr = details.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const pdfNotice = details.pdfBuffer
      ? `<div style="background-color: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; padding: 10px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 16px; font-size: 13px;">
          📎 ATTACHMENT INCLUDED: ${details.pdfFilename || 'SLA_Land_Acquisition_Report.pdf'} is attached to this email.
         </div>`
      : "";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          ${testBanner}
          ${pdfNotice}

          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #1e3a8a; font-size: 20px;">🏛️ LandGuard AI — Official Risk & Audit Dossier</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Land Acquisition Delay & Risk Management System</p>
          </div>

          <!-- Section 1: Project Details -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">Project Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Project Name:</td><td style="font-weight: bold; color: #0f172a;">${details.projectName || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Project ID:</td><td style="color: #0f172a;">${details.projectId || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Project Type:</td><td style="color: #0f172a;">${details.projectType || "Highway Infrastructure"}</td></tr>
          </table>

          <!-- Section 2: Land Details -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">Land Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Survey Number:</td><td style="font-weight: bold; color: #0f172a;">${details.surveyNumber || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Subdivision Number:</td><td style="color: #0f172a;">${details.subdivisionNumber || "1A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Owner / Title Holder:</td><td style="font-weight: bold; color: #0f172a;">${details.ownerName || "N/A"}</td></tr>
          </table>

          <!-- Section 3: Location -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">Location</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">State:</td><td style="color: #0f172a;">${details.state || "Tamil Nadu"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">District:</td><td style="color: #0f172a;">${details.district || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Taluk:</td><td style="color: #0f172a;">${details.taluk || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Village:</td><td style="color: #0f172a;">${details.village || "N/A"}</td></tr>
          </table>

          <!-- Section 4: Land Information -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">Land Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Land Area:</td><td style="color: #0f172a;">${formattedArea}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Land Type:</td><td style="color: #0f172a;">${details.landType || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Purpose:</td><td style="color: #0f172a;">${details.purpose || "National Highway Acquisition"}</td></tr>
          </table>

          <!-- Section 5: Acquisition Status -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">Acquisition Status</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Acquisition Status:</td><td style="color: #0f172a;">${details.acquisitionStatus || "Survey & Verification"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Compensation Status:</td><td style="color: #0f172a;">${details.compensationStatus || "Under Assessment"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Legal Status:</td><td style="color: #0f172a;">${details.legalStatus || "Clear"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Document Status:</td><td style="color: #0f172a;">${details.documentStatus || details.documentIssues || "Complete"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Objection Status:</td><td style="color: #0f172a;">${details.objectionStatus || "None"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Survey Status:</td><td style="color: #0f172a;">${details.surveyStatus || "Completed"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Clearance Status:</td><td style="color: #0f172a;">${details.clearanceStatus || "Approved"}</td></tr>
          </table>

          <!-- Section 6: AI Risk Assessment -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">AI Risk Assessment</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Risk Level:</td><td style="font-weight: bold; color: #dc2626;">${details.riskLevel || "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Delay Probability:</td><td style="font-weight: bold; color: #ea580c;">${details.delayProbability != null ? `${details.delayProbability}%` : "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Expected Delay:</td><td style="font-weight: bold; color: #dc2626;">${details.expectedDelayDays != null ? `${details.expectedDelayDays} Days` : "N/A"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Cost Overrun Risk:</td><td style="color: #0f172a;">${details.costOverrunRisk || "Low"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Legal Risk:</td><td style="color: #0f172a;">${details.legalRisk || "Medium"}</td></tr>
          </table>

          <!-- Section 7: Risk Factors -->
          <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 16px;">
            <strong style="color: #334155;">Risk Factors:</strong>
            <ul style="margin: 6px 0 0 0; padding: 0; list-style-type: none; color: #475569;">
              ${riskFactorsList}
            </ul>
          </div>

          <!-- Section 8: Detected Issues -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">Detected Issues</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Legal Issues:</td><td style="color: #0f172a;">${details.legalIssues || "None"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Document Issues:</td><td style="color: #0f172a;">${details.documentIssues || "None"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Compensation Issues:</td><td style="color: #0f172a;">${details.compensationIssues || "None"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Survey Issues:</td><td style="color: #0f172a;">${details.surveyIssues || "None"}</td></tr>
          </table>

          <!-- Section 9: Recommended Action -->
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 4px 0; color: #1d4ed8; font-size: 13px;">💡 Recommended Action & Statement</h4>
            <p style="margin: 0; color: #1e40af; font-size: 12px; line-height: 1.5;">${details.recommendedAction || "Conduct title deed verification and revenue officer review."}</p>
          </div>

          <!-- Section 10: GIS Location -->
          <h3 style="font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">GIS Location</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 40%;">Latitude:</td><td style="font-mono; color: #0f172a;">${details.latitude || "11.9377"}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Longitude:</td><td style="font-mono; color: #0f172a;">${details.longitude || "79.4831"}</td></tr>
          </table>

          <!-- Section 11: Generated At -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
            Generated At: ${timestampStr} • LandGuard AI System
          </div>
        </div>
      </div>
    `;

    try {
      const isBrevoKey = apiKey.startsWith("xkeysib-");
      
      const url = isBrevoKey
        ? "https://api.brevo.com/v3/smtp/email"
        : "https://api.resend.com/emails";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "accept": "application/json"
      };

      if (isBrevoKey) {
        headers["api-key"] = apiKey;
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const attachmentsList = details.pdfBuffer
        ? [
            {
              content: details.pdfBuffer.toString("base64"),
              name: details.pdfFilename || "SLA_Land_Acquisition_Report.pdf"
            }
          ]
        : undefined;

      const bodyPayload = isBrevoKey
        ? {
            sender: { name: senderName, email: fromEmail },
            to: [{ email: toEmail, name: details.ownerName || "Prototype Admin" }],
            subject: subject,
            htmlContent: htmlContent,
            ...(attachmentsList ? { attachment: attachmentsList } : {})
          }
        : {
            from: `${senderName} <${fromEmail}>`,
            to: [toEmail],
            subject: subject,
            htmlContent: htmlContent,
            ...(attachmentsList ? { attachments: attachmentsList.map(a => ({ content: a.content, filename: a.name })) } : {})
          };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();

      if (response.ok && (data.messageId || data.id)) {
        const msgId = data.messageId || data.id;
        return {
          success: true,
          status: 'SENT',
          message: `Transactional email successfully dispatched to ${toEmail} via ${isBrevoKey ? 'Brevo API' : 'Resend API'}`,
          providerMessageId: msgId,
          providerDetails: data
        };
      } else {
        const errorText = data.message || JSON.stringify(data);
        return {
          success: false,
          status: 'FAILED',
          message: `Email provider API error (${response.status}): ${errorText}`,
          errorCode: `HTTP_${response.status}`,
          providerDetails: data
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        message: `Email dispatch network exception: ${err.message || err}`,
        errorCode: "NETWORK_EXCEPTION"
      };
    }
  }

  /**
   * Dispatches Prototype Test Email with exact test text
   */
  public static async sendPrototypeTestEmail(toEmail: string): Promise<EmailDispatchResult> {
    return this.sendAlertEmail(toEmail, {
      projectName: "LandGuard AI Prototype Test",
      surveyNumber: "Offer 1 Test",
      ownerName: "Prototype Admin",
      district: "Test District",
      riskLevel: "PROTOTYPE_TEST",
      delayProbability: 0,
      expectedDelayDays: 0,
      riskFactors: ["WhatsApp and Email integration test", "Offer 1 Active"],
      legalIssues: "None",
      documentIssues: "Verified",
      compensationStatus: "Active",
      recommendedAction: "This is a test notification from the LandGuard AI Land Acquisition Risk Management System. Offer: 1. Integration Active."
    });
  }
}
