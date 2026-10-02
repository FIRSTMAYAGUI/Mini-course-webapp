import path from 'path';
import fs from 'fs/promises';
import { convertToHLS } from '../utils/hlsConverter.js';
import { createVideo, getNextVideoPosition } from '../models/videoModel.js';

export const uploadAndConvertVideo = async (req, res) => {
  let rawFilePath = null;

  try {
    const { courseId, title } = req.body;

    // 1. Basic validation
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }
    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'courseId and title are required' });
    }

    rawFilePath = req.file.path; // e.g., 'tmp/uploads/17123456-raw.mp4'
    const videoFolderId = `video-${Date.now()}`;
    
    // Output directory in your sibling tmp/ folder or public uploads folder
    const outputDir = path.join(process.cwd(), '..', 'tmp', 'hls', videoFolderId);

    // 2. Convert video to HLS (.m3u8 + .ts segments)
    await convertToHLS(rawFilePath, outputDir);

    // 3. Construct storage key (relative path to master playlist)
    const storageKey = `hls/${videoFolderId}/index.m3u8`;

    // 4. Calculate lesson position in the course
    const position = await getNextVideoPosition(courseId);

    // 5. Insert video metadata into PostgreSQL
    const newVideo = await createVideo({
      courseId,
      title: title.trim(),
      storageKey,
      position
    });

    // 6. Clean up the original uploaded file from tmp/
    await fs.unlink(rawFilePath).catch(() => {});

    // 7. Return successful response
    return res.status(201).json({
      success: true,
      message: 'Video uploaded, converted to HLS, and registered successfully',
      data: newVideo
    });

  } catch (error) {
    console.error('Video Upload/HLS Error:', error.message);

    // Clean up temporary file if process failed
    if (rawFilePath) {
      await fs.unlink(rawFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process video upload'
    });
  }
};