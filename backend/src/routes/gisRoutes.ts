import { Router } from "express";
import { getGisLands, getGisProjects, getGisLandById } from "../controllers/gisController";

const router = Router();

router.get("/lands", getGisLands);
router.get("/projects", getGisProjects);
router.get("/land/:id", getGisLandById);

export default router;
