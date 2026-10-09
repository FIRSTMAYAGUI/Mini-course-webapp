import path from 'path';
import fs from 'fs';
import { convertToHLS } from '../utils/hlsConverter.js';
import { createVideo, getNextVideoPosition } from '../models/videoModel.js';
import { findCourseById } from '../models/courseModel.js'; // 👈 1. Import course lookup
import { findEnrolledUser } from '../models/enrollmentModel.js';

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
    console.log(rawFilePath)

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
    fs.unlink(rawFilePath, (err) => {
      if (err) console.error('Failed to delete temp file:', err.message);
    });

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

/**
 * GET /api/videos/:id/stream/*
 * Streams requested .m3u8 playlist or .ts segments
 */
export const streamVideoSegment = async (req, res) => {
  try {
    const video = req.video; // Set by requireVideoAccess middleware
    console.log('Streaming video:', video.id, 'video body', video, 'for user:', req.user.userId);

    // Requested file (default to index.m3u8)
    const requestedFile = req.params.filePath[0] || req.params[0] || 'index.m3u8';
    console.log('Requested file details:', req.params.filePath[0], 'or', req.params[0], 'defaulting to index.m3u8');
    console.log('Requested file:', requestedFile);
    
    // 2. Correctly locate the root directory in /tmp outside backend folder
    // video.storage_key is stored as "hls/video-123456/index.m3u8"
    const storageDir = path.dirname(video.storage_key); // -> "hls/video-123456"
    const videoDir = path.join(process.cwd(), '..', 'tmp', storageDir); 

    console.log('storage directory:', storageDir);
    console.log('Video directory resolved to:', videoDir);
    
    // 3. Resolve full path to requested file (index.m3u8 or segment_000.ts)
    const filePath = path.join(videoDir, requestedFile);
    console.log('Resolved file path for streaming:', filePath);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(videoDir)) {
      return res.status(400).json({ success: false, message: 'Invalid file path.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Requested video segment not found.' });
    }

    // Set correct MIME types for HLS player
    if (requestedFile.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/x-mpegURL');
    } else if (requestedFile.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/MP2T');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream file contents
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Streaming File Error:', error.message);
    return res.status(500).json({ success: false, message: 'Error streaming video file.' });
  }
};