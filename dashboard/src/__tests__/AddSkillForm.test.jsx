import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddSkillForm from '../components/AddSkillForm';

describe('AddSkillForm', () => {
  it('renders method select, url, name, description fields', () => {
    render(<AddSkillForm onAdd={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://api.example.com/endpoint')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Deploy Staging')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What does this action do?')).toBeInTheDocument();
  });

  it('hides body textarea for GET method', () => {
    render(<AddSkillForm onAdd={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByPlaceholderText('{"key": "value"}')).not.toBeInTheDocument();
  });

  it('shows body textarea when method is POST', async () => {
    render(<AddSkillForm onAdd={vi.fn()} onCancel={vi.fn()} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'POST');
    expect(screen.getByPlaceholderText('{"key": "value"}')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<AddSkillForm onAdd={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('submits with correct shape for GET', async () => {
    const onAdd = vi.fn();
    render(<AddSkillForm onAdd={onAdd} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('e.g. Deploy Staging'), 'My Skill');
    await userEvent.type(screen.getByPlaceholderText('https://api.example.com/endpoint'), 'https://example.com/api');
    await userEvent.click(screen.getByRole('button', { name: 'Add Skill' }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Skill',
        method: 'GET',
        url: 'https://example.com/api',
        headers: {},
        body: '',
      })
    );
  });

  it('includes Content-Type header for POST with body', async () => {
    const onAdd = vi.fn();
    render(<AddSkillForm onAdd={onAdd} onCancel={vi.fn()} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'POST');
    await userEvent.type(screen.getByPlaceholderText('e.g. Deploy Staging'), 'Post Skill');
    await userEvent.type(screen.getByPlaceholderText('https://api.example.com/endpoint'), 'https://example.com/api');
    // Use fireEvent.change to avoid userEvent special-char parsing of curly braces
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(screen.getByPlaceholderText('{"key": "value"}'), {
      target: { value: '{"key":"val"}' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Add Skill' }));
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        body: '{"key":"val"}',
      })
    );
  });

  it('does not call onAdd when name is empty', async () => {
    const onAdd = vi.fn();
    render(<AddSkillForm onAdd={onAdd} onCancel={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('https://api.example.com/endpoint'), 'https://example.com/api');
    await userEvent.click(screen.getByRole('button', { name: 'Add Skill' }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
