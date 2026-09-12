import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Express Central Error Handler:", err.stack || err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected internal server error occurred.",
    timestamp: new Date().toISOString()
  });
};
