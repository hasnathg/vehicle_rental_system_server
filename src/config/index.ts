import dotenv from 'dotenv';
import path from "path"

dotenv.config({path: path.join(process.cwd(), '.env')});

const config = {
    connection_str: process.env.CONNECTION_STR,
    port: process.env.PORT ? Number(process.env.PORT) : 5000,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d"
};

if (!config.connection_str) throw new Error("CONNECTION_STR missing in .env");
if (!config.jwt_secret) throw new Error("JWT_SECRET missing in .env");


export default config;