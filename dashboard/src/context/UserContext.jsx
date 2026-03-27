import { createContext, useContext, useState, useCallback } from 'react';
import { api, setToken, clearToken, getToken } from '../api/apiClient';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // If a token already exists in localStorage, start as authenticated
  const [token, setTokenState] = useState(() => getToken());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token);

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

  return (
    <UserContext.Provider value={{ token, isAuthenticated, login, logout, error, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
