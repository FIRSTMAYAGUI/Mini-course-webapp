import express from 'express';
import { createCourseController, getCoursesController, getMyInstructorCoursesController } from '../controllers/course.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireInstructorOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public route to list all courses
router.get('/', getCoursesController);

// Protected route: fetch logged-in instructor's courses
// MUST come before dynamic ID routes (e.g., /:id)
router.get(
  '/mine', 
  authenticateToken, 
  requireInstructorOrAdmin, 
  getMyInstructorCoursesController
);

// Protected route: Only authenticated Instructors or Admins can create courses
router.post(
  '/', 
  authenticateToken, 
  requireInstructorOrAdmin, 
  createCourseController
);

export default router;