// frontend/src/pages/DashboardPage.jsx
// Admin dashboard — shows stat cards and quick-action links.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/admin.css';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => {
        // 401 = token expired
        if (err.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        } else {
          setError('Failed to load dashboard data.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard…" fullPage />;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>← Back to Site</Link>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Overview of events and registrations.</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {stats && (
        <>
          {/* Stat cards */}
          <div className="stat-cards-grid">
            <div className="stat-card">
              <div className="stat-icon blue" aria-hidden="true">🎓</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_events}</div>
                <div className="stat-label">Total Events</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green" aria-hidden="true">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_registrations}</div>
                <div className="stat-label">Total Registrations</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple" aria-hidden="true">📅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.upcoming_events}</div>
                <div className="stat-label">Upcoming Events</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="dashboard-actions">
            <Link to="/admin/events" className="action-card">
              <div className="action-card-icon" aria-hidden="true">📋</div>
              <div className="action-card-text">
                <strong>Manage Events</strong>
                <span>Create, edit, and delete events</span>
              </div>
            </Link>
            <Link to="/admin/events/new" className="action-card">
              <div className="action-card-icon" aria-hidden="true">➕</div>
              <div className="action-card-text">
                <strong>Create New Event</strong>
                <span>Add a new event to the portal</span>
              </div>
            </Link>
            <Link to="/admin/registrations" className="action-card">
              <div className="action-card-icon" aria-hidden="true">👥</div>
              <div className="action-card-text">
                <strong>View Registrations</strong>
                <span>Browse and search registrations</span>
              </div>
            </Link>
          </div>

          {/* Recent registrations */}
          {stats.recent_registrations?.length > 0 && (
            <div className="recent-section">
              <h2>Recent Registrations</h2>
              <div className="card">
                <div className="table-wrapper">
                  <table className="table" aria-label="Recent registrations">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Event</th>
                        <th>Registered At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_registrations.map((r, i) => (
                        <tr key={i}>
                          <td><strong>{r.name}</strong></td>
                          <td>{r.email}</td>
                          <td>{r.event_title}</td>
                          <td style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-xs)' }}>
                            {formatDate(r.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
