import { pool } from '../db/database.js'; // Adjust relative import path as needed

// Queries the database to find a user by email
export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0]; // Returns user object or undefined
};

// Insert a new user into the database
export const createUser = async (name, email, password_hash, role = 'student') => {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;
  const values = [name, email, password_hash, role];
  const result = await pool.query(query, values);
  return result.rows[0]; // Returns the newly created user object (excluding password)
};