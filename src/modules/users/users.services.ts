import { pool } from "../../config/db";

const USER_PUBLIC_FIELD = `id, name, email, phone, role`;

const createUser = async(name: string, email: string, passwordHash: string, phone: string, role: string) => {
    const result = await pool.query(
            `INSERT INTO users(name, email, password, phone, role) VALUES($1,$2,$3,$4,$5) RETURNING ${USER_PUBLIC_FIELD}`,
            [name, email.trim().toLowerCase(), passwordHash, phone, role]
        );

        return result.rows[0];
};

const getUser = async()=>{
    const result = await pool.query(`SELECT ${USER_PUBLIC_FIELD} FROM users ORDER BY DESC`);
    return result.rows;
};

const getSingleUser = async(userId: number) => {
    const result = await pool.query(`SELECT ${USER_PUBLIC_FIELD} FROM users WHERE id = $1`, [userId]
    );
    return result.rows[0] ?? null;
};

const updateUser = async(userId: number, payload:Partial<{name: string, email: string, passwordHash: string, phone: string, role: string;}> ) => {
    const existingRes = await pool.query(
        `SELECT id, name, email, phone, role FROM users WHERE id= $1`, [userId]
    );

    if (existingRes.rowCount === 0) return null;
    const existing = existingRes.rows[0];

    const name = payload.name ?? existing.name;
    const email = payload.email ? payload.email.trim().toLowerCase() : existing.email;
    const phone = payload.phone ?? existing.phone;
    const role = payload.role ?? existing.role;

     if (payload.passwordHash){
        const result = await pool.query(
           ` UPDATE users SET name=$1, email =$2, password=$3, phone= $4, role=$5 WHERE id=$6 RETURNING ${USER_PUBLIC_FIELD}`,
           [name, email, payload.passwordHash, phone, role, userId]
        );
        return result.rows[0];
     } 

    const result = await pool.query(`UPDATE users SET name=$1, email=$2, phone=$3, role=$ WHERE id=$5 RETURNING ${USER_PUBLIC_FIELD}`, [name, email, phone, role, userId
        ]);

    return result.rows[0];
};

const deleteUser = async(userId: number) => {
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [userId]
    );

    return result.rowCount;
};

export const userServices ={
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser,
}