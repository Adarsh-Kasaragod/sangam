// frontend/src/components/EmptyState.jsx
// Shown when a list has no items (no events, no registrations, etc.)

export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1rem',
        gap: '1rem',
      }}
    >
      <span style={{ fontSize: '3.5rem' }} aria-hidden="true">{icon}</span>
      <h3 style={{ fontWeight: 700, color: 'var(--color-gray-700)', fontSize: '1.25rem' }}>
        {title}
      </h3>
      {message && (
        <p style={{ color: 'var(--color-gray-500)', maxWidth: 360, lineHeight: 1.6 }}>
          {message}
        </p>
      )}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}
