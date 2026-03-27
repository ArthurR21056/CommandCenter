import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError, getToken, setToken, clearToken } from '../api/apiClient';

beforeEach(() => {
  clearToken();
  global.fetch = vi.fn();
});

describe('token management', () => {
  it('getToken returns null when not set', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken and getToken round-trip', () => {
    setToken('tok-123');
    expect(getToken()).toBe('tok-123');
  });

  it('clearToken removes stored token', () => {
    setToken('tok-123');
    clearToken();
    expect(getToken()).toBeNull();
  });
});

function mockOk(body, status = 200) {
  return {
    ok: true,
    status,
    json: () => Promise.resolve(body),
  };
}

function mockErr(status, body, statusText = 'Error') {
  return {
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve(body),
  };
}

describe('api.get', () => {
  it('sends GET and returns parsed JSON', async () => {
    fetch.mockResolvedValueOnce(mockOk({ items: [] }));
    const result = await api.get('/tasks');
    expect(result).toEqual({ items: [] });
    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({ method: 'GET' }));
  });

  it('omits Authorization header when no token', async () => {
    fetch.mockResolvedValueOnce(mockOk({}));
    await api.get('/tasks');
    const headers = fetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it('includes Authorization header when token is set', async () => {
    setToken('jwt.payload.sig');
    fetch.mockResolvedValueOnce(mockOk({}));
    await api.get('/tasks');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt.payload.sig');
  });
});

describe('api.post', () => {
  it('sends POST with JSON body', async () => {
    fetch.mockResolvedValueOnce(mockOk({ id: 1 }, 201));
    const result = await api.post('/tasks', { title: 'test' });
    expect(result).toEqual({ id: 1 });
    const [, opts] = fetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ title: 'test' }));
  });
});

describe('api.patch', () => {
  it('sends PATCH with JSON body', async () => {
    fetch.mockResolvedValueOnce(mockOk({ id: 1 }));
    await api.patch('/tasks/1', { status: 'done' });
    expect(fetch.mock.calls[0][1].method).toBe('PATCH');
  });
});

describe('api.delete', () => {
  it('returns null for 204 No Content', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 204 });
    const result = await api.delete('/tasks/1');
    expect(result).toBeNull();
  });
});

describe('error handling', () => {
  it('throws ApiError with status and message from body', async () => {
    fetch.mockResolvedValueOnce(mockErr(401, { message: 'Unauthorized' }, 'Unauthorized'));
    await expect(api.get('/secure')).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('falls back to statusText when body has no message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('not json')),
    });
    await expect(api.get('/fail')).rejects.toMatchObject({
      message: 'Internal Server Error',
    });
  });

  it('ApiError is an instance of Error', () => {
    const err = new ApiError(404, 'Not Found');
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not Found');
  });
});
