import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../api/course';

export default function InstructorDashboardPage() {
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState<string>('');
  const [creatingCourse, setCreatingCourse] = useState<boolean>(false);
  const [courseError, setCourseError] = useState<string | null>(null);

  async function handleCreateCourse(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setCourseError(null);
    setCreatingCourse(true);
    try {
      await createCourse({ title: courseTitle });
      // Course creation succeeded — hand off to the list page rather than
      // staying here. That page re-fetches from the server, so it doesn't
      // need the new course passed along manually.
      //navigate('/courses');
    } catch (err) {
      setCourseError('Could not create the course. Try a different title.');
    } finally {
      setCourseTitle('');
      setCreatingCourse(false);
    }
  }

  return (
    <div className="dashboard">
      <h1>Instructor Dashboard</h1>

      <div className="card">
        <h2>Create a course</h2>
        {courseError && <div className="form-error">{courseError}</div>}

        <form onSubmit={handleCreateCourse}>
          <div className="field">
            <label htmlFor="courseTitle">Course title</label>
            <input
              id="courseTitle"
              type="text"
              value={courseTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCourseTitle(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={creatingCourse}>
            {creatingCourse ? 'Creating…' : 'Create course'}
          </button>
        </form>
      </div>
    </div>
  );
}