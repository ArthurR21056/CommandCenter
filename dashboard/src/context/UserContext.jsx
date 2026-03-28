import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setToken, clearToken, getToken, setOn401Handler } from '../api/apiClient';

const UserContext = createContext(null);

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  // If a token already exists in localStorage, start as authenticated
  const [token, setTokenState] = useState(() => getToken());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token);
  const currentUser = token ? decodeToken(token) : null;
  const isAdmin = currentUser?.role === 'admin';

  const login = useCallback(async (name, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { name, password });
      setToken(res.token);
      setTokenState(res.token);

    } catch (err) {
      setError(err.message || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  useEffect(() => {
    setOn401Handler(logout);
    return () => setOn401Handler(null);
  }, [logout]);

  return (
    <UserContext.Provider value={{ token, isAuthenticated, currentUser, isAdmin, login, logout, error, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
