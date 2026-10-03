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