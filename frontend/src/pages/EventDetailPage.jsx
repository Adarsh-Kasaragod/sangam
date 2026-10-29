// frontend/src/pages/EventDetailPage.jsx
// Shows full event details and a registration form for students.
// Disables registration for past/closed events with a clear message.

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent, registerForEvent } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/eventdetail.css';

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatTime(str) {
  if (!str) return '';
  return new Date(str).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatDeadline(str) {
  if (!str) return null;
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const INIT_FORM = { name: '', email: '', phone: '' };

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm]         = useState(INIT_FORM);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getEvent(id)
      .then(setEvent)
      .catch(() => setLoadError('Event not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Client-side validation ─────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!form.name.trim())    errs.name  = 'Full name is required';
    if (!form.email.trim())   errs.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              errs.email = 'Please enter a valid email address';
    if (!form.phone.trim())   errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/[\s\-().+]/g, '')))
                              errs.phone = 'Phone number must be exactly 10 digits';
    return errs;
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' })); // Clear field error on change
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');
    setSuccess('');

    try {
      const res = await registerForEvent({ event_id: Number(id), ...form });
      setSuccess(res.message || 'You have been successfully registered!');
      setForm(INIT_FORM); // Clear form on success
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner message="Loading event details…" fullPage />;

  if (loadError) {
    return (
      <div className="container page-wrapper">
        <div className="alert alert-error">{loadError}</div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>← Back to Events</Link>
      </div>
    );
  }

  const canRegister = event.status === 'Upcoming';
  const spotsLeft   = event.capacity != null
    ? event.capacity - (event.registration_count || 0)
    : null;

  return (
    <div className="container page-wrapper">
      {/* Back link */}
      <Link to="/" className="event-detail-back">← Back to Events</Link>

      {/* Hero image */}
      <div className="event-detail-hero">
        {event.image_url ? (
          <>
            <img src={event.image_url} alt={`Banner for ${event.title}`} />
            <div className="event-detail-hero-overlay" />
          </>
        ) : (
          <div className="event-detail-hero-placeholder" aria-hidden="true">🎓</div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="event-detail-grid">

        {/* ── Left: Event info ─────────────────────────────────────────────── */}
        <div>
          <h1 className="event-detail-title">{event.title}</h1>

          <div className="event-detail-badges">
            <StatusBadge status={event.status} />
            {spotsLeft !== null && (
              <span
                className="status-badge"
                style={{ background: '#ede9fe', color: '#5b21b6' }}
              >
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
              </span>
            )}
          </div>

          {/* Key details */}
          <div className="event-info-list">
            <div className="event-info-item">
              <div className="event-info-icon">📅</div>
              <div className="event-info-content">
                <strong>Date &amp; Time</strong>
                <span>{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
              </div>
            </div>
            <div className="event-info-item">
              <div className="event-info-icon">📍</div>
              <div className="event-info-content">
                <strong>Venue</strong>
                <span>{event.venue}</span>
              </div>
            </div>
            {event.capacity != null && (
              <div className="event-info-item">
                <div className="event-info-icon">👥</div>
                <div className="event-info-content">
                  <strong>Capacity</strong>
                  <span>{event.registration_count} / {event.capacity} registered</span>
                </div>
              </div>
            )}
            {event.registration_deadline && (
              <div className="event-info-item">
                <div className="event-info-icon">⏰</div>
                <div className="event-info-content">
                  <strong>Registration Deadline</strong>
                  <span>{formatDeadline(event.registration_deadline)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="event-description">
            <h3>About this Event</h3>
            <p>{event.description}</p>
          </div>
        </div>

        {/* ── Right: Registration form / closed state ───────────────────────── */}
        <aside className="registration-card">
          {!canRegister ? (
            <div className="registration-closed-msg">
              <span className="icon">
                {event.status === 'Past' ? '⏳' : '🔒'}
              </span>
              <strong>
                {event.status === 'Past' ? 'Event Has Ended' : 'Registration Closed'}
              </strong>
              <p>
                {event.status === 'Past'
                  ? 'This event has already taken place.'
                  : 'Registration for this event is no longer available.'}
              </p>
            </div>
          ) : (
            <>
              <h2>Register for this Event</h2>

              {/* Success message */}
              {success && (
                <div className="alert alert-success" role="alert" style={{ marginBottom: '1.25rem' }}>
                  🎉 {success}
                </div>
              )}

              {/* Generic error */}
              {submitError && (
                <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                  {submitError}
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-name">
                      Full Name <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Adarsh Kumar"
                      autoComplete="name"
                      aria-required="true"
                      aria-describedby={errors.name ? 'err-name' : undefined}
                    />
                    {errors.name && <span id="err-name" className="field-error" role="alert">{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">
                      Email Address <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@college.edu"
                      autoComplete="email"
                      aria-required="true"
                      aria-describedby={errors.email ? 'err-email' : undefined}
                    />
                    {errors.email && <span id="err-email" className="field-error" role="alert">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-phone">
                      Contact Number <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      aria-required="true"
                      aria-describedby={errors.phone ? 'err-phone' : undefined}
                      maxLength={10}
                    />
                    {errors.phone && <span id="err-phone" className="field-error" role="alert">{errors.phone}</span>}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Registering…' : '✅ Register Now'}
                  </button>
                </form>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
