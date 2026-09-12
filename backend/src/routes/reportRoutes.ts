import { Router } from "express";
import { generateProjectPdfReport, generateLandPdfReport, sendAuditPdfReportEmail } from "../controllers/reportController";

const router = Router();

router.post("/project/:id", generateProjectPdfReport);
router.post("/land/:id", generateLandPdfReport);
router.get("/project/:id", generateProjectPdfReport);
router.get("/land/:id", generateLandPdfReport);
router.post("/send-email-pdf", sendAuditPdfReportEmail);

export default router;
