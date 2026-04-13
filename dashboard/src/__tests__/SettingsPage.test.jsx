import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../components/SettingsPage';

describe('SettingsPage', () => {
  it('renders Under Construction heading', () => {
    render(<SettingsPage onNavigate={vi.fn()} />);
    expect(screen.getByText('Under Construction')).toBeInTheDocument();
  });

  it('renders the gif image', () => {
    render(<SettingsPage onNavigate={vi.fn()} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('giphy');
  });

  it('calls onNavigate("dashboard") when back button clicked', async () => {
    const onNavigate = vi.fn();
    render(<SettingsPage onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('renders the subtitle text', () => {
    render(<SettingsPage onNavigate={vi.fn()} />);
    expect(screen.getByText(/check back soon/i)).toBeInTheDocument();
  });
});
