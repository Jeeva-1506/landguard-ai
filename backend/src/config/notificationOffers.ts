import dotenv from "dotenv";

dotenv.config();

export interface NotificationOfferConfig {
  id: number;
  name: string;
  enabled: boolean;
  whatsappNumber?: string;
  email?: string;
  channels: ("WhatsApp" | "Email")[];
}

export interface MaskedOfferConfig {
  id: number;
  name: string;
  enabled: boolean;
  whatsappMasked?: string;
  emailMasked?: string;
  channels: ("WhatsApp" | "Email")[];
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return "Not Configured";
  const clean = phone.trim();
  if (clean.length <= 5) return "*****";
  const prefix = clean.slice(0, 3); // e.g. "+91"
  const suffix = clean.slice(-3);   // e.g. "167"
  return `${prefix}*******${suffix}`;
}

export function maskEmail(email?: string): string {
  if (!email) return "Not Configured";
  const clean = email.trim();
  const parts = clean.split("@");
  if (parts.length !== 2) return "*****";
  const [user, domain] = parts;
  const maskedUser = user.length > 1 ? `${user[0]}***` : "*";
  return `${maskedUser}@${domain}`;
}

export function getActiveOfferId(): number {
  const envOffer = process.env.PROTOTYPE_NOTIFICATION_OFFER;
  return envOffer ? parseInt(envOffer, 10) : 1;
}

export function isPrototypeMode(): boolean {
  return process.env.PROTOTYPE_NOTIFICATION_MODE === "true";
}

export function getActiveChannels(): ("WhatsApp" | "Email")[] {
  const envCh = process.env.PROTOTYPE_CHANNELS;
  if (!envCh) return ["WhatsApp", "Email"];
  const list = envCh.split(",").map(s => s.trim().toLowerCase());
  const res: ("WhatsApp" | "Email")[] = [];
  if (list.includes("whatsapp")) res.push("WhatsApp");
  if (list.includes("email")) res.push("Email");
  return res.length > 0 ? res : ["Email"];
}

export function getOfferConfigs(): NotificationOfferConfig[] {
  const activeId = getActiveOfferId();
  const channels = getActiveChannels();

  const prototypeWhatsApp = process.env.PROTOTYPE_WHATSAPP_NUMBER || "+917871534167";
  const prototypeEmail = process.env.PROTOTYPE_EMAIL || "jeevaselva0614@gmail.com";

  return [
    {
      id: 1,
      name: "Offer 1 (Prototype Active Recipient)",
      enabled: activeId === 1,
      whatsappNumber: prototypeWhatsApp,
      email: prototypeEmail,
      channels: channels
    },
    {
      id: 2,
      name: "Offer 2 (Future Recipient Group)",
      enabled: false,
      whatsappNumber: undefined,
      email: undefined,
      channels: ["WhatsApp", "Email"]
    },
    {
      id: 3,
      name: "Offer 3 (Future Escalation Team)",
      enabled: false,
      whatsappNumber: undefined,
      email: undefined,
      channels: ["WhatsApp", "Email"]
    },
    {
      id: 4,
      name: "Offer 4 (Future Regional Authority)",
      enabled: false,
      whatsappNumber: undefined,
      email: undefined,
      channels: ["WhatsApp", "Email"]
    },
    {
      id: 5,
      name: "Offer 5 (Future Ministry Secretariat)",
      enabled: false,
      whatsappNumber: undefined,
      email: undefined,
      channels: ["WhatsApp", "Email"]
    }
  ];
}

export function getMaskedOfferConfigs(): MaskedOfferConfig[] {
  return getOfferConfigs().map((offer) => ({
    id: offer.id,
    name: offer.name,
    enabled: offer.enabled,
    whatsappMasked: offer.whatsappNumber ? maskPhoneNumber(offer.whatsappNumber) : undefined,
    emailMasked: offer.email ? maskEmail(offer.email) : undefined,
    channels: offer.channels
  }));
}

export function getActiveOfferConfig(): NotificationOfferConfig | null {
  const offers = getOfferConfigs();
  return offers.find((o) => o.enabled) || offers[0];
}
