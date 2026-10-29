// frontend/src/components/ProtectedRoute.jsx
// Redirects to /admin/login if no token in localStorage.
// NOTE: This is a UX guard only — the real security is server-side in PHP.

import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
