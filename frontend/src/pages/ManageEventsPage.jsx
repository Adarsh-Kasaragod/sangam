// frontend/src/pages/ManageEventsPage.jsx
// Admin page: table of all events with Edit / Delete actions.
// Delete shows a confirmation modal; confirmed delete calls the API.

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import '../styles/admin.css';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ManageEventsPage() {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState({ open: false, event: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchEvents = useCallback(() => {
    setLoading(true);
    getEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteEvent(modal.event.id);
      setModal({ open: false, event: null });
      fetchEvents(); // Refresh list
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
      setError('Failed to delete event: ' + (err.message || 'Unknown error'));
      setModal({ open: false, event: null });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading events…" fullPage />;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/dashboard" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>← Dashboard</Link>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
              Manage Events
            </h1>
            <p style={{ color: 'var(--color-gray-500)', marginTop: '0.25rem', fontSize: 'var(--font-size-sm)' }}>
              {events.length} event{events.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <Link to="/admin/events/new" className="btn btn-primary">
          ➕ Create Event
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No events yet"
          message="Create your first event to get started."
          action={<Link to="/admin/events/new" className="btn btn-primary">Create Event</Link>}
        />
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table" aria-label="Events management table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-xs)' }}>
                      {event.id}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-gray-900)' }}>{event.title}</strong>
                    </td>
                    <td>{formatDate(event.event_date)}</td>
                    <td style={{ color: 'var(--color-gray-500)' }}>{event.venue}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary-light)',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                      }}>
                        {event.registration_count}
                        {event.capacity != null ? ` / ${event.capacity}` : ''}
                      </span>
                    </td>
                    <td><StatusBadge status={event.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/admin/events/${event.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          aria-label={`Edit ${event.title}`}
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setModal({ open: true, event })}
                          aria-label={`Delete ${event.title}`}
                          disabled={deleting}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={modal.open}
        title="Delete Event"
        message={`Are you sure you want to delete "${modal.event?.title}"? This will permanently remove the event and all its registrations. This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setModal({ open: false, event: null })}
      />
    </div>
  );
}
