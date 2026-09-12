import { Router } from "express";
import {
  getNotificationConfig,
  sendPrototypeTestNotification,
  sendLandRiskEmailAlert,
  getNotificationHistory,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook
} from "../controllers/notificationController";

const router = Router();

router.get("/config", getNotificationConfig);
router.post("/test-send", sendPrototypeTestNotification);
router.post("/send-land-alert", sendLandRiskEmailAlert);
router.get("/history", getNotificationHistory);
router.get("/whatsapp-webhook", verifyWhatsAppWebhook);
router.post("/whatsapp-webhook", handleWhatsAppWebhook);

export default router;
