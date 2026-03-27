import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_CYCLE = ['pending', 'in_progress', 'done'];

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function AssigneeChip({ todo, users, onAssign }) {
  const [open, setOpen] = useState(false);
  const assignee = users.find((u) => u.id === todo.assigned_to);

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
          <button
            className="assignee-option"
            onClick={() => { onAssign(todo.id, null); setOpen(false); }}
          >
            Unassigned
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              className={`assignee-option ${u.id === todo.assigned_to ? 'active' : ''}`}
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
      <button
        className={`todo-check check-${todo.status}`}
        onClick={() => onCycle(todo.id)}
        title={`Mark as ${next}`}
      >
        {todo.status === 'done' ? '✓' : todo.status === 'in_progress' ? '◐' : '○'}
      </button>
      <div className="todo-info">
        <span className="todo-name">{todo.title}</span>
        {todo.description && <span className="todo-desc">{todo.description}</span>}
      </div>
      <div className="todo-right">
        <AssigneeChip todo={todo} users={users} onAssign={onAssign} />
        <StatusBadge status={todo.status} />
        <span className="todo-date">{formatDate(todo.last_used)}</span>
        <button className="btn btn-remove" onClick={() => onRemove(todo.id)}>✕</button>
      </div>
    </div>
  );
}

export default function TodoSection({ todos, users = [], loading, onCycle, onRemove, onAdd, onAssign }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState('pending');

  const done = todos.filter((t) => t.status === 'done').length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !assigneeId) return;
    onAdd({
      title: name.trim(),
      description: description.trim(),
      assigned_to: Number(assigneeId),
      status,
    });
    setName('');
    setDescription('');
    setAssigneeId('');
    setStatus('pending');
    setShowForm(false);
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Todos</h2>
          <p className="section-sub">{done}/{todos.length} complete · {pct}%</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {showForm && (
        <form className="add-skill-form" onSubmit={handleAdd} style={{ marginBottom: 16 }}>
          <h3>Add Todo</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Task title"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="form-group">
            <label>Assign to <span style={{ color: 'var(--color-error, red)' }}>*</span></label>
            <select
              className="form-select"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              required
            >
              <option value="">Select assignee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || !assigneeId}>Add</button>
          </div>
        </form>
      )}

      <div className="todo-list">
        {loading ? (
          <p className="section-loading">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="empty-state">No todos yet.</p>
        ) : (
          todos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              users={users}
              onCycle={onCycle}
              onRemove={onRemove}
              onAssign={onAssign}
            />
          ))
        )}
      </div>
    </section>
  );
}
