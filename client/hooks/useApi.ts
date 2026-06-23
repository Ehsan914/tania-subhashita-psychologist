import { useState, useEffect, useCallback } from 'react';

export const API = import.meta.env.VITE_API_URL ?? '';

const TOKEN_KEY = 'mindcare_admin_token';

export function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Calls /auth/refresh (sends httpOnly cookie automatically) to get a new access token
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) { clearToken(); return null; }
    const data = await res.json();
    storeToken(data.token);
    return data.token;
  } catch {
    clearToken();
    return null;
  }
}

export function useApiData<T>(endpoint: string, defaultValue: T): {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json ?? defaultValue);
    } catch (err: any) {
      console.error(`API fetch error (${endpoint}):`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useAdminData<T>(endpoint: string, defaultValue: T): {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res = await fetch(`${API}/api/admin/${endpoint}`, { headers: getAuthHeaders() });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error('Unauthorized');
        res = await fetch(`${API}/api/admin/${endpoint}`, { headers: getAuthHeaders() });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json ?? defaultValue);
    } catch (err: any) {
      console.error(`Admin API fetch error (${endpoint}):`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export async function adminApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
  body?: any
): Promise<T> {
  const makeRequest = (token?: string | null) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const t = token ?? getStoredToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const options: RequestInit = { method, headers };
    if (body && method !== 'GET' && method !== 'DELETE') options.body = JSON.stringify(body);
    return fetch(`${API}/api/admin/${endpoint}`, options);
  };

  let res = await makeRequest();

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('Session expired. Please log in again.');
    res = await makeRequest(newToken);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
