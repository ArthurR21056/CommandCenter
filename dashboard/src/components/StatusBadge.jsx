const CONFIG = {
  todo: { label: 'To Do', className: 'badge-todo' },
  pending: { label: 'Pending', className: 'badge-pending' },
  done: { label: 'Done', className: 'badge-done' },
};

export default function StatusBadge({ status }) {
  const { label, className } = CONFIG[status] ?? CONFIG.todo;
  return <span className={`badge ${className}`}>{label}</span>;
}
