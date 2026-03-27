import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

export function useUsers() {
  const { isAuthenticated } = useUser();
  const [users, setUsers] = useState([]);

  const refetch = useCallback(() => {
    if (!isAuthenticated) return;
    api.get('/users').then(setUsers).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { users, refetch };
}
