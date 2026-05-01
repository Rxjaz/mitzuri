import { pool } from "../../shared/db/index.js";

//buscar usuario por email
export const findByEmail = async (email) => {

  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
};