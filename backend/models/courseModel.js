import { pool } from '../db/database.js'; // Adjust relative path if needed

/**
 * Creates a new course record in the database
 */
export const createCourse = async ({ title, instructorId }) => {
  const query = `
    INSERT INTO courses (title, instructor_id)
    VALUES ($1, $2)
    RETURNING id, title,instructor_id, created_at;
  `;
  const values = [title, instructorId];
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
  const query = 'SELECT id, title, instructor_id, created_at FROM courses ORDER BY created_at DESC;';
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Fetches all courses created by a specific instructor
 */
export const findCoursesByInstructorId = async (instructorId) => {
  const query = `
    SELECT id, title, instructor_id, created_at 
    FROM courses 
    WHERE instructor_id = $1 
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [instructorId]);
  return result.rows;
};

/**
 * Checks if a specific course belongs to an instructor
 */
export const isCourseOwner = async (instructorId, courseId) => {
  const query = 'SELECT id FROM courses WHERE id = $1 AND instructor_id = $2';
  const result = await pool.query(query, [courseId, instructorId]);
  return result.rows.length > 0;
};