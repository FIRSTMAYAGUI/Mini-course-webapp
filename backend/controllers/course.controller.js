import { createCourse, findCoursesByInstructorId, getAllCourses } from '../models/courseModel.js';

/**
 * POST /api/courses
 * Create a new course (Protected route)
 */
export const createCourseController = async (req, res) => {
  try {
    let { title } = req.body;

    // 1. Trim input fields
    title = title?.trim();
    //description = description?.trim();

    // 2. Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required',
      });
    }

    // 3. Get instructor ID from authenticated user token (attached by authenticateToken)
    const instructorId = req.user.userId;

    // 4. Create course in DB
    const newCourse = await createCourse({
      title,
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

/**
 * GET /courses/mine
 * Fetches all courses belonging to the authenticated instructor
 */
export const getMyInstructorCoursesController = async (req, res) => {
  try {
    const instructorId = req.user.userId; // From JWT payload attached by authenticateToken

    const myCourses = await findCoursesByInstructorId(instructorId);

    return res.status(200).json({
      success: true,
      data: myCourses,
    });
  } catch (error) {
    console.error('Get My Courses Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructor courses',
    });
  }
};