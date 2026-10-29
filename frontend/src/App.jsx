import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';

// Admin pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ManageEventsPage from './pages/ManageEventsPage';
import EventFormPage from './pages/EventFormPage';
import RegistrationsPage from './pages/RegistrationsPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar is shown on all pages except the login page (it handles its own layout) */}
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />

        {/* All other routes show the Navbar */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                {/* ── Public routes ───────────────────────────────────── */}
                <Route path="/"           element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />

                {/* ── Admin routes (protected) ─────────────────────────── */}
                <Route
                  path="/admin/dashboard"
                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                />
                <Route
                  path="/admin/events"
                  element={<ProtectedRoute><ManageEventsPage /></ProtectedRoute>}
                />
                <Route
                  path="/admin/events/new"
                  element={<ProtectedRoute><EventFormPage /></ProtectedRoute>}
                />
                <Route
                  path="/admin/events/:id/edit"
                  element={<ProtectedRoute><EventFormPage /></ProtectedRoute>}
                />
                <Route
                  path="/admin/registrations"
                  element={<ProtectedRoute><RegistrationsPage /></ProtectedRoute>}
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
