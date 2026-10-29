// frontend/src/components/LoadingSpinner.jsx
// Full-page or inline loading indicator with accessible aria-label.

export default function LoadingSpinner({ message = 'Loading…', fullPage = false }) {
  const style = fullPage
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: '1rem',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '2rem 0',
      };

  return (
    <div style={style} role="status" aria-live="polite" aria-label={message}>
      <div className="spinner" aria-hidden="true" />
      <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)' }}>
        {message}
      </p>
      {/* Spinner animation is defined in global.css */}
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-gray-200);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
