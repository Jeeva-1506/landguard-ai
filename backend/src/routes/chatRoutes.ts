import { Router } from "express";
import { handleChatMessage } from "../controllers/chatController";

const router = Router();

router.post("/", handleChatMessage);
router.get("/history", (req, res) => res.json({ history: [] }));
router.post("/clear", (req, res) => res.json({ success: true }));

export default router;
