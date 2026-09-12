import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (req.user.role === "ADMIN" || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(430).json({
      error: `Access Denied: Role '${req.user.role}' is not authorized to perform this operation. Required: ${allowedRoles.join(", ")}`
    });
  };
};
