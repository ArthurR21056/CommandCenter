import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateUserForm from '../components/CreateUserForm';

vi.mock('../api/apiClient', () => ({
  api: { post: vi.fn() },
}));

import { api } from '../api/apiClient';

beforeEach(() => {
  api.post.mockReset();
});

describe('CreateUserForm', () => {
  it('renders username, password and role fields', () => {
    render(<CreateUserForm onClose={vi.fn()} onCreated={vi.fn()} />);
    expect(screen.getByPlaceholderText('e.g. alice')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(<CreateUserForm onClose={onClose} onCreated={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button clicked', async () => {
    const onClose = vi.fn();
    render(<CreateUserForm onClose={onClose} onCreated={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('submits and calls onCreated then onClose on success', async () => {
    const newUser = { id: 1, name: 'alice', role: 'member' };
    api.post.mockResolvedValueOnce(newUser);
    const onCreated = vi.fn();
    const onClose = vi.fn();
    render(<CreateUserForm onClose={onClose} onCreated={onCreated} />);
    await userEvent.type(screen.getByPlaceholderText('e.g. alice'), 'alice');
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: 'Create User' }));
    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(newUser);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error message on API failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Username taken'));
    render(<CreateUserForm onClose={vi.fn()} onCreated={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('e.g. alice'), 'alice');
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: 'Create User' }));
    await waitFor(() => {
      expect(screen.getByText('Username taken')).toBeInTheDocument();
    });
  });

  it('shows "Creating..." and disables button while submitting', async () => {
    api.post.mockImplementation(() => new Promise(() => {}));
    render(<CreateUserForm onClose={vi.fn()} onCreated={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('e.g. alice'), 'alice');
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: 'Create User' }));
    expect(await screen.findByRole('button', { name: 'Creating...' })).toBeDisabled();
  });

  it('calls onClose when clicking modal overlay', async () => {
    const onClose = vi.fn();
    const { container } = render(<CreateUserForm onClose={onClose} onCreated={vi.fn()} />);
    const overlay = container.querySelector('.modal-overlay');
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
