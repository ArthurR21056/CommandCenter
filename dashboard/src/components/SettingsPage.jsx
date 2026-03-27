import { useUser } from '../context/UserContext';

export default function SettingsPage({ onNavigate }) {
  const { currentUser, isAdmin } = useUser();

  return (
    <main className="app-main">
      <div className="settings-header">
        <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
          ← Back
        </button>
        <h2 className="section-title" style={{ margin: 0 }}>Settings</h2>
      </div>

      <div className="settings-card">
        <h3 className="settings-section-title">Account</h3>
        <div className="settings-row">
          <span className="settings-label">Name</span>
          <span className="settings-value">{currentUser?.name ?? '—'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Role</span>
          <span className="settings-value settings-role">{currentUser?.role ?? '—'}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="settings-card">
          <h3 className="settings-section-title">Admin</h3>
          <p className="settings-hint">
            Use the gear menu in the header to create new users.
          </p>
        </div>
      )}
    </main>
  );
}
