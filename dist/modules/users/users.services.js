"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const db_1 = require("../../config/db");
const USER_PUBLIC_FIELD = `id, name, email, phone, role`;
const createUser = async (name, email, passwordHash, phone, role) => {
    const result = await db_1.pool.query(`INSERT INTO users(name, email, password, phone, role) VALUES($1,$2,$3,$4,$5) RETURNING ${USER_PUBLIC_FIELD}`, [name, email.trim().toLowerCase(), passwordHash, phone, role]);
    return result.rows[0];
};
const getUser = async () => {
    const result = await db_1.pool.query(`SELECT ${USER_PUBLIC_FIELD} FROM users ORDER BY id DESC`);
    return result.rows;
};
const getSingleUser = async (userId) => {
    const result = await db_1.pool.query(`SELECT ${USER_PUBLIC_FIELD} FROM users WHERE id = $1`, [userId]);
    return result.rows[0] ?? null;
};
const updateUser = async (userId, payload) => {
    const existingRes = await db_1.pool.query(`SELECT id, name, email, phone, role FROM users WHERE id= $1`, [userId]);
    if (existingRes.rowCount === 0)
        return null;
    const existing = existingRes.rows[0];
    const name = payload.name ?? existing.name;
    const email = payload.email ? payload.email.trim().toLowerCase() : existing.email;
    const phone = payload.phone ?? existing.phone;
    const role = payload.role ?? existing.role;
    if (payload.passwordHash) {
        const result = await db_1.pool.query(` UPDATE users SET name=$1, email =$2, password=$3, phone= $4, role=$5 WHERE id=$6 RETURNING ${USER_PUBLIC_FIELD}`, [name, email, payload.passwordHash, phone, role, userId]);
        return result.rows[0];
    }
    const result = await db_1.pool.query(`UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING ${USER_PUBLIC_FIELD}`, [name, email, phone, role, userId
    ]);
    return result.rows[0];
};
const deleteUser = async (userId) => {
    const activeRes = await db_1.pool.query(`SELECT 1 FROM bookings WHERE customer_id = $1 AND status = 'active' LIMIT 1`, [userId]);
    if ((activeRes.rowCount ?? 0) > 0) {
        throw new Error("Cannot delete user with active bookings");
    }
    const result = await db_1.pool.query(`DELETE FROM users WHERE id=$1`, [userId]);
    return result.rowCount;
};
exports.userServices = {
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser,
};
