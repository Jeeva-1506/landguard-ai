import { Router } from "express";
import { getAlerts, createAlert, resolveAlert, markAlertRead, testHighRiskEmailAlert } from "../controllers/alertController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAlerts);
router.post("/", authenticateJWT, createAlert);
router.post("/test-high-risk-email", testHighRiskEmailAlert);
router.post("/:id/read", markAlertRead);
router.put("/:id/read", markAlertRead);
router.post("/:id/resolve", authenticateJWT, resolveAlert);

export default router;
