import { pool } from "../../shared/db/index.js";

export const findByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT id, email, password_hash, full_name, is_active
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT id, email, full_name, is_active, created_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};