import React, { createContext, useContext } from 'react';
import { authClient } from '../lib/authClient';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // The session lives in an httpOnly cookie; Better Auth keeps this in sync
  // after sign-in, sign-out and account changes.
  const { data, isPending, refetch } = authClient.useSession();

  const user: User | null = data?.user
    ? { id: data.user.id, email: data.user.email, name: data.user.name, avatarUrl: data.user.image ?? '' }
    : null;

  const login = async (email: string, password: string) => {
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) return { success: false, error: error.message || 'Login failed' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    window.location.href = '/admin/login';
  };

  const refreshUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ user, loading: isPending, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
