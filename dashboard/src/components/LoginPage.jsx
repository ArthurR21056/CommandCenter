import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const { login, error, loading } = useUser();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(name, password);
    } catch {
      // error is set in context
    }
  }

  return (
    <div className="gate-screen">
      <div className="login-box">
        <div className="login-header">
          <h1 className="app-title" style={{ fontSize: '1.5rem', marginBottom: 4 }}>Command Center</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-name">Username</label>
            <input
              id="login-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
