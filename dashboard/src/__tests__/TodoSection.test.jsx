import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoSection from '../components/TodoSection';

const users = [
  { id: 1, name: 'Alice Smith' },
  { id: 2, name: 'Bob Jones' },
];

function makeTodo(overrides = {}) {
  return {
    id: 1,
    title: 'Write tests',
    description: 'Add unit tests',
    status: 'pending',
    assigned_to: null,
    last_used: null,
    ...overrides,
  };
}

const defaultProps = {
  todos: [],
  users: [],
  loading: false,
  onCycle: vi.fn(),
  onRemove: vi.fn(),
  onAdd: vi.fn(),
  onAssign: vi.fn(),
};

describe('TodoSection', () => {
  it('shows loading state', () => {
    render(<TodoSection {...defaultProps} loading={true} />);
    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
  });

  it('shows empty state when no todos', () => {
    render(<TodoSection {...defaultProps} />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders a todo title', () => {
    render(<TodoSection {...defaultProps} todos={[makeTodo()]} users={users} />);
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('renders todo description', () => {
    render(<TodoSection {...defaultProps} todos={[makeTodo()]} users={users} />);
    expect(screen.getByText('Add unit tests')).toBeInTheDocument();
  });

  it('shows 0/0 complete when empty', () => {
    render(<TodoSection {...defaultProps} />);
    expect(screen.getByText(/0\/0 complete/)).toBeInTheDocument();
  });

  it('shows correct completion count', () => {
    const todos = [
      makeTodo({ id: 1, status: 'done' }),
      makeTodo({ id: 2, status: 'pending' }),
    ];
    render(<TodoSection {...defaultProps} todos={todos} />);
    expect(screen.getByText(/1\/2 complete/)).toBeInTheDocument();
  });

  it('calls onCycle when status button clicked', async () => {
    const onCycle = vi.fn();
    render(<TodoSection {...defaultProps} todos={[makeTodo()]} onCycle={onCycle} />);
    await userEvent.click(screen.getByTitle(/mark as/i));
    expect(onCycle).toHaveBeenCalledWith(1);
  });

  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    render(<TodoSection {...defaultProps} todos={[makeTodo()]} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('shows and hides Add form on button click', async () => {
    render(<TodoSection {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(screen.getByPlaceholderText('Task name')).toBeInTheDocument();
    // Two "Cancel" buttons exist when form is open: the toggle button and the form cancel.
    // Click the form's Cancel button (second one in DOM order).
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[1]);
    expect(screen.queryByPlaceholderText('Task name')).not.toBeInTheDocument();
  });

  it('calls onAdd with title and description', async () => {
    const onAdd = vi.fn();
    render(<TodoSection {...defaultProps} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add' }));
    await userEvent.type(screen.getByPlaceholderText('Task name'), 'New task');
    await userEvent.type(screen.getByPlaceholderText('Optional description'), 'Details');
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New task', description: 'Details' })
    );
  });

  it('shows assignee selector when users provided', async () => {
    render(<TodoSection {...defaultProps} users={users} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(screen.getByText('Assign to')).toBeInTheDocument();
  });

  it('shows assignee initials when todo is assigned', () => {
    const todo = makeTodo({ assigned_to: 1 });
    render(<TodoSection {...defaultProps} todos={[todo]} users={users} />);
    expect(screen.getByTitle('Assigned to Alice Smith')).toBeInTheDocument();
  });

  it('shows unassigned chip when no assignee', () => {
    render(<TodoSection {...defaultProps} todos={[makeTodo()]} users={users} />);
    expect(screen.getByTitle('Unassigned')).toBeInTheDocument();
  });

  it('opens assignee dropdown and calls onAssign', async () => {
    const onAssign = vi.fn();
    const todo = makeTodo({ assigned_to: null });
    render(<TodoSection {...defaultProps} todos={[todo]} users={users} onAssign={onAssign} />);
    await userEvent.click(screen.getByTitle('Unassigned'));
    await userEvent.click(screen.getByText('Alice Smith'));
    expect(onAssign).toHaveBeenCalledWith(1, 1);
  });

  it('can unassign via dropdown', async () => {
    const onAssign = vi.fn();
    const todo = makeTodo({ assigned_to: 1 });
    render(<TodoSection {...defaultProps} todos={[todo]} users={users} onAssign={onAssign} />);
    await userEvent.click(screen.getByTitle('Assigned to Alice Smith'));
    await userEvent.click(screen.getByText('Unassigned'));
    expect(onAssign).toHaveBeenCalledWith(1, null);
  });

  it('shows ✓ icon for done status', () => {
    render(<TodoSection {...defaultProps} todos={[makeTodo({ status: 'done' })]} />);
    expect(screen.getByTitle(/mark as pending/i)).toHaveTextContent('✓');
  });

  it('shows ◐ icon for in_progress status', () => {
    render(<TodoSection {...defaultProps} todos={[makeTodo({ status: 'in_progress' })]} />);
    expect(screen.getByTitle(/mark as done/i)).toHaveTextContent('◐');
  });

  it('shows ○ icon for pending status', () => {
    render(<TodoSection {...defaultProps} todos={[makeTodo({ status: 'pending' })]} />);
    expect(screen.getByTitle(/mark as in_progress/i)).toHaveTextContent('○');
  });
});
