import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  // PRO DEBUG: This MUST show your email in the terminal now
  console.log("🔍 FINAL DEBUG - Error Message:", err.message);
  console.log("🔍 FINAL DEBUG - Email Found in Data:", err.data?.email);
  console.log("🔍 FINAL DEBUG - Email Found on Root:", err.email);

  res.status(statusCode).json({
    status: "error",
    message: "DEBUG_IDENTIFIER_001: " + err.message, // Add this unique string
    email: err.data?.email || "MISSING_IN_MIDDLEWARE",
    details: {
      statusCode: statusCode,
      isOperational: err.isOperational || false,
    },
  });
};
