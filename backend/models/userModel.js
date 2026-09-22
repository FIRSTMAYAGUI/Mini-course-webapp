import { pool } from '../db/database.js'; // Adjust relative import path as needed

// Queries the database to find a user by email
export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0]; // Returns user object or undefined
};

// Insert a new user into the database
export const createUser = async (fullname, email, hashedPassword, role = 'student') => {
  const query = `
    INSERT INTO users (fullname, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, fullname, email, role, created_at;
  `;
  const values = [fullname, email, hashedPassword, role];
  const result = await pool.query(query, values);
  return result.rows[0]; // Returns the newly created user object (excluding password)
};