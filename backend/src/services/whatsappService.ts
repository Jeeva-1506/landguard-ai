import dotenv from "dotenv";

dotenv.config();

export type WhatsAppStatus = 'PENDING' | 'ACCEPTED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface WhatsAppDispatchResult {
  success: boolean;
  status: WhatsAppStatus;
  message: string;
  providerMessageId?: string;
  providerDetails?: any;
  errorCode?: string;
}

export class WhatsAppService {
  /**
   * Validate WhatsApp API credentials and phone inputs
   */
  public static validateConfig(recipientPhone: string): { valid: boolean; error?: string } {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!recipientPhone || recipientPhone.trim() === "") {
      return { valid: false, error: "Recipient WhatsApp phone number is missing." };
    }

    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return { valid: false, error: `Invalid recipient phone number format: ${recipientPhone}` };
    }

    if (!accessToken || accessToken.trim() === "") {
      return { valid: false, error: "WHATSAPP_ACCESS_TOKEN is not configured in environment variables." };
    }

    return { valid: true };
  }

  /**
   * Dispatches WhatsApp message via Meta Cloud API or Brevo WhatsApp API
   */
  public static async sendWhatsAppMessage(
    recipientPhone: string,
    templateParams: {
      projectName: string;
      surveyNumber: string;
      ownerName?: string;
      district?: string;
      riskLevel: string;
      delayProbability: number | string;
      expectedDelayDays: number | string;
      issue: string;
      recommendedAction: string;
      isTest?: boolean;
    }
  ): Promise<WhatsAppDispatchResult> {
    const validation = this.validateConfig(recipientPhone);

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v18.0";
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "landguard_risk_alert";

    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");

    if (!validation.valid) {
      console.warn(`[WhatsAppService] Validation Warning: ${validation.error}`);
      return {
        success: false,
        status: 'FAILED',
        message: validation.error || "WhatsApp API credentials unconfigured.",
        errorCode: "CONFIG_MISSING"
      };
    }

    try {
      const isBrevoKey = accessToken.startsWith("xkeysib-");

      const testTag = templateParams.isTest ? "[PROTOTYPE TEST - ACTUAL LAND RECORD]\n" : "";
      const messageText = `🏛️ LandGuard AI Alert\n${testTag}\nProject: ${templateParams.projectName}\n\nSurvey Number: ${templateParams.surveyNumber}\n\nOwner: ${templateParams.ownerName || "N/A"}\n\nDistrict: ${templateParams.district || "N/A"}\n\nRisk Level: ${templateParams.riskLevel}\n\nDelay Probability: ${templateParams.delayProbability}%\n\nExpected Delay: ${templateParams.expectedDelayDays} Days\n\nIssue:\n${templateParams.issue}\n\nRecommended Action:\n${templateParams.recommendedAction}`;

      if (isBrevoKey) {
        // Brevo WhatsApp API Dispatch
        const url = "https://api.brevo.com/v3/whatsapp/sendMessage";
        const senderNum = process.env.BREVO_WHATSAPP_SENDER || cleanPhone;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": accessToken
          },
          body: JSON.stringify({
            senderNumber: senderNum,
            contactNumbers: [cleanPhone],
            text: messageText
          })
        });

        const data = await response.json();

        if (response.ok && (data.processId || data.messageId || data.id)) {
          const msgId = String(data.processId || data.messageId || data.id);
          return {
            success: true,
            status: 'ACCEPTED',
            message: `WhatsApp alert accepted by Brevo API for recipient ${cleanPhone}`,
            providerMessageId: msgId,
            providerDetails: data
          };
        } else {
          const errorDetails = data.message || JSON.stringify(data);
          return {
            success: false,
            status: 'FAILED',
            message: `Brevo WhatsApp API error (${response.status}): ${errorDetails}`,
            errorCode: data.code || `HTTP_${response.status}`,
            providerDetails: data
          };
        }
      } else {
        // Meta Official WhatsApp Business Cloud API Dispatch
        if (!phoneNumberId || phoneNumberId.trim() === "") {
          return {
            success: false,
            status: 'FAILED',
            message: "WHATSAPP_PHONE_NUMBER_ID is required for Meta Cloud API dispatch.",
            errorCode: "PHONE_ID_MISSING"
          };
        }

        const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
        
        const payload = {
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: templateParams.projectName },
                  { type: "text", text: templateParams.surveyNumber },
                  { type: "text", text: templateParams.riskLevel },
                  { type: "text", text: String(templateParams.delayProbability) },
                  { type: "text", text: String(templateParams.expectedDelayDays) },
                  { type: "text", text: templateParams.issue },
                  { type: "text", text: templateParams.recommendedAction }
                ]
              }
            ]
          }
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.messages && data.messages.length > 0) {
          const messageId = data.messages[0].id;
          return {
            success: true,
            status: 'ACCEPTED',
            message: `WhatsApp message accepted by Meta Cloud API for recipient ${cleanPhone}`,
            providerMessageId: messageId,
            providerDetails: data
          };
        } else {
          const errorDetails = data.error ? `${data.error.message} (Code: ${data.error.code})` : JSON.stringify(data);
          return {
            success: false,
            status: 'FAILED',
            message: `Meta WhatsApp API error (${response.status}): ${errorDetails}`,
            errorCode: data.error ? String(data.error.code) : `HTTP_${response.status}`,
            providerDetails: data
          };
        }
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        message: `WhatsApp dispatch network error: ${err.message || err}`,
        errorCode: "NETWORK_EXCEPTION"
      };
    }
  }

  /**
   * Dispatches prototype test WhatsApp message using actual land details
   */
  public static async sendPrototypeTestWhatsApp(
    recipientPhone: string,
    actualParams?: {
      projectName?: string;
      surveyNumber?: string;
      ownerName?: string;
      district?: string;
      riskLevel?: string;
      delayProbability?: number | string;
      expectedDelayDays?: number | string;
      issue?: string;
      recommendedAction?: string;
    }
  ): Promise<WhatsAppDispatchResult> {
    return this.sendWhatsAppMessage(recipientPhone, {
      projectName: actualParams?.projectName || "Land Acquisition Corridor",
      surveyNumber: actualParams?.surveyNumber || "124/2",
      ownerName: actualParams?.ownerName || "K. Valarmathi",
      district: actualParams?.district || "Villupuram",
      riskLevel: actualParams?.riskLevel || "High",
      delayProbability: actualParams?.delayProbability ?? 98,
      expectedDelayDays: actualParams?.expectedDelayDays ?? 166,
      issue: actualParams?.issue || "PROTOTYPE TEST: Active Title Dispute & Valuation Objection",
      recommendedAction: actualParams?.recommendedAction || "This is a prototype test notification using an actual LandGuard AI database record.",
      isTest: true
    });
  }
}
