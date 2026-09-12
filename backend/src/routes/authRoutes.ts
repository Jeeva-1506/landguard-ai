import { Router } from "express";
import { register, login, me, updatePreferences } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJWT, me);
router.put("/preferences", authenticateJWT, updatePreferences);
router.post("/preferences", authenticateJWT, updatePreferences);

export default router;
