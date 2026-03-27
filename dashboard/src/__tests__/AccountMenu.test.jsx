import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountMenu from '../components/AccountMenu';

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '../context/UserContext';

const mockLogout = vi.fn();

function clickGear() {
  return userEvent.click(screen.getByTitle('Account settings'));
}

beforeEach(() => {
  mockLogout.mockReset();
  useUser.mockReturnValue({
    logout: mockLogout,
    isAdmin: false,
    currentUser: { name: 'alice' },
  });
});

describe('AccountMenu', () => {
  it('renders gear button', () => {
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    expect(screen.getByTitle('Account settings')).toBeInTheDocument();
  });

  it('dropdown is closed by default', () => {
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('opens dropdown when gear button clicked', async () => {
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    await clickGear();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('shows username in dropdown', async () => {
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    await clickGear();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('hides "Create User" for non-admin', async () => {
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    await clickGear();
    expect(screen.queryByText('Create User')).not.toBeInTheDocument();
  });

  it('shows "Create User" for admin', async () => {
    useUser.mockReturnValue({ logout: mockLogout, isAdmin: true, currentUser: { name: 'admin' } });
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    await clickGear();
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('calls onNavigate("settings") when Settings clicked', async () => {
    const onNavigate = vi.fn();
    render(<AccountMenu onNavigate={onNavigate} onCreateUser={vi.fn()} />);
    await clickGear();
    await userEvent.click(screen.getByText('Settings'));
    expect(onNavigate).toHaveBeenCalledWith('settings');
  });

  it('calls onCreateUser when Create User clicked (admin)', async () => {
    useUser.mockReturnValue({ logout: mockLogout, isAdmin: true, currentUser: { name: 'admin' } });
    const onCreateUser = vi.fn();
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={onCreateUser} />);
    await clickGear();
    await userEvent.click(screen.getByText('Create User'));
    expect(onCreateUser).toHaveBeenCalled();
  });

  it('calls logout when Sign out clicked', async () => {
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    await clickGear();
    await userEvent.click(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />
        <span data-testid="outside">outside</span>
      </div>
    );
    await clickGear();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('renders without username when currentUser is null', async () => {
    useUser.mockReturnValue({ logout: mockLogout, isAdmin: false, currentUser: null });
    render(<AccountMenu onNavigate={vi.fn()} onCreateUser={vi.fn()} />);
    await clickGear();
    expect(screen.queryByText('alice')).not.toBeInTheDocument();
  });
});
