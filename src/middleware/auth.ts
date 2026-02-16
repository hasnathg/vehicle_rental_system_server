import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

type JwtPayload = {
  id: number;
  role: "admin" | "customer";
  email: string;
  iat?: number;
  exp?: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing or invalid Authorization header",
      });
    }

    if (!config.jwt_secret) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: "JWT_SECRET is missing",
      });
    }
    const jwtSecret = config.jwt_secret;

    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing token",
      });
    }
    const decoded = jwt.verify(token, jwtSecret) as unknown as JwtPayload;

    req.user = decoded;
    return next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: "Invalid or expired token",
    });
  }
};

export const requireRole = (role: "admin" | "customer") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Not authenticated",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Insufficient permissions",
      });
    }

    return next();
  };
};

export const requireAdminOrSelf = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Not authenticated",
      });
    }

    const paramVal = Number(req.params[paramName]);
    if (Number.isNaN(paramVal)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: `${paramName} must be a number`,
      });
    }

    if (req.user.role === "admin" || req.user.id === paramVal) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden",
      errors: "Insufficient permissions",
    });
  };
};
