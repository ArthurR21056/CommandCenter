import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillCard from '../components/SkillCard';

function makeSkill(overrides = {}) {
  return {
    id: 1,
    name: 'Health Check',
    description: 'Pings the server',
    method: 'GET',
    url: 'https://api.example.com/health',
    lastStatus: 'idle',
    lastRun: null,
    lastResponse: null,
    ...overrides,
  };
}

describe('SkillCard', () => {
  it('renders skill name, description, method and url', () => {
    render(<SkillCard skill={makeSkill()} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Health Check')).toBeInTheDocument();
    expect(screen.getByText('Pings the server')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/health')).toBeInTheDocument();
  });

  it('shows "Never" when lastRun is null', () => {
    render(<SkillCard skill={makeSkill()} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('shows "Idle" badge by default', () => {
    render(<SkillCard skill={makeSkill()} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('shows "Running" badge when running', () => {
    render(<SkillCard skill={makeSkill({ lastStatus: 'running' })} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('shows "Success" badge on success', () => {
    render(<SkillCard skill={makeSkill({ lastStatus: 'success' })} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('shows "Error" badge on error', () => {
    render(<SkillCard skill={makeSkill({ lastStatus: 'error' })} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('run button is disabled when running', () => {
    render(<SkillCard skill={makeSkill({ lastStatus: 'running' })} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByRole('button', { name: '...' })).toBeDisabled();
  });

  it('run button is enabled when idle', () => {
    render(<SkillCard skill={makeSkill()} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByRole('button', { name: '▶ Run' })).not.toBeDisabled();
  });

  it('calls onRun with skill id when run button clicked', async () => {
    const onRun = vi.fn();
    render(<SkillCard skill={makeSkill()} onRun={onRun} onRemove={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '▶ Run' }));
    expect(onRun).toHaveBeenCalledWith(1);
  });

  it('calls onRemove with skill id when remove button clicked', async () => {
    const onRemove = vi.fn();
    render(<SkillCard skill={makeSkill()} onRun={vi.fn()} onRemove={onRemove} />);
    await userEvent.click(screen.getByTitle('Remove'));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('shows response preview when lastResponse is set', () => {
    const skill = makeSkill({
      lastStatus: 'success',
      lastResponse: { status: 200, preview: '{"ok":true}' },
    });
    render(<SkillCard skill={skill} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('{"ok":true}')).toBeInTheDocument();
    expect(screen.getByText('HTTP 200')).toBeInTheDocument();
  });

  it('shows response without status when status is null', () => {
    const skill = makeSkill({
      lastStatus: 'error',
      lastResponse: { status: null, preview: 'Network error' },
    });
    render(<SkillCard skill={skill} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByText(/HTTP/)).not.toBeInTheDocument();
  });

  it('falls back to idle badge for unknown status', () => {
    render(<SkillCard skill={makeSkill({ lastStatus: 'unknown' })} onRun={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });
});
