// frontend/src/api.js
// Frontend API helper used by pages/components to call backend endpoints.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function safeJson(res) {
  // Read text then try to parse JSON. If parsing fails return raw text.
  const txt = await res.text().catch(() => '');
  try {
    return txt ? JSON.parse(txt) : {};
  } catch {
    return { raw: txt };
  }
}

async function handleResponse(res) {
  const body = await safeJson(res);
  if (!res.ok) {
    // Create an Error object with server message if present
    const err = new Error(body && body.message ? body.message : `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/* Authentication */
export async function register(data) {
  // expected data: { name, username, password, email }
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function login(data) {
  // expected data: { identifier, password } where identifier is username or email
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* Links CRUD */
export async function fetchLinks(query = {}) {
  const params = new URLSearchParams(query).toString();
  const res = await fetch(`${API_BASE}/api/links${params ? `?${params}` : ''}`, {
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function createLink(data) {
  // expected data: { title, url, notes, tags }
  const res = await fetch(`${API_BASE}/api/links`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateLink(id, data) {
  const res = await fetch(`${API_BASE}/api/links/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteLink(id) {
  const res = await fetch(`${API_BASE}/api/links/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  return handleResponse(res);
}

/* Optional helper to logout locally */
export function logoutLocal() {
  localStorage.removeItem('token');
}
