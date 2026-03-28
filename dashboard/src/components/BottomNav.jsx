export default function BottomNav({ page, onNavigate }) {
  const tabs = [
    { id: 'home',       label: 'Home',   icon: '⌂' },
    { id: 'tasks',      label: 'Tasks',  icon: '✓' },
    { id: 'automation', label: 'Auto',   icon: '⚡' },
    { id: 'profile',    label: 'Profile',icon: '◉' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`bottom-nav-tab${page === t.id ? ' active' : ''}`}
          onClick={() => onNavigate(t.id)}
        >
          <span className="bottom-nav-icon">{t.icon}</span>
          <span className="bottom-nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
