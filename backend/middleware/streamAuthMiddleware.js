import { findVideoById } from '../models/videoModel.js';
import { findEnrolledUser } from '../models/enrollmentModel.js';
import { isCourseOwner } from '../models/courseModel.js';

/**
 * Authorizes video playback:
 * - Student: Must be authenticated AND enrolled in the course.
 * - Instructor: Must be authenticated AND be the creator/owner of the course.
 */
export const requireVideoAccess = async (req, res, next) => {
  try {
    const { id: videoId } = req.params;
    const { userId, role } = req.user;

    // 1. Retrieve the video to locate its parent course
    const video = await findVideoById(videoId);
    console.log('Video found:', video, 'for user:', userId, 'with role:', role);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    // Attach video object to request so controller doesn't need to fetch it again
    req.video = video;

    // 2. Instructor Access Path
    if (role === 'instructor') {
      const isOwner = await isCourseOwner(userId, video.course_id);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view videos for courses you created.',
        });
      }
      return next();
    }

    // 3. Student Access Path
    const isEnrolled = await findEnrolledUser(userId, video.course_id);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course to play this video.',
      });
    }

    return next();
  } catch (error) {
    console.error('Video Stream Auth Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to authorize video access.' });
  }
};