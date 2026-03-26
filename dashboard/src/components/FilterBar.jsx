const FILTERS = ['all', 'todo', 'pending', 'done'];

export default function FilterBar({ active, onChange, counts }) {
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`filter-btn ${active === f ? 'active' : ''}`}
          onClick={() => onChange(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
          <span className="filter-count">{counts[f] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
