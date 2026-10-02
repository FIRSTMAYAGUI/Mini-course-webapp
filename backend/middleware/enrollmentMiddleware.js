import { findEnrolledUser } from '../models/enrollmentModel.js';

export const enrollmentCheck = async (req, res, next) => {
    const userId = req.user.userId; // Assuming userId is stored in req.user after authentication
    const courseId = req.params.courseId; // Assuming courseId is passed as a route parameter

    // Check if the user is enrolled in the course
    const enrolledUser = await findEnrolledUser(userId, courseId);
    
    if (!enrolledUser) {
        return res.status(403).json({ error: 'User is not enrolled in this course' });
    }
    next();
};