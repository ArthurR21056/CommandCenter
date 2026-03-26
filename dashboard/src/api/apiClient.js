const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(path, options = {}) {
  const clientKey = localStorage.getItem('commandcenter_client_key');

  const headers = {
    'Content-Type': 'application/json',
    ...(clientKey ? { 'X-User-Id': clientKey } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || res.statusText);
  }

  return res.json();
}

export const api = {
  get:    (path)         => apiFetch(path, { method: 'GET' }),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
};
