import { useState, useEffect } from 'react';
import { getEvents } from '../api/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import '../styles/events.css';

const FILTERS = ['All', 'Upcoming', 'Past', 'Registration Closed'];

export default function EventsPage() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('All');

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  // Apply selected filter
  const filtered = filter === 'All'
    ? events
    : events.filter(e => e.status === filter);

  return (
    <>
      {/* Hero */}
      <div className="events-hero">
        <h1>Sangam</h1>
        <p>All campus events in one place — workshops, seminars, fests and more at Parrophins College.</p>
      </div>

      <main className="container" style={{ padding: 'var(--space-10) var(--page-padding)' }}>
        {loading && <LoadingSpinner message="Loading events…" fullPage />}

        {error && (
          <div className="alert alert-error" role="alert">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Filter tabs */}
            <div className="events-filters" role="tablist" aria-label="Filter events">
              {FILTERS.map(f => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  {f !== 'All' && (
                    <span style={{ marginLeft: 4, opacity: 0.7 }}>
                      ({events.filter(e => e.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <EmptyState
                icon="🗓️"
                title="No events found"
                message={
                  filter === 'All'
                    ? 'No events have been added yet. Check back soon!'
                    : `No "${filter}" events at the moment.`
                }
              />
            ) : (
              <div className="events-grid">
                {filtered.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
