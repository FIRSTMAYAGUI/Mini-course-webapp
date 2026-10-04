import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyCoursesList from './pages/instructor/MyCoursesList';
import CreateCourse from './pages/instructor/CreateCourse';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Create-course + upload-video dashboard, built for Step 9 testing.
              No route-guarding yet (should redirect to /login if not authenticated) —
              add that once Step 7's middleware pattern is mirrored on the frontend. */}
          <Route path="/instructor/courses/create" element={<CreateCourse />} />

          {/* All courses the instructor owns */}
          <Route path="/instructor/courses/mine" element={<MyCoursesList />} />

          {/* Default: send people to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}