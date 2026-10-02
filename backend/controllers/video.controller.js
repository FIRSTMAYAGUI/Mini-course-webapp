import path from 'path';
import fs from 'fs/promises';
import { convertToHLS } from '../utils/hlsConverter.js';
import { createVideo, getNextVideoPosition } from '../models/videoModel.js';
import { findCourseById } from '../models/courseModel.js'; // 👈 1. Import course lookup

export const uploadAndConvertVideo = async (req, res) => {
  let rawFilePath = null;

  try {
    const { courseId, title } = req.body;

    // Validation checks
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }
    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'courseId and title are required' });
    }

    rawFilePath = req.file.path;

    // 👈 2. Verify course exists BEFORE running expensive FFmpeg conversion
    const courseExists = await findCourseById(courseId);
    if (!courseExists) {
      // Clean up raw file immediately
      await fs.unlink(rawFilePath).catch(() => {});
      return res.status(404).json({
        success: false,
        message: 'Course not found. Please provide a valid courseId.',
      });
    }

    const videoFolderId = `video-${Date.now()}`;
    const outputDir = path.join(process.cwd(), '..', 'tmp', 'hls', videoFolderId);

    // Convert video to HLS
    await convertToHLS(rawFilePath, outputDir);

    const storageKey = `hls/${videoFolderId}/index.m3u8`;
    const position = await getNextVideoPosition(courseId);

    // Save metadata to PostgreSQL
    const newVideo = await createVideo({
      courseId,
      title: title.trim(),
      storageKey,
      position,
    });

    // Cleanup raw video file
    await fs.unlink(rawFilePath).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Video uploaded, converted to HLS, and attached to course successfully',
      data: newVideo,
    });
  } catch (error) {
    console.error('Video Upload/HLS Error:', error.message);

    if (rawFilePath) {
      await fs.unlink(rawFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process video upload',
    });
  }
};