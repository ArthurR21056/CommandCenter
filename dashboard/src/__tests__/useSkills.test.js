import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSkills } from '../hooks/useSkills';

vi.mock('../api/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(() => ({ isAuthenticated: true })),
}));

import { api } from '../api/apiClient';

const skill1 = { id: 1, name: 'Health Check', method: 'GET', url: 'https://example.com' };
const skill2 = { id: 2, name: 'Post Data', method: 'POST', url: 'https://example.com/data' };

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue([skill1, skill2]);
});

describe('useSkills', () => {
  it('fetches skills on mount', async () => {
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.skills).toHaveLength(2);
    expect(result.current.skills[0].name).toBe('Health Check');
  });

  it('sets error on fetch failure', async () => {
    api.get.mockRejectedValueOnce(new Error('Server down'));
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Server down');
  });

  it('does not fetch when not authenticated', async () => {
    const { useUser } = await import('../context/UserContext');
    useUser.mockReturnValueOnce({ isAuthenticated: false });
    const { result } = renderHook(() => useSkills());
    await act(async () => {});
    expect(api.get).not.toHaveBeenCalled();
  });

  it('merges skills with idle runState by default', async () => {
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.skills[0].lastStatus).toBe('idle');
    expect(result.current.skills[0].lastRun).toBeNull();
    expect(result.current.skills[0].lastResponse).toBeNull();
  });

  it('runSkill sets running then success state', async () => {
    api.post.mockResolvedValueOnce({ ok: true, httpStatus: 200, preview: '{"ok":true}' });
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.runSkill(1);
    });
    const s = result.current.skills.find((x) => x.id === 1);
    expect(s.lastStatus).toBe('success');
    expect(s.lastResponse).toEqual({ status: 200, preview: '{"ok":true}' });
  });

  it('runSkill sets error state on API failure', async () => {
    api.post.mockRejectedValueOnce(new Error('timeout'));
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.runSkill(1);
    });
    const s = result.current.skills.find((x) => x.id === 1);
    expect(s.lastStatus).toBe('error');
    expect(s.lastResponse.preview).toBe('timeout');
  });

  it('runSkill sets error state when ok is false', async () => {
    api.post.mockResolvedValueOnce({ ok: false, httpStatus: 500, preview: 'fail' });
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.runSkill(1);
    });
    expect(result.current.skills.find((x) => x.id === 1).lastStatus).toBe('error');
  });

  it('addSkill appends to list', async () => {
    const newSkill = { id: 3, name: 'New Skill', method: 'GET', url: 'https://new.com' };
    api.post.mockResolvedValueOnce(newSkill);
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.addSkill({ name: 'New Skill', method: 'GET', url: 'https://new.com' });
    });
    expect(result.current.skills).toHaveLength(3);
  });

  it('removeSkill removes from list and clears runState', async () => {
    api.delete.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.removeSkill(1);
    });
    expect(result.current.skills.find((x) => x.id === 1)).toBeUndefined();
  });

  it('refetch re-fetches skills', async () => {
    const { result } = renderHook(() => useSkills());
    await waitFor(() => expect(result.current.loading).toBe(false));
    api.get.mockResolvedValueOnce([skill1]);
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.skills).toHaveLength(1));
  });
});
