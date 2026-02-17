"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrSelf = exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const requireAuth = (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "Missing or invalid Authorization header",
            });
        }
        if (!config_1.default.jwt_secret) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                errors: "JWT_SECRET is missing",
            });
        }
        const jwtSecret = config_1.default.jwt_secret;
        const token = header.slice(7).trim();
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "Missing token",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            errors: "Invalid or expired token",
        });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (role) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const requireAdminOrSelf = (paramName) => {
    return (req, res, next) => {
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
exports.requireAdminOrSelf = requireAdminOrSelf;
