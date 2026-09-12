import { Router } from "express";
import { getLands, getLandById, getLandBySurveyNumber, createLand, updateLand, deleteLand } from "../controllers/landController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getLands);
router.get("/survey/:surveyNumber", getLandBySurveyNumber);
router.get("/:id", getLandById);
router.post("/", authenticateJWT, createLand);
router.put("/:id", authenticateJWT, updateLand);
router.delete("/:id", authenticateJWT, deleteLand);

export default router;
