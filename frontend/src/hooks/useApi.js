import { useCallback, useMemo } from 'react';

const API_BASE = '/api/pm';
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readCache(key) {
  if (!canUseStorage()) return null;

  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (!cached || cached.expiresAt < Date.now()) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(key, data, ttlMs) {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      expiresAt: Date.now() + ttlMs,
    }));
  } catch {
    // Storage can be full or disabled; network data should still render normally.
  }
}

export async function apiRequest(path, { token, headers, cacheTtlMs = 0, cacheKey, ...options } = {}) {
  const normalizedPath = normalizePath(path);
  const method = (options.method || 'GET').toUpperCase();
  const storageKey = cacheKey || `api-cache:${API_BASE}${normalizedPath}`;
  const shouldCache = method === 'GET' && !token && cacheTtlMs > 0;

  if (shouldCache) {
    const cached = readCache(storageKey);
    if (cached !== null) return cached;
  }

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `API request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (shouldCache) {
    writeCache(storageKey, data, cacheTtlMs || DEFAULT_CACHE_TTL_MS);
  }

  return data;
}

export function useApi(token) {
  const request = useCallback((path, options = {}) => (
    apiRequest(path, { ...options, token: options.token ?? token })
  ), [token]);

  return useMemo(() => ({
    request,
    get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options = {}) => request(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
    patch: (path, body, options = {}) => request(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  }), [request]);
}

export default useApi;
