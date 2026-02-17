"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServices = void 0;
const db_1 = require("../../config/db");
const USER_PUBLIC_FIELDS = "id, name, email, phone, role";
const createUser = async (name, email, passwordHash, phone, role) => {
    const result = await db_1.pool.query(`INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${USER_PUBLIC_FIELDS}`, [name, email.trim().toLowerCase(), passwordHash, phone, role]);
    return result.rows[0];
};
const findUserForLoginByEmail = async (email) => {
    const result = await db_1.pool.query(`SELECT id, name, email, phone, role, password
     FROM users
     WHERE email = $1`, [email.trim().toLowerCase()]);
    return result.rows[0] ?? null;
};
exports.authServices = {
    createUser,
    findUserForLoginByEmail,
};
