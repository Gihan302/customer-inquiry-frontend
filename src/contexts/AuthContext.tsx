import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler, tokenStorage } from '../services/api';
import * as authService from '../services/auth.service';
import type { User } from '../types';
import { AuthContext, type AuthStatus } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // With a stored token we must ask the server whether it is still valid before
  // deciding; without one we already know the answer.
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'checking' : 'unauthenticated',
  );

  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Any 401 from the API (expired or invalid token) signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSessionExpired(true);
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // On first load, verify a stored token with GET /auth/me.
  useEffect(() => {
    if (status !== 'checking') return;
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) logout();
      });
    return () => {
      cancelled = true;
    };
  }, [status, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    tokenStorage.set(result.token);
    setUser(result.user);
    setStatus('authenticated');
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({ user, status, sessionExpired, login, logout }),
    [user, status, sessionExpired, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
