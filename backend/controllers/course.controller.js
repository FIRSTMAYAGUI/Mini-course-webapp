import { createCourse, findCourseById, findCoursesByInstructorId, getAllCourses } from '../models/courseModel.js';
import { findEnrolledUser } from '../models/enrollmentModel.js';
import { findVideosByCourseId } from '../models/videoModel.js';

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
    console.log("my courses:", myCourses)

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

/**
 * GET /api/courses/:id/videos
 * Fetches all videos for a course if the user is authorized (enrolled student or course owner instructor)
 */
export const getCourseVideosController = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { userId, role } = req.user;

    // 1. Verify course exists
    const course = await findCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // 2. Enforce authorization rules
    if (role === 'instructor') {
      const isOwner = await isCourseOwner(userId, courseId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view videos for courses you created.',
        });
      }
    } else {
      // Student check
      const isEnrolled = await findEnrolledUser(userId, courseId);
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You must be enrolled in this course to view its videos.',
        });
      }
    }

    // 3. Fetch videos for the course
    const videos = await findVideosByCourseId(courseId);

    return res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error('Get Course Videos Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve course videos.',
    });
  }
};