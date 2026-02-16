const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || '';

function normalizeApiBase(baseUrl) {
  if (!baseUrl) return '/api';
  const cleaned = baseUrl.replace(/\/+$/, '');
  return /\/api$/i.test(cleaned) ? cleaned : `${cleaned}/api`;
}

const API_BASE = normalizeApiBase(rawApiUrl);

function buildApiUrl(endpoint) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${normalizedEndpoint}`;
}

function getToken() {
  return localStorage.getItem('token');
}

export async function api(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (error) {
    const err = new Error('Unable to reach server. Check API URL and network.');
    err.status = 0;
    err.data = { message: error?.message || 'Network request failed' };
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  let data = {};
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    const text = await res.text().catch(() => '');
    if (text) data = { message: text };
  }

  if (!res.ok) {
    const err = new Error(data.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function getAuthToken() {
  return getToken();
}
