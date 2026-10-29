// frontend/src/pages/EventFormPage.jsx
// Create or Edit event form (shared by /admin/events/new and /admin/events/:id/edit).
// Validates required fields and date formats before submitting.

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent, createEvent, updateEvent } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/admin.css';

// Convert a DB datetime string to HTML datetime-local format for input
function toDatetimeLocal(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

const INIT = {
  title: '', description: '', event_date: '', venue: '',
  image_url: '', capacity: '', registration_deadline: '',
};

export default function EventFormPage() {
  const { id } = useParams();
  const isEdit  = !!id;
  const navigate = useNavigate();

  const [form, setForm]     = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit); // Load existing data when editing
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load existing event data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    getEvent(id)
      .then(event => {
        setForm({
          title:                 event.title || '',
          description:           event.description || '',
          event_date:            toDatetimeLocal(event.event_date),
          venue:                 event.venue || '',
          image_url:             event.image_url || '',
          capacity:              event.capacity != null ? String(event.capacity) : '',
          registration_deadline: toDatetimeLocal(event.registration_deadline),
        });
      })
      .catch(() => setSubmitError('Failed to load event data.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
    setSubmitError('');
  };

  // Client-side validation
  function validate() {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.event_date)         errs.event_date  = 'Event date and time is required';
    if (!form.venue.trim())       errs.venue       = 'Venue is required';
    if (form.capacity !== '' && (isNaN(Number(form.capacity)) || Number(form.capacity) < 1))
                                  errs.capacity    = 'Capacity must be a positive number';
    return errs;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      title:                 form.title.trim(),
      description:           form.description.trim(),
      event_date:            form.event_date,
      venue:                 form.venue.trim(),
      image_url:             form.image_url.trim() || null,
      capacity:              form.capacity !== '' ? Number(form.capacity) : null,
      registration_deadline: form.registration_deadline || null,
    };

    try {
      if (isEdit) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      navigate('/admin/events');
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      setSubmitError(err.message || 'Failed to save event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading event…" fullPage />;

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/events" className="btn btn-ghost">← Back</Link>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
        </div>
      </div>

      <div className="event-form-card">
        {submitError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="event-form-grid">

            {/* Title — full width */}
            <div className="form-group event-form-full">
              <label className="form-label" htmlFor="f-title">
                Event Title <span className="required">*</span>
              </label>
              <input
                id="f-title" name="title" type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={form.title} onChange={handleChange}
                placeholder="e.g. Annual Tech Fest 2026"
                aria-required="true"
              />
              {errors.title && <span className="field-error" role="alert">{errors.title}</span>}
            </div>

            {/* Description — full width */}
            <div className="form-group event-form-full">
              <label className="form-label" htmlFor="f-desc">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="f-desc" name="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                value={form.description} onChange={handleChange}
                placeholder="Describe the event, what attendees can expect, etc."
                rows={5}
                aria-required="true"
              />
              {errors.description && <span className="field-error" role="alert">{errors.description}</span>}
            </div>

            {/* Event date */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-date">
                Event Date &amp; Time <span className="required">*</span>
              </label>
              <input
                id="f-date" name="event_date" type="datetime-local"
                className={`form-input ${errors.event_date ? 'error' : ''}`}
                value={form.event_date} onChange={handleChange}
                aria-required="true"
              />
              {errors.event_date && <span className="field-error" role="alert">{errors.event_date}</span>}
            </div>

            {/* Venue */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-venue">
                Venue <span className="required">*</span>
              </label>
              <input
                id="f-venue" name="venue" type="text"
                className={`form-input ${errors.venue ? 'error' : ''}`}
                value={form.venue} onChange={handleChange}
                placeholder="e.g. Main Auditorium, Block A"
                aria-required="true"
              />
              {errors.venue && <span className="field-error" role="alert">{errors.venue}</span>}
            </div>

            {/* Capacity */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-capacity">
                Capacity <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="f-capacity" name="capacity" type="number" min="1"
                className={`form-input ${errors.capacity ? 'error' : ''}`}
                value={form.capacity} onChange={handleChange}
                placeholder="Leave blank for unlimited"
              />
              {errors.capacity && <span className="field-error" role="alert">{errors.capacity}</span>}
            </div>

            {/* Registration deadline */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-deadline">
                Registration Deadline <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="f-deadline" name="registration_deadline" type="datetime-local"
                className="form-input"
                value={form.registration_deadline} onChange={handleChange}
              />
            </div>

            {/* Image URL — full width */}
            <div className="form-group event-form-full">
              <label className="form-label" htmlFor="f-image">
                Banner Image URL <span style={{ color: 'var(--color-gray-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="f-image" name="image_url" type="url"
                className="form-input"
                value={form.image_url} onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
              />
              {form.image_url && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={form.image_url}
                    alt="Banner preview"
                    style={{ maxHeight: 120, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <Link to="/admin/events" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? (isEdit ? '⏳ Saving…' : '⏳ Creating…')
                : (isEdit ? '💾 Save Changes' : '➕ Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
