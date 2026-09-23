import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Home from './pages/Home';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Placeholder until Step 8+ builds a real dashboard */}
          <Route path="/dashboard" element={<div style={{ padding: 40 }}>Dashboard coming soon</div>} />

          {/* Default: send people to login */}
          <Route path="/" element={<Home/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}