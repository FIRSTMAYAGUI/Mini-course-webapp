import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listMyCourses, type Course } from '../../api/course';

export default function MyCoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyCourses()
      .then((courses) => {
        setCourses(courses);
        // console.log('Courses loaded successfully', courses);
        // console.log('Courses loaded successfully', courses.length);
      })
      .catch(() => setError('Could not load your courses.'))
      .finally(() => setLoading(false));
  }, []);
  // console.log('Courses', courses.length);
  // console.log('Courses', courses);
  return (
    <div className="dashboard">
      <h1>Your courses</h1>

      <div className="card">
        {loading && <p>Loading…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && courses.length === 0 && (
          <p>No courses yet. <Link to="/instructor/courses/create">Create one</Link>.</p>
        )}

        {courses.length > 0 && (
          <ul className="course-list">
            {courses.map((course) => (
              <li key={course.id}>
                <Link to={`/courses/${course.id}`}>{course.title}</Link>
              </li>
            ))}
          </ul>
        )}

        <Link to="/instructor/courses/create">+ New course</Link>
      </div>
    </div>
  );
}