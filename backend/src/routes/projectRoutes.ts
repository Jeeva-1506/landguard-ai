import { Router } from "express";
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from "../controllers/projectController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", authenticateJWT, createProject);
router.put("/:id", authenticateJWT, updateProject);
router.delete("/:id", authenticateJWT, deleteProject);

export default router;
