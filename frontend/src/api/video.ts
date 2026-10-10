import client from './client';

// Assumes your existing /upload route now also accepts courseId and title
// fields alongside the file, and inserts a row into `videos` after FFmpeg
// finishes (this is Step 9's backend work). Adjust field names below to
// match whatever your Express route actually expects.

export interface uploadLoadVideoPayload {
  file: File;
  courseId: string;
  title: string;
} 

export interface Video {
  id: string;
  title: string;
  course_id: string;
  storage_key: string;
  position?: number;
  created_at?: string;
}

export async function uploadVideo({ file, courseId, title }: uploadLoadVideoPayload) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('courseId', courseId);
  formData.append('title', title);

  const response = await client.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// POST /upload  (multipart/form-data: video, courseId, title)  ->  Video
// export async function uploadVideo({
//   file,
//   courseId,
//   title,
// }: {
//   file: File;
//   courseId: string;
//   title: string;
// }): Promise<Video> {
//   const formData = new FormData();
//   formData.append('video', file);
//   formData.append('courseId', courseId);
//   formData.append('title', title);

//   const response = await client.post<Video>('/api/videos/upload', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// }

// Absolute playlist URL for hls.js, matching your route:
//   GET /api/videos/:id/stream/*filePath
// hls.js fetches index.m3u8 first, then resolves the relative segment names
// inside it (segment_000.ts, ...) against this same URL, so every segment
// lands on the same route with no extra configuration.
// Building it with URL() works whether your axios baseURL is
// "http://localhost:3000" or "http://localhost:3000/api" (no doubled /api).
export function getStreamUrl(videoId: string): string {
  const base = new URL(client.defaults.baseURL ?? '/', window.location.origin);
  return new URL(`/api/videos/${videoId}/stream/index.m3u8`, base).href;
}

// GET /courses/:courseId/videos  ->  Video[]
// This route likely doesn't exist on your backend yet — it's needed for
// CourseVideosPage to show what's already been uploaded to a course.
export async function listVideosForCourse(courseId: string): Promise<Video[]> {
  const response = await client.get<Video[]>(`/courses/${courseId}/videos`);
  return response.data;
}