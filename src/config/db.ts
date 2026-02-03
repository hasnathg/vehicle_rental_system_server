import { Pool } from "pg";
import dotenv from 'dotenv';
import path from "path"

dotenv.config({path: path.join(process.cwd(), '.env')});

export const pool = new Pool({
    connectionString : process.env.CONNECTION_STR,
})

export const initDB = async()=>{
    await pool.query(`
        CREATE EXTENSION IF NOT EXISTS citext;
        `)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(250) NOT NULL,
        email CITEXT NOT NULL UNIQUE,
        password TEXT NOT NULL CHECK (length(password) >=6),
        phone TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'customer'))
        );
        `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles(
        id SERIAL PRIMARY KEY,
        vehicle_name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
        registration_number TEXT NOT NULL UNIQUE,
        daily_rent_price NUMERIC NOT NULL CHECK (daily_rent_price > 0),
        availability_status TEXT NOT NULL CHECK (availability_status IN ('available', 'booked'))
        );
        `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings(
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL,
        total_price NUMERIC NOT NULL CHECK (total_price > 0),
        status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'returned')),
        CHECK (rent_end_date > rent_start_date  )
        );
        `);
    }