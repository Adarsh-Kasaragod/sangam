// frontend/src/components/StatusBadge.jsx
// Displays a color-coded pill badge for event status.
// Status values: 'Upcoming' | 'Past' | 'Registration Closed'

export default function StatusBadge({ status }) {
  const classMap = {
    'Upcoming':              'upcoming',
    'Past':                  'past',
    'Registration Closed':   'closed',
  };
  const cls = classMap[status] || 'past';

  return (
    <span className={`status-badge ${cls}`} aria-label={`Status: ${status}`}>
      {status}
    </span>
  );
}
