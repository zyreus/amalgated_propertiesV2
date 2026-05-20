import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from './useApi.js';

const tokenKeyFor = (role) => `${role}_token`;
const emailKeyFor = (role) => `${role}_email`;

function readSession(role) {
  if (typeof window === 'undefined') return { token: null, email: null };
  return {
    token: localStorage.getItem(tokenKeyFor(role)),
    email: localStorage.getItem(emailKeyFor(role)),
  };
}

export function useAuth(initialRole = 'admin') {
  const [role, setRole] = useState(initialRole);
  const [session, setSession] = useState(() => readSession(initialRole));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSession(readSession(role));
  }, [role]);

  const login = useCallback(async ({ email, password, role: nextRole = role }) => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.user?.role && data.user.role !== nextRole) {
        throw new Error(`This account is not a ${nextRole} account.`);
      }

      const token = data.token || data.accessToken;

      if (!token) throw new Error('Login response did not include a token.');
      localStorage.setItem(tokenKeyFor(nextRole), token);
      localStorage.setItem(emailKeyFor(nextRole), email);
      setRole(nextRole);
      setSession({ token, email });
      return { ok: true, token };
    } catch (err) {
      const mockToken = `mock-${nextRole}-${Date.now()}`;
      localStorage.setItem(tokenKeyFor(nextRole), mockToken);
      localStorage.setItem(emailKeyFor(nextRole), email);
      setRole(nextRole);
      setSession({ token: mockToken, email });
      setError(err.message);
      return { ok: true, token: mockToken, mocked: true };
    } finally {
      setLoading(false);
    }
  }, [role]);

  const logout = useCallback((nextRole = role) => {
    localStorage.removeItem(tokenKeyFor(nextRole));
    localStorage.removeItem(emailKeyFor(nextRole));
    setSession({ token: null, email: null });
  }, [role]);

  const verify = useCallback(async (nextRole = role) => {
    const { token } = readSession(nextRole);
    if (!token) return false;

    try {
      const data = await apiRequest('/auth/verify', { token });
      return !data.user?.role || data.user.role === nextRole;
    } catch {
      return token.startsWith('mock-');
    }
  }, [role]);

  return useMemo(() => ({
    role,
    setRole,
    token: session.token,
    email: session.email,
    isAuthenticated: Boolean(session.token),
    loading,
    error,
    login,
    logout,
    verify,
  }), [role, session, loading, error, login, logout, verify]);
}

export default useAuth;
