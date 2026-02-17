"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
const config = {
    connection_str: process.env.CONNECTION_STR,
    port: process.env.PORT ? Number(process.env.PORT) : 5000,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d"
};
if (!config.connection_str)
    throw new Error("CONNECTION_STR missing in .env");
if (!config.jwt_secret)
    throw new Error("JWT_SECRET missing in .env");
exports.default = config;
