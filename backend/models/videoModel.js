import { pool } from '../db/database.js'; // Adjust relative path if needed

/**
 * Inserts a new video record into the database
 */
export const createVideo = async ({ courseId, title, storageKey, position = 1 }) => {
  const query = `
    INSERT INTO videos (course_id, title, storage_key, position)
    VALUES ($1, $2, $3, $4)
    RETURNING id, course_id, title, storage_key, position, created_at;
  `;
  const values = [courseId, title, storageKey, position];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Helper to determine the next position number for a lesson in a course
 */
export const getNextVideoPosition = async (courseId) => {
  const query = `
    SELECT COALESCE(MAX(position), 0) + 1 AS next_position
    FROM videos
    WHERE course_id = $1;
  `;
  const result = await pool.query(query, [courseId]);
  return parseInt(result.rows[0].next_position, 10);
};