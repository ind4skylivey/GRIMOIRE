import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearTokens,
  fetchMe,
  getAccessToken,
  login as apiLogin,
  logout as apiLogout,
  refresh as apiRefresh,
  register as apiRegister,
} from './api/client';

type User = { id: string; email: string; role: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      try {
        await apiRefresh();
        const me = await fetchMe();
        setUser(me);
      } catch {
        clearTokens();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await apiRegister(email, password);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
