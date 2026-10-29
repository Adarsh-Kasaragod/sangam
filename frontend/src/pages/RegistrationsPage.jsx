// frontend/src/pages/RegistrationsPage.jsx
// Admin page: select an event, view its registrations, search by name or email.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEvents, getRegistrations } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import '../styles/admin.css';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function RegistrationsPage() {
  const navigate = useNavigate();
  const [events, setEvents]               = useState([]);
  const [selectedId, setSelectedId]       = useState('');
  const [search, setSearch]               = useState('');
  const [regData, setRegData]             = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs]     = useState(false);
  const [error, setError]                 = useState('');

  // Load event list for selector dropdown
  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoadingEvents(false));
  }, []);

  // Fetch registrations when event or search changes
  const fetchRegs = useCallback((eventId, searchTerm) => {
    if (!eventId) { setRegData(null); return; }
    setLoadingRegs(true);
    setError('');
    getRegistrations(eventId, searchTerm)
      .then(setRegData)
      .catch((err) => {
        if (err.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else {
          setError('Failed to load registrations.');
        }
      })
      .finally(() => setLoadingRegs(false));
  }, [navigate]);

  // Auto-fetch on event change
  useEffect(() => { fetchRegs(selectedId, search); }, [selectedId]); // eslint-disable-line

  // Debounced search
  useEffect(() => {
    if (!selectedId) return;
    const timer = setTimeout(() => fetchRegs(selectedId, search), 350);
    return () => clearTimeout(timer);
  }, [search, selectedId, fetchRegs]);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/admin/dashboard" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>← Dashboard</Link>
          <div>
            <h1>Registration Management</h1>
            <p>Select an event to view and search its registrations.</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Event selector */}
      <div className="reg-event-selector">
        <label htmlFor="event-select">Select Event:</label>
        {loadingEvents ? (
          <span style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>Loading…</span>
        ) : (
          <select
            id="event-select"
            className="form-select"
            style={{ flex: 1, maxWidth: 400 }}
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setSearch(''); }}
          >
            <option value="">— Choose an event —</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.status})
              </option>
            ))}
          </select>
        )}

        {/* Total count badge */}
        {regData && (
          <div className="reg-count-badge">
            <span>👥</span>
            <span>{regData.total_count} registered</span>
          </div>
        )}
      </div>

      {/* Search and table */}
      {selectedId && (
        <>
          <div className="admin-toolbar" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="search-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                className="search-input"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search registrations"
              />
            </div>
            {regData && search && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                Showing {regData.filtered_count} of {regData.total_count} results
              </span>
            )}
          </div>

          {loadingRegs ? (
            <LoadingSpinner message="Loading registrations…" />
          ) : regData?.registrations?.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={search ? 'No results found' : 'No registrations yet'}
              message={
                search
                  ? `No registrations match "${search}".`
                  : 'No one has registered for this event yet.'
              }
            />
          ) : regData?.registrations ? (
            <div className="card">
              <div className="table-wrapper">
                <table className="table" aria-label={`Registrations for ${regData.event.title}`}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regData.registrations.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-xs)' }}>
                          {i + 1}
                        </td>
                        <td><strong>{r.name}</strong></td>
                        <td>
                          <a href={`mailto:${r.email}`} style={{ color: 'var(--color-primary)' }}>
                            {r.email}
                          </a>
                        </td>
                        <td>{r.phone}</td>
                        <td style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-xs)' }}>
                          {formatDate(r.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}

      {!selectedId && !loadingEvents && (
        <EmptyState
          icon="📊"
          title="Select an event"
          message="Choose an event from the dropdown above to view its registrations."
        />
      )}
    </div>
  );
}
