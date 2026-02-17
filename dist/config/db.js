"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const index_1 = __importDefault(require("./index"));
exports.pool = new pg_1.Pool({
    connectionString: index_1.default.connection_str,
    ssl: { rejectUnauthorized: false },
});
const initDB = async () => {
    await exports.pool.query(`
        CREATE EXTENSION IF NOT EXISTS citext;
        `);
    await exports.pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(250) NOT NULL,
        email CITEXT NOT NULL UNIQUE,
        password TEXT NOT NULL CHECK (length(password) >=6),
        phone TEXT NOT NULL,
         role TEXT NOT NULL CHECK (role IN ('admin', 'customer'))
        )
        `);
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      vehicle_name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
      registration_number TEXT NOT NULL UNIQUE,
      daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
      availability_status TEXT NOT NULL DEFAULT 'available'
        CHECK (availability_status IN ('available', 'booked'))
    )
  `);
    await exports.pool.query(`
        CREATE TABLE IF NOT EXISTS bookings(
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL,
        total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'returned')),
        CHECK (rent_end_date > rent_start_date  )
        );
        `);
};
exports.default = initDB;
