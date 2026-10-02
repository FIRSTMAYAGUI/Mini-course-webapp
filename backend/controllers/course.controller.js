import { createCourse, getAllCourses } from '../models/courseModel.js';

/**
 * POST /api/courses
 * Create a new course (Protected route)
 */
export const createCourseController = async (req, res) => {
  try {
    let { title, description } = req.body;

    // 1. Trim input fields
    title = title?.trim();
    description = description?.trim();

    // 2. Validate input
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Course title and description are required',
      });
    }

    // 3. Get instructor ID from authenticated user token (attached by authenticateToken)
    const instructorId = req.user.userId;

    // 4. Create course in DB
    const newCourse = await createCourse({
      title,
      description,
      instructorId,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse,
    });
  } catch (error) {
    console.error('Create Course Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create course',
    });
  }
};

/**
 * GET /api/courses
 * Fetch all available courses
 */
export const getCoursesController = async (req, res) => {
  try {
    const courses = await getAllCourses();
    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Get Courses Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
    });
  }
};