import { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

export function useUsers() {
  const { isReady } = useUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isReady) return;
    api.get('/users').then(setUsers).catch(() => {});
  }, [isReady]);

  return { users };
}
