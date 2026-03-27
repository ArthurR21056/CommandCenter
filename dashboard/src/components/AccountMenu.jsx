import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export default function AccountMenu({ onNavigate, onCreateUser }) {
  const { logout, isAdmin, currentUser } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handle(fn) {
    setOpen(false);
    fn();
  }

  return (
    <div className="account-menu-wrap" ref={ref}>
      <button
        className="btn btn-secondary account-menu-btn"
        onClick={() => setOpen((v) => !v)}
        title="Account settings"
        aria-haspopup="true"
        aria-expanded={open}
      >
        ⚙
      </button>

      {open && (
        <div className="account-menu-dropdown">
          {currentUser?.name && (
            <div className="account-menu-user">{currentUser.name}</div>
          )}
          <button className="account-menu-item" onClick={() => handle(() => onNavigate('settings'))}>
            Settings
          </button>
          {isAdmin && (
            <button className="account-menu-item" onClick={() => handle(onCreateUser)}>
              Create User
            </button>
          )}
          <div className="account-menu-divider" />
          <button className="account-menu-item account-menu-item--danger" onClick={() => handle(logout)}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
