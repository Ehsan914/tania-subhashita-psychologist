import { useState, useEffect, useCallback } from 'react';

export const API = import.meta.env.VITE_API_URL ?? '';

// Admin requests carry the Better Auth session cookie; there is no token to manage.
function adminFetch(endpoint: string, init: RequestInit = {}) {
  return fetch(`${API}/api/admin/${endpoint}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
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
      const res = await adminFetch(endpoint);
      if (res.status === 401) throw new Error('Unauthorized');
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
  const init: RequestInit = { method };
  if (body && method !== 'GET' && method !== 'DELETE') init.body = JSON.stringify(body);

  const res = await adminFetch(endpoint, init);

  if (res.status === 401) throw new Error('Session expired. Please log in again.');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
