import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'mindcare_admin_token';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Generic hook to fetch data from the public API
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
      const res = await fetch(`/api/${endpoint}`);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook to fetch data from the admin API (with JWT auth)
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
      const res = await fetch(`/api/admin/${endpoint}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json ?? defaultValue);
    } catch (err: any) {
      console.error(`Admin API fetch error (${endpoint}):`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Helper for admin CRUD mutations (with JWT auth)
export async function adminApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
  body?: any
): Promise<T> {
  const headers = getAuthHeaders();
  const options: RequestInit = { method, headers };
  if (body && method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`/api/admin/${endpoint}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
