import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../components/LoginPage';

const mockLogin = vi.fn();

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '../context/UserContext';

beforeEach(() => {
  mockLogin.mockReset();
  useUser.mockReturnValue({ login: mockLogin, error: null, loading: false });
});

describe('LoginPage', () => {
  it('renders username and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('calls login with name and password on submit', async () => {
    mockLogin.mockResolvedValueOnce({});
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(mockLogin).toHaveBeenCalledWith('alice', 'secret');
  });

  it('shows error message when error is set', () => {
    useUser.mockReturnValue({ login: mockLogin, error: 'Invalid credentials', loading: false });
    render(<LoginPage />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables button and shows "Signing in..." when loading', () => {
    useUser.mockReturnValue({ login: mockLogin, error: null, loading: true });
    render(<LoginPage />);
    const btn = screen.getByRole('button', { name: 'Signing in...' });
    expect(btn).toBeDisabled();
  });

  it('does not throw when login rejects (error handled in context)', async () => {
    mockLogin.mockRejectedValueOnce(new Error('bad'));
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    ).resolves.not.toThrow();
  });
});
