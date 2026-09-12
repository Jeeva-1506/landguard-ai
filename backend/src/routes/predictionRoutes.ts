import { Router } from "express";
import { predictDelay, predictCost, predictLegal, getPredictionsForLand } from "../controllers/predictionController";

const router = Router();

router.post("/delay", predictDelay);
router.post("/cost", predictCost);
router.post("/legal", predictLegal);
router.get("/land/:landId", getPredictionsForLand);

export default router;
