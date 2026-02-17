"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_services_1 = require("./users.services");
const BCRYPT_SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["admin", "customer"];
const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "name, email, password, phone, role are required",
            });
        }
        const roleStr = String(role);
        if (!ALLOWED_ROLES.includes(roleStr)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "role must be 'admin' or 'customer'",
            });
        }
        const passwordHash = await bcrypt_1.default.hash(String(password), BCRYPT_SALT_ROUNDS);
        const result = await users_services_1.userServices.createUser(String(name), String(email), passwordHash, String(phone), roleStr);
        return res.status(201).json({
            success: true,
            message: "Data inserted succesfully",
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: true,
            message: "Internal server error",
            errors: error.message,
        });
    }
};
const getUser = async (req, res) => {
    try {
        const result = await users_services_1.userServices.getUser();
        return res.status(200).json({
            success: true,
            message: result.length ? "user retrieved succefully" : "No users found",
            data: result,
        });
    }
    catch (err) {
        return res.status(500).json({
            sussess: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
const getSingleUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "userId must be a number",
            });
        }
        const result = await users_services_1.userServices.getSingleUser(userId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User fetched succesfully",
            data: result,
        });
    }
    catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
const updateUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "userId must be a number",
            });
        }
        const { name, email, password, phone, role } = req.body;
        const payload = {};
        if (name !== undefined)
            payload.name = String(name);
        if (email !== undefined)
            payload.email = String(email);
        if (phone !== undefined)
            payload.phone = String(phone);
        if (role !== undefined) {
            const roleStr = String(role);
            if (!ALLOWED_ROLES.includes(roleStr)) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: "role must be 'admin' or 'customer'",
                });
            }
            payload.role = roleStr;
        }
        if (password !== undefined && String(password).length > 0) {
            payload.passwordHash = await bcrypt_1.default.hash(String(password), BCRYPT_SALT_ROUNDS);
        }
        const result = await users_services_1.userServices.updateUser(userId, payload);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server erroe",
            errors: err.message,
        });
    }
};
const deleteUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "userId must be a number",
            });
        }
        const result = await users_services_1.userServices.deleteUser(userId);
        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted succesfully",
            data: null,
        });
    }
    catch (err) {
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("Cannot delete user with active bookings");
        return res.status(isBadRequest ? 400 : 500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server erroe",
            errors: err.message,
        });
    }
};
exports.userControllers = {
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser,
};
