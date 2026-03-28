import { useUser } from '../context/UserContext';
import CreateUserForm from './CreateUserForm';
import { useState } from 'react';

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage({ onRefetchUsers }) {
  const { currentUser, isAdmin, logout } = useUser();
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <main className="app-main">
      <h2 className="section-title" style={{ marginBottom: 24 }}>Profile</h2>

      {/* Account card */}
      <div className="profile-card">
        <div className="profile-avatar">{currentUser?.name ? initials(currentUser.name) : '?'}</div>
        <div className="profile-info">
          <span className="profile-name">{currentUser?.name ?? '—'}</span>
          <span className="profile-role-badge">{currentUser?.role ?? 'member'}</span>
        </div>
      </div>

      <div className="settings-card" style={{ marginBottom: 16 }}>
        <p className="settings-section-title">Account</p>
        <div className="settings-row">
          <span className="settings-label">Username</span>
          <span className="settings-value">{currentUser?.name ?? '—'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Role</span>
          <span className="settings-role">{currentUser?.role ?? 'member'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Email</span>
          <span className="settings-value">{currentUser?.email ?? '—'}</span>
        </div>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={() => setShowCreateUser(true)}>
            + Create User
          </button>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary account-menu-item--danger" style={{ color: '#f87171' }} onClick={logout}>
          Sign out
        </button>
      </div>

      {/* Settings — under construction */}
      <div className="under-construction" style={{ paddingTop: 32 }}>
        <img
          src="https://media.giphy.com/media/MBxeFjpJmFAyY1iNRC/giphy.gif"
          alt="Under construction"
          className="under-construction-gif"
        />
        <h3 className="under-construction-title">Settings — Coming Soon</h3>
        <p className="under-construction-sub">Profile editing and preferences are being built.</p>
      </div>

      {showCreateUser && (
        <CreateUserForm
          onClose={() => setShowCreateUser(false)}
          onCreated={() => { onRefetchUsers?.(); setShowCreateUser(false); }}
        />
      )}
    </main>
  );
}
