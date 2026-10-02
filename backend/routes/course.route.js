import express from 'express';
import { createCourseController, getCoursesController } from '../controllers/course.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to list all courses
router.get('/', getCoursesController);

// Protected route: logged-in instructors/users create courses
router.post('/', authenticateToken, createCourseController);

export default router;