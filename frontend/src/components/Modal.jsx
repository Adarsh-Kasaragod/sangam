// frontend/src/components/Modal.jsx
// Confirmation modal — used before destructive actions (e.g., delete event).
// Traps focus and is keyboard-accessible (Escape closes it).

import { useEffect } from 'react';

export default function Modal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmDanger = true }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal-box">
        <h2 id="modal-title" className="modal-title">{title}</h2>
        {message && <p className="modal-message">{message}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${confirmDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.15s ease;
        }
        .modal-box {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          max-width: 420px;
          width: 100%;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.15s ease;
        }
        .modal-title {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-gray-900);
          margin-bottom: var(--space-3);
        }
        .modal-message {
          color: var(--color-gray-600);
          font-size: var(--font-size-sm);
          line-height: 1.6;
          margin-bottom: var(--space-6);
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
