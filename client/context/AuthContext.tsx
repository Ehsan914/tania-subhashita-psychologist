import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API, getStoredToken, storeToken, clearToken, refreshAccessToken } from '../hooks/useApi';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  checkAuth: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getStoredToken();

    // Try stored access token first
    if (token) {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      } catch {
        // fall through to refresh
      }
    }

    // Access token missing/expired — try refresh cookie
    const newToken = await refreshAccessToken();
    if (newToken) {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      } catch {
        // fall through
      }
    }

    clearToken();
    setUser(null);
    setLoading(false);
  }, []);

  // Reload current user from server (after profile update)
  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.authenticated) setUser(data.user);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send/receive cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };

      storeToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // send cookie so server can delete the session
      });
    } catch {
      // ignore
    }
    clearToken();
    setUser(null);
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, checkAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
