import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController";

const router = Router();

router.get("/", getDashboardAnalytics);
router.get("/dashboard", getDashboardAnalytics);
router.get("/projects", getDashboardAnalytics);
router.get("/risks", getDashboardAnalytics);
router.get("/delays", getDashboardAnalytics);

export default router;
