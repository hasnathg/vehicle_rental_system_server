import { pool } from "../../config/db";

const USER_PUBLIC_FIELDS = "id, name, email, phone, role";

const createUser = async (
  name: string,
  email: string,
  passwordHash: string,
  phone: string,
  role: string
) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${USER_PUBLIC_FIELDS}`,
    [name, email.trim().toLowerCase(), passwordHash, phone, role]
  );

  return result.rows[0];
};

const findUserForLoginByEmail = async (email: string) => {
  
  const result = await pool.query(
    `SELECT id, name, email, phone, role, password
     FROM users
     WHERE email = $1`,
    [email.trim().toLowerCase()]
  );

  return result.rows[0] ?? null;
};

export const authServices = {
  createUser,
  findUserForLoginByEmail,
};
