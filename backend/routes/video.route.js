import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { streamVideoSegment, uploadAndConvertVideo } from '../controllers/video.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { requireInstructorOrAdmin } from '../middleware/roleMiddleware.js';
import { requireVideoAccess } from '../middleware/streamAuthMiddleware.js';

const router = express.Router();

// Ensure the destination folder exists before Multer attempts to save to it
const uploadDir = path.join(process.cwd(), '..', 'tmp', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure temporary disk storage for raw uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sibling tmp directory path
    cb(null, uploadDir); // 👈 3. Re-use the defined uploadDir variable here
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
router.post('/upload', 
  authenticateToken, 
  requireInstructorOrAdmin, 
  upload.single('video'), 
  uploadAndConvertVideo
);

// GET /api/videos/:id/stream/index.m3u8 & /api/videos/:id/stream/segment_000.ts
router.get(
  '/:id/stream/*filePath', 
  authenticateToken, 
  requireVideoAccess, 
  streamVideoSegment
);

export default router;