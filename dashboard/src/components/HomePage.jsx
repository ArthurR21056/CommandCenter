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

function TodoRow({ todo, onCycle }) {
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(todo.status) + 1) % STATUS_CYCLE.length];
  const assignee = todo.assigned_to;
  return (
    <div className={`todo-item status-${todo.status}`}>
      <button
        className={`todo-check check-${todo.status}`}
        onClick={() => onCycle(todo.id)}
        title={`Mark as ${next}`}
      >
        {todo.status === 'done' ? '✓' : todo.status === 'in_progress' ? '◐' : '○'}
      </button>
      {assignee && (
        <div className="assignee-chip assigned" title={assignee.name} style={{ pointerEvents: 'none' }}>
          {initials(assignee.name)}
        </div>
      )}
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
      </div>
    </div>
  );
}

export default function HomePage({ todos, loading, weather, city, onCycle }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const myTodos = todos.filter((t) => t.status !== 'done');
  const done = todos.filter((t) => t.status === 'done').length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <main className="app-main">
      {/* Date / Weather hero */}
      <div className="hero-panel">
        <div className="hero-date">{today}</div>
        {weather ? (
          <div className="hero-weather">
            <span className="hero-temp">{weather.temp}{weather.unit}</span>
            <span className="hero-condition">{weather.condition}</span>
            {city && <span className="hero-city">{city}</span>}
          </div>
        ) : (
          <div className="hero-weather hero-weather--loading">Loading weather…</div>
        )}
      </div>

      {/* My Tasks */}
      <div className="section-header" style={{ marginTop: 28 }}>
        <div>
          <h2 className="section-title">My Tasks</h2>
          <p className="section-sub">{done}/{todos.length} complete · {pct}%</p>
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="todo-list">
        {loading ? (
          <p className="section-loading">Loading tasks…</p>
        ) : myTodos.length === 0 && todos.length === 0 ? (
          <p className="empty-state">No tasks assigned to you.</p>
        ) : myTodos.length === 0 ? (
          <p className="empty-state">All caught up! 🎉</p>
        ) : (
          myTodos.map((t) => (
            <TodoRow key={t.id} todo={t} onCycle={onCycle} />
          ))
        )}
      </div>
    </main>
  );
}
