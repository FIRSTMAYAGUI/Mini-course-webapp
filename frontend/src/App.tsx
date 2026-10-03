import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';

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
          <Route path="/dashboard" element={<InstructorDashboardPage />} />

          {/* Default: send people to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}