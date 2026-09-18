import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Resume from './pages/Resume';
import AIInterview from './pages/AIInterview';
import MCQ from './pages/MCQ';
import Coding from './pages/Coding';
import DailyPractice from './pages/DailyPractice';
import AICareerCoach from './pages/AICareerCoach';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Notifications from './pages/Notifications';
import History from './pages/History';
import Reports from './pages/Reports';
import './App.css'; // Global App overrides if any

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/interview" element={<AIInterview />} />
            <Route path="/mcq" element={<MCQ />} />
            <Route path="/coding" element={<Coding />} />
            <Route path="/daily" element={<DailyPractice />} />
            <Route path="/coach" element={<AICareerCoach />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/history" element={<History />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
