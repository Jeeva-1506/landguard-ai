import { Request, Response } from "express";
import { processChatMessage } from "../services/chatService";

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { message, projectId, userId, userRole, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Chat prompt message is required" });
    }

    const result = await processChatMessage({
      message,
      projectId: projectId || null,
      userId: userId || "USR-GUEST",
      userRole: userRole || "VIEWER",
      language: language || "en"
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to process AI Chatbot message" });
  }
};
