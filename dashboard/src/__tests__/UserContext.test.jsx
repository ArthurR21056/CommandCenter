import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProvider, useUser } from '../context/UserContext';

vi.mock('../api/apiClient', () => ({
  api: { post: vi.fn() },
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

import { api, getToken, setToken, clearToken } from '../api/apiClient';

function makeJwt(payload) {
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

function TestConsumer() {
  const { isAuthenticated, isAdmin, currentUser, login, logout, error, loading } = useUser();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <span data-testid="name">{currentUser?.name ?? ''}</span>
      <span data-testid="error">{error ?? ''}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => login('alice', 'pass').catch(() => {})}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  api.post.mockReset();
  getToken.mockReturnValue(null);
  setToken.mockReset();
  clearToken.mockReset();
});

describe('UserContext', () => {
  it('starts unauthenticated when no token in storage', () => {
    render(<UserProvider><TestConsumer /></UserProvider>);
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
  });

  it('starts authenticated when token already in storage', () => {
    const token = makeJwt({ name: 'alice', role: 'member' });
    getToken.mockReturnValue(token);
    render(<UserProvider><TestConsumer /></UserProvider>);
    expect(screen.getByTestId('auth')).toHaveTextContent('true');
    expect(screen.getByTestId('name')).toHaveTextContent('alice');
  });

  it('isAdmin is true when role is admin', () => {
    const token = makeJwt({ name: 'root', role: 'admin' });
    getToken.mockReturnValue(token);
    render(<UserProvider><TestConsumer /></UserProvider>);
    expect(screen.getByTestId('admin')).toHaveTextContent('true');
  });

  it('isAdmin is false when role is member', () => {
    const token = makeJwt({ name: 'alice', role: 'member' });
    getToken.mockReturnValue(token);
    render(<UserProvider><TestConsumer /></UserProvider>);
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
  });

  it('login sets token and authenticates', async () => {
    const token = makeJwt({ name: 'alice', role: 'member' });
    api.post.mockResolvedValueOnce({ token });
    render(<UserProvider><TestConsumer /></UserProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('true');
    });
    expect(setToken).toHaveBeenCalledWith(token);
  });

  it('login sets error on failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Wrong password'));
    render(<UserProvider><TestConsumer /></UserProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Wrong password');
    });
  });

  it('logout clears token and unauthenticates', async () => {
    const token = makeJwt({ name: 'alice', role: 'member' });
    getToken.mockReturnValue(token);
    render(<UserProvider><TestConsumer /></UserProvider>);
    expect(screen.getByTestId('auth')).toHaveTextContent('true');
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
    expect(clearToken).toHaveBeenCalled();
  });

  it('handles invalid token gracefully (currentUser is null)', () => {
    getToken.mockReturnValue('not.valid.jwt');
    render(<UserProvider><TestConsumer /></UserProvider>);
    expect(screen.getByTestId('name')).toHaveTextContent('');
  });
});
