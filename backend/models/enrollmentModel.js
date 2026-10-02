import { pool } from '../db/database.js'; 

export const findEnrolledUser = async (userId, courseId) => {
  const query = 'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2';
  const result = await pool.query(query, [userId, courseId]);
  console.log("2 findEnrolledUser result:", result.rows[0]); // Log the result for debugging
  return result.rows[0]; // Returns user object or undefined
};