/**
 * Middleware to restrict route access to Instructors and Admins
 */
export const requireInstructorOrAdmin = (req, res, next) => {
  // Ensure req.user exists (set by authenticateToken)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Authentication required.',
    });
  }

  const { role } = req.user;

  // Check if user role matches allowed roles
  if (role === 'instructor' || role === 'admin') {
    return next(); // User is authorized, proceed to controller
  }

  // Reject all other roles (e.g., standard 'user' or 'student')
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only instructors or admins can create courses.',
  });
};