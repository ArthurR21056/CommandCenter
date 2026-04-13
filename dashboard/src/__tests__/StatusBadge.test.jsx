import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
  it('renders "To Do" for todo status', () => {
    render(<StatusBadge status="todo" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders "Pending" for pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders "In Progress" for in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders "Done" for done status', () => {
    render(<StatusBadge status="done" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('falls back to "To Do" for unknown status', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('applies correct className for in_progress', () => {
    const { container } = render(<StatusBadge status="in_progress" />);
    expect(container.firstChild).toHaveClass('badge-in-progress');
  });

  it('applies correct className for done', () => {
    const { container } = render(<StatusBadge status="done" />);
    expect(container.firstChild).toHaveClass('badge-done');
  });
});
