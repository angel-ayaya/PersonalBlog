import pool from "../config/dbConfig";

interface User {
  username: string;
  email: string;
  passwordHash: string;
}

export const createUser = async (user: User) => {
  const { username, email, passwordHash } = user;
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, passwordHash]
  );
  return result.rows[0];
};

// Refresh auth token for user in database
export const setRefreshToken = async (userId: number, refreshToken: string) => {
  await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
    refreshToken,
    userId,
  ]);
};

// Get refresh token for user from database
export const getRefreshToken = async (userId: number) => {
  const result = await pool.query(
    "SELECT refresh_token FROM users WHERE id = $1",
    [userId]
  );
  return result.rows[0]?.refresh_token;
};

// Find user by email in database
export const findUserByEmail = async (email: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};
