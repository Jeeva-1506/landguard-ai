import { Router } from "express";
import { getDocuments, getDocumentById, uploadAndAnalyzeDocument, verifyDocument } from "../controllers/documentController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.post("/upload", authenticateJWT, uploadAndAnalyzeDocument);
router.post("/:id/verify", authenticateJWT, verifyDocument);

export default router;
