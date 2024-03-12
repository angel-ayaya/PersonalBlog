import pool from "../config/dbConfig";

interface User {
  username: string;
  email: string;
  passwordHash: string;
}

export const createUser = async (user : User) => {
    const { username, email, passwordHash } = user;
    const result  = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, passwordHash]
    );
    return result.rows[0];
}