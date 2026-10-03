import client from './client';

export interface Course {
  id: string;
  title: string;
  instructor_id?: string;
  created_at?: string;
}

// POST /courses  { title }  ->  Course
// Instructor is read from the JWT server-side (req.user.id) — not sent here.
export async function createCourse({ title }: { title: string }): Promise<Course> {
  const response = await client.post<Course>('/courses', { title });
  return response.data;
}

// GET /courses/mine  ->  Course[]
export async function listMyCourses(): Promise<Course[]> {
  const response = await client.get<Course[]>('/courses/mine');
  return response.data;
}