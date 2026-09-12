import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const JWT_SECRET = process.env.JWT_SECRET || "landguard_secret_jwt_key_2026";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired authorization token." });
      }
      req.user = decoded;
      next();
    });
  } else {
    // Default fallback user for development/unauthenticated public endpoints where allowed
    req.user = {
      id: "USR-GUEST",
      email: "guest@landguard.gov.in",
      role: "VIEWER",
      name: "Public Viewer"
    };
    next();
  }
};
