import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadAndConvertVideo } from '../controllers/video.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Optional route protection
import { requireInstructorOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Configure temporary disk storage for raw uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sibling tmp directory path
    cb(null, path.join(process.cwd(), '..', 'tmp', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// POST /api/videos/upload
router.post('/upload', requireInstructorOrAdmin, authenticateToken, upload.single('video'), uploadAndConvertVideo);

export default router;