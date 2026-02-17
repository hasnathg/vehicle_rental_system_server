"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authControllers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const auth_services_1 = require("./auth.services");
const BCRYPT_SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["admin", "customer"];
function mustGetJwtSecret() {
    if (!config_1.default.jwt_secret) {
        throw new Error("JWT_SECRET is missing in environment variables");
    }
    return config_1.default.jwt_secret;
}
const signup = async (req, res) => {
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
        if (roleStr !== "admin" && roleStr !== "customer") {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "role must be 'admin' or 'customer'",
            });
        }
        const passwordHash = await bcrypt_1.default.hash(String(password), BCRYPT_SALT_ROUNDS);
        const result = await auth_services_1.authServices.createUser(String(name), String(email), passwordHash, String(phone), roleStr);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    }
    catch (err) {
        const pgCode = err?.code;
        const isDuplicate = pgCode === "23505";
        return res.status(isDuplicate ? 400 : 500).json({
            success: false,
            message: isDuplicate ? "Bad request" : "Internal server error",
            errors: isDuplicate ? "Email already exists" : err.message,
        });
    }
};
const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "email and password are required",
            });
        }
        const user = await auth_services_1.authServices.findUserForLoginByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "Invalid email or password",
            });
        }
        const ok = await bcrypt_1.default.compare(String(password), String(user.password));
        if (!ok) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "Invalid email or password",
            });
        }
        ;
        const jwtSecret = mustGetJwtSecret();
        const expiresIn = (config_1.default.jwt_expires_in ?? "7d");
        const signOptions = { expiresIn };
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, signOptions);
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: safeUser,
            },
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
exports.authControllers = {
    signup,
    signin,
};
