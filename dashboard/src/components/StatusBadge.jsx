const CONFIG = {
  todo:        { label: 'To Do',       className: 'badge-todo' },
  pending:     { label: 'Pending',     className: 'badge-pending' },
  in_progress: { label: 'In Progress', className: 'badge-in-progress' },
  done:        { label: 'Done',        className: 'badge-done' },
};

export default function StatusBadge({ status }) {
  const { label, className } = CONFIG[status] ?? CONFIG.todo;
  return <span className={`badge ${className}`}>{label}</span>;
}
