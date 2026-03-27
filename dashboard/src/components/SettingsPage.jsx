export default function SettingsPage({ onNavigate }) {
  return (
    <main className="app-main">
      <div className="settings-header">
        <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
          ← Back
        </button>
        <h2 className="section-title" style={{ margin: 0 }}>Settings</h2>
      </div>

      <div className="under-construction">
        <img
          src="https://media.giphy.com/media/MBxeFjpJmFAyY1iNRC/giphy.gif"
          alt="CAT excavator doing construction work"
          className="under-construction-gif"
        />
        <h3 className="under-construction-title">Under Construction</h3>
        <p className="under-construction-sub">
          This page is being built. Check back soon!
        </p>
      </div>
    </main>
  );
}
