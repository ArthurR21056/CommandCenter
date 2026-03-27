import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';

vi.mock('../api/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(() => ({ isAuthenticated: true })),
}));

import { api } from '../api/apiClient';

const todo1 = { id: 1, title: 'Task A', status: 'pending', assigned_to: null };
const todo2 = { id: 2, title: 'Task B', status: 'in_progress', assigned_to: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ tasks: [todo1, todo2] });
});

describe('useTodos', () => {
  it('fetches todos on mount', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toEqual([todo1, todo2]);
  });

  it('handles flat array response (data.tasks ?? data)', async () => {
    api.get.mockResolvedValueOnce([todo1]);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toEqual([todo1]);
  });

  it('sets error when fetch fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
  });

  it('does not fetch when not authenticated', async () => {
    const { useUser } = await import('../context/UserContext');
    useUser.mockReturnValueOnce({ isAuthenticated: false });
    const { result } = renderHook(() => useTodos());
    await act(async () => {});
    expect(api.get).not.toHaveBeenCalled();
  });

  it('cycleStatus updates todo status optimistically', async () => {
    const updated = { ...todo1, status: 'in_progress' };
    api.patch.mockResolvedValueOnce(updated);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.cycleStatus(1);
    });
    expect(result.current.todos.find((t) => t.id === 1).status).toBe('in_progress');
  });

  it('cycleStatus rolls back on API error', async () => {
    api.patch.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      try {
        await result.current.cycleStatus(1);
      } catch {}
    });
    expect(result.current.todos.find((t) => t.id === 1).status).toBe('pending');
  });

  it('assignTodo updates assigned_to optimistically', async () => {
    const updated = { ...todo1, assigned_to: 2 };
    api.patch.mockResolvedValueOnce(updated);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.assignTodo(1, 2);
    });
    expect(result.current.todos.find((t) => t.id === 1).assigned_to).toBe(2);
  });

  it('assignTodo rolls back on error', async () => {
    api.patch.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.assignTodo(1, 99);
    });
    expect(result.current.todos.find((t) => t.id === 1).assigned_to).toBeNull();
  });

  it('addTodo appends new todo', async () => {
    const newTodo = { id: 3, title: 'Task C', status: 'pending' };
    api.post.mockResolvedValueOnce(newTodo);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addTodo({ title: 'Task C' });
    });
    expect(result.current.todos).toHaveLength(3);
    expect(result.current.todos[2]).toEqual(newTodo);
  });

  it('removeTodo removes the todo', async () => {
    api.delete.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.removeTodo(1);
    });
    expect(result.current.todos.find((t) => t.id === 1)).toBeUndefined();
  });
});
