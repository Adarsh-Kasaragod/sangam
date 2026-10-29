// frontend/src/api/api.js
// Centralised API client.
// All fetch calls go through here — sets base URL, JSON headers,
// and attaches the admin token from localStorage when present.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/event-app/backend/api';

/**
 * Core fetch wrapper.
 * @param {string} endpoint  Path relative to BASE_URL (e.g. '/events.php')
 * @param {RequestInit} options  Fetch options (method, body, etc.)
 * @returns {Promise<any>}  Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('adminToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse JSON (even for error responses — PHP returns JSON errors too)
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: 'Invalid server response' };
  }

  if (!response.ok) {
    // Throw an Error with the server's message so callers can display it
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch all events */
export const getEvents = () => request('/events.php');

/** Fetch a single event by ID */
export const getEvent = (id) => request(`/events.php?id=${id}`);

/** Register a student for an event */
export const registerForEvent = (payload) =>
  request('/register.php', { method: 'POST', body: JSON.stringify(payload) });

// ── Admin API ─────────────────────────────────────────────────────────────────

/** Admin login — returns { token, admin } */
export const adminLogin = (email, password) =>
  request('/login.php', { method: 'POST', body: JSON.stringify({ email, password }) });

/** Admin dashboard stats */
export const getStats = () => request('/stats.php');

/** Create a new event */
export const createEvent = (data) =>
  request('/events.php', { method: 'POST', body: JSON.stringify(data) });

/** Update an existing event */
export const updateEvent = (id, data) =>
  request(`/events.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });

/** Delete an event */
export const deleteEvent = (id) =>
  request(`/events.php?id=${id}`, { method: 'DELETE' });

/** Get registrations for an event, optionally filtered by search */
export const getRegistrations = (eventId, search = '') =>
  request(`/registrations.php?event_id=${eventId}&search=${encodeURIComponent(search)}`);
