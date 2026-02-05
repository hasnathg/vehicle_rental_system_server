import { pool } from "../../config/db";

const createUser = async(name: string, email: string, password: string, phone: string, role: string) => {
    const result = await pool.query(
            `INSERT INTO users(name, email, password, phone, role) VALUES($1,$2,$3,$4,$5) RETURNING *`,
            [name, email, password, phone, role]
        );

        return result;
};

const getUser = async()=>{
    const result = await pool.query(`SELECT * FROM users`);
    return result;
};

const getSingleUser = async(id: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]
    );
    return result;
};

const updateUser = async(name: string, email: string, password: string, phone: string, role: string, id: string) => {
    const result = await pool.query(`UPDATE users SET name=$1, email=$2, password=$3, phone=$4, role=$5 WHERE id=$6 RETURNING *`, [name, email, password, phone, role, id
        ]);

    return result;
};

const deleteUser = async(id: string) => {
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]
    );

    return result;
};

export const userServices ={
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser,
}