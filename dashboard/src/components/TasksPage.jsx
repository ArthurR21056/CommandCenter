import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_CYCLE = ['pending', 'in_progress', 'done'];

const PRIORITY_COLORS = {
  low:    '#64748b',
  medium: '#fb923c',
  high:   '#f87171',
};

function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.medium;
  return (
    <svg className="priority-fire" viewBox="0 0 24 24" fill={color} width="16" height="16" title={`Priority: ${priority}`}>
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
    </svg>
  );
}

function formatExpiry(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function AssigneeChip({ todo, users, onAssign }) {
  const [open, setOpen] = useState(false);
  const assignee = todo.assigned_to;
  return (
    <div className="assignee-wrap">
      <button
        className={`assignee-chip ${assignee ? 'assigned' : 'unassigned'}`}
        onClick={() => setOpen((v) => !v)}
        title={assignee ? `Assigned to ${assignee.name}` : 'Unassigned'}
      >
        {assignee ? initials(assignee.name) : '?'}
      </button>
      {open && (
        <div className="assignee-dropdown">
          <button className="assignee-option" onClick={() => { onAssign(todo.id, null); setOpen(false); }}>
            Unassigned
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              className={`assignee-option ${u.id === assignee?.id ? 'active' : ''}`}
              onClick={() => { onAssign(todo.id, u.id); setOpen(false); }}
            >
              <span className="assignee-option-avatar">{initials(u.name)}</span>
              {u.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, users, onCycle, onRemove, onAssign }) {
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(todo.status) + 1) % STATUS_CYCLE.length];
  return (
    <div className={`todo-item status-${todo.status}`}>
      <button className={`todo-check check-${todo.status}`} onClick={() => onCycle(todo.id)} title={`Mark as ${next}`}>
        {todo.status === 'done' ? '✓' : todo.status === 'in_progress' ? '◐' : '○'}
      </button>
      <AssigneeChip todo={todo} users={users} onAssign={onAssign} />
      <div className="todo-info">
        <span className="todo-name">{todo.title}</span>
        {todo.description && <span className="todo-desc">{todo.description}</span>}
      </div>
      <div className="todo-right">
        <PriorityBadge priority={todo.priority} />
        <button className="status-cycle-btn" onClick={() => onCycle(todo.id)} title={`Mark as ${next}`}>
          <StatusBadge status={todo.status} />
        </button>
        {todo.expires_at && (
          <span className="todo-expiry">Exp {formatExpiry(todo.expires_at)}</span>
        )}
        <button className="btn btn-remove" onClick={() => onRemove(todo.id)}>✕</button>
      </div>
    </div>
  );
}

function AddTaskModal({ users, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [expiresAt, setExpiresAt] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;
    const task = {
      title: title.trim(),
      description: description.trim(),
      assigned_to: Number(assigneeId),
      status,
      priority,
    };
    if (expiresAt) task.expires_at = new Date(expiresAt).toISOString();
    onAdd(task);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" autoFocus required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label>Assign to <span style={{ color: 'var(--color-error, red)' }}>*</span></label>
            <select className="form-select" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required>
              <option value="">Select assignee</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Expires at</label>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim() || !assigneeId}>Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage({ todos, users, loading, error, onCycle, onAssign, onAdd, onRemove }) {
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const filtered = todos.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && String(t.assigned_to?.id) !== filterAssignee) return false;
    return true;
  });

  const done = todos.filter((t) => t.status === 'done').length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  async function handleAdd(task) {
    await onAdd(task);
  }

  return (
    <main className="app-main">
      <div className="section-header">
        <div>
          <h2 className="section-title">Tasks</h2>
          <p className="section-sub">{done}/{todos.length} complete · {pct}%</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Task</button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <select className="form-select filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-select filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="form-select filter-select" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="">All Assignees</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="progress-bar" style={{ marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {error ? (
        <p className="section-error">Failed to load tasks: {error}</p>
      ) : (
        <div className="todo-list">
          {loading ? (
            <p className="section-loading">Loading tasks…</p>
          ) : filtered.length === 0 ? (
            <p className="empty-state">{todos.length === 0 ? 'No tasks yet.' : 'No tasks match the filters.'}</p>
          ) : (
            filtered.map((t) => (
              <TodoItem key={t.id} todo={t} users={users} onCycle={onCycle} onRemove={onRemove} onAssign={onAssign} />
            ))
          )}
        </div>
      )}

      {showModal && (
        <AddTaskModal users={users} onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
