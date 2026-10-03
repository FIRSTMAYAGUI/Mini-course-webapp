import express from 'express';
import dotenv from 'dotenv'
import { pool } from './db/database.js';
import authRoutes from './routes/auth.route.js'
import courseRoutes from './routes/course.route.js'
import videoRoutes from './routes/video.route.js'
import cors from 'cors'
import { authenticateToken } from './middleware/authMiddleware.js';
import { enrollmentCheck } from './middleware/enrollmentMiddleware.js';

dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/test', async(req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.json(users).status(200);
  } catch (error) {
    console.log(error)
    res.json(error).status(500);
  }
});

app.get('/me', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected user data retrieved successfully.',
    user: req.user
  });
});

/* app.get('/courses/:courseId', authenticateToken, enrollmentCheck, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'enrolled user data retrieved successfully.',
    user: req.user
  });
}); */

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});