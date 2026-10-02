import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // 1. Read the Authorization header
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  // 2. Return 401 if no token is provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  // 3. Verify the token using jsonwebtoken
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // 4. Attach decoded payload (userId, email, role) to req.user
    req.user = decodedPayload;
    next();
  });
};