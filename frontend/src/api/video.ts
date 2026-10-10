import client from './client';

export interface Video {
  id: string;
  title: string;
  course_id: string;
  storage_key: string;
  position?: number;
  created_at?: string;
}

export interface UploadVideoPayload {
  file: File;
  courseId: string;
  title: string;
}

// Shape every response from your server has: { success, data, message? }.
// axios puts that whole object in `response.data`, so the real payload
// is at `response.data.data`.
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// POST /videos/upload  (multipart/form-data: video, courseId, title)  ->  Video
// Field names are assumptions — match them to what uploadAndConvertVideo reads.
export async function uploadVideo({ file, courseId, title }: UploadVideoPayload): Promise<Video> {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('courseId', courseId);
  formData.append('title', title);

  const response = await client.post<ApiResponse<Video>>('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

// GET /courses/:courseId/videos  ->  Video[]
export async function listVideosForCourse(courseId: string): Promise<Video[]> {
  const response = await client.get<ApiResponse<Video[]>>(`/courses/${courseId}/videos`);
  return response.data.data;
}

// Absolute playlist URL for hls.js, matching your route:
//   GET /api/videos/:id/stream/*filePath
// hls.js fetches index.m3u8 first, then resolves the relative segment names
// inside it (segment_000.ts, ...) against this same URL, so every segment
// lands on the same route with no extra configuration.
// Because the path starts with "/", URL() replaces any path on the base,
// so this works whether your axios baseURL has /api on the end or not.
export function getStreamUrl(videoId: string): string {
  const base = new URL(client.defaults.baseURL ?? '/', window.location.origin);
  return new URL(`/api/videos/${videoId}/stream/index.m3u8`, base).href;
}