import { pool } from '../db/database.js'; // Adjust relative import path as needed

// Queries the database to find a user by email
export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0]; // Returns user object or undefined
};