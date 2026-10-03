import express from 'express';
import { createCourseController, getCoursesController } from '../controllers/course.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireInstructorOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public route to list all courses
router.get('/', getCoursesController);

// Protected route: Only authenticated Instructors or Admins can create courses
router.post(
  '/', 
  authenticateToken, 
  requireInstructorOrAdmin, 
  createCourseController
);

export default router;