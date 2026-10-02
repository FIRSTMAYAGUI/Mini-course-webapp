import { pool } from '../db/database.js'; // Adjust relative path if needed

/**
 * Creates a new course record in the database
 */
export const createCourse = async ({ title, description, instructorId }) => {
  const query = `
    INSERT INTO courses (title, description, instructor_id)
    VALUES ($1, $2, $3)
    RETURNING id, title, description, instructor_id, created_at;
  `;
  const values = [title, description, instructorId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Checks if a course exists by its ID
 */
export const findCourseById = async (courseId) => {
  const query = 'SELECT * FROM courses WHERE id = $1;';
  const result = await pool.query(query, [courseId]);
  return result.rows[0];
};

/**
 * Fetches all courses with their basic details
 */
export const getAllCourses = async () => {
  const query = 'SELECT id, title, description, instructor_id, created_at FROM courses ORDER BY created_at DESC;';
  const result = await pool.query(query);
  return result.rows;
};