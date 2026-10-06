import client from './client';

export interface Course {
  id: string;
  title: string;
  instructor_id?: string;
  created_at?: string;
}

// Backend response shape wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// POST /courses  { title }  ->  Course
// Instructor is read from the JWT server-side (req.user.id) — not sent here.
export async function createCourse({ title }: { title: string }): Promise<Course> {
  const response = await client.post<ApiResponse<Course>>('/courses', { title });
  return response.data.data;
}

// GET /courses/mine  ->  Course[]
export async function listMyCourses(): Promise<Course[]> {
  const response = await client.get<ApiResponse<Course[]>>('/courses/mine');
  console.log('listMyCourses response', response);
  console.log('listMyCourses response', response.data);
  return response.data.data;
}