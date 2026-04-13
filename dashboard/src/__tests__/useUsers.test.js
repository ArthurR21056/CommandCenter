import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUsers } from '../hooks/useUsers';

vi.mock('../api/apiClient', () => ({
  api: { get: vi.fn() },
}));

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(() => ({ isAuthenticated: true })),
}));

import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

const mockUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue(mockUsers);
});

describe('useUsers', () => {
  it('fetches users on mount when authenticated', async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.users).toHaveLength(2));
    expect(api.get).toHaveBeenCalledWith('/users');
  });

  it('does not fetch when not authenticated', async () => {
    useUser.mockReturnValueOnce({ isAuthenticated: false });
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.users).toEqual([]);
  });

  it('refetch re-fetches the user list', async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.users).toHaveLength(2));
    api.get.mockResolvedValueOnce([mockUsers[0]]);
    await act(async () => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.users).toHaveLength(1));
  });

  it('silently ignores fetch errors', async () => {
    api.get.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    expect(result.current.users).toEqual([]);
  });
});
