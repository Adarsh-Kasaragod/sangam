import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/** Format a datetime string for display */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function EventCard({ event }) {
  const {
    id, title, description, event_date, venue,
    image_url, status, capacity, registration_count,
  } = event;

  const spotsLeft = capacity != null ? capacity - (registration_count || 0) : null;

  return (
    <article className="event-card">
      {/* Image / Placeholder */}
      <div className="event-card-image">
        {image_url ? (
          <img src={image_url} alt={`Banner for ${title}`} loading="lazy" />
        ) : (
          <div className="event-card-image-placeholder" aria-hidden="true">🎓</div>
        )}
        <div className="event-card-badge">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <h2 className="event-card-title">{title}</h2>
        <p className="event-card-desc">{description}</p>

        <div className="event-card-meta">
          <div className="event-meta-item">
            <span className="event-meta-icon" aria-hidden="true">📅</span>
            <span>{formatDate(event_date)} &mdash; {formatTime(event_date)}</span>
          </div>
          <div className="event-meta-item">
            <span className="event-meta-icon" aria-hidden="true">📍</span>
            <span>{venue}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="event-card-footer">
        {spotsLeft !== null && (
          <span className="event-capacity-text">
            {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
          </span>
        )}
        {spotsLeft === null && <span />}

        <Link
          to={`/events/${id}`}
          className="btn btn-primary btn-sm"
          aria-label={`View details for ${title}`}
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}
