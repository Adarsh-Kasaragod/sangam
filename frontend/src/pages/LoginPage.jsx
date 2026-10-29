// frontend/src/pages/LoginPage.jsx
// Admin login form — submits to PHP, stores returned token in localStorage.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../api/api';
import '../styles/admin.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await adminLogin(form.email, form.password);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: 420, marginBottom: '1rem' }}>
        <Link to="/" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>← Back to Events</Link>
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="icon" aria-hidden="true">🔐</div>
          <h1>Admin Portal</h1>
          <p>Sign in to manage events and registrations</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@college.edu"
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="Your admin password"
              autoComplete="current-password"
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in…' : '🔑 Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>
          Default: admin@college.edu / Admin@123
        </p>
      </div>
    </div>
  );
}
