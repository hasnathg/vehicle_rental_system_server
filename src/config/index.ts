import dotenv from 'dotenv';
import path from "path"

dotenv.config({path: path.join(process.cwd(), '.env')});

const config = {
    connection_str : process.env.CONNECTION_STR,
    port : process.env.PORT ? Number(process.env.PORT) : 5000,
};

if (!config.connection_str) throw new Error("CONNECTION_STR missing in .env");

export default config;