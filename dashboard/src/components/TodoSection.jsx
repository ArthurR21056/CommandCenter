import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_CYCLE = ['todo', 'pending', 'done'];

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function TodoItem({ todo, onCycle, onRemove }) {
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(todo.status) + 1) % STATUS_CYCLE.length];
  return (
    <div className={`todo-item status-${todo.status}`}>
      <button
        className={`todo-check check-${todo.status}`}
        onClick={() => onCycle(todo.id)}
        title={`Mark as ${next}`}
      >
        {todo.status === 'done' ? '✓' : todo.status === 'pending' ? '◐' : '○'}
      </button>
      <div className="todo-info">
        <span className="todo-name">{todo.name}</span>
        {todo.description && <span className="todo-desc">{todo.description}</span>}
      </div>
      <div className="todo-right">
        <StatusBadge status={todo.status} />
        <span className="todo-date">{formatDate(todo.lastUsed)}</span>
        <button className="btn btn-remove" onClick={() => onRemove(todo.id)}>✕</button>
      </div>
    </div>
  );
}

export default function TodoSection({ todos, onCycle, onRemove, onAdd, onReset }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const done = todos.filter((t) => t.status === 'done').length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
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
          <button className="btn btn-secondary" onClick={onReset}>Reset</button>
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
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Task name"
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
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      )}

      <div className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-state">No todos yet.</p>
        ) : (
          todos.map((t) => (
            <TodoItem key={t.id} todo={t} onCycle={onCycle} onRemove={onRemove} />
          ))
        )}
      </div>
    </section>
  );
}
