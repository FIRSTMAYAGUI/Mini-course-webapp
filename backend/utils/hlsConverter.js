import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

/**
 * Converts a raw uploaded video file to HLS format
 */
export const convertToHLS = async (inputFilePath, outputDir) => {
  // Ensure target output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const playlistPath = path.join(outputDir, 'index.m3u8');
  const segmentPattern = path.join(outputDir, 'segment_%03d.ts');

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputFilePath,           // Input file
      '-codec:v', 'libx264',         // Video codec
      '-codec:a', 'aac',            // Audio codec
      '-hls_time', '15',             // 15-second segments
      '-hls_playlist_type', 'vod',   // Video on Demand
      '-hls_segment_filename', segmentPattern,
      '-start_number', '0',
      playlistPath                  // Output master playlist
    ]);

    ffmpeg.stderr.on('data', (data) => {
      // Optional logging for FFmpeg encoding output
      console.log(`[FFmpeg]: ${data.toString().trim()}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(playlistPath);
      } else {
        reject(new Error(`FFmpeg process failed with exit code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to start FFmpeg process: ${err.message}`));
    });
  });
};