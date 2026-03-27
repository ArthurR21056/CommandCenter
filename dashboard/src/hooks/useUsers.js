import { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

export function useUsers() {
  const { isAuthenticated } = useUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/users').then(setUsers).catch(() => {});
  }, [isAuthenticated]);

  return { users };
}
