const STATUS_CONFIG = {
  idle:    { label: 'Idle',    className: 'run-badge-idle' },
  running: { label: 'Running', className: 'run-badge-running' },
  success: { label: 'Success', className: 'run-badge-success' },
  error:   { label: 'Error',   className: 'run-badge-error' },
};

function formatTime(iso) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function SkillCard({ skill, onRun, onRemove }) {
  const { label, className } = STATUS_CONFIG[skill.lastStatus] ?? STATUS_CONFIG.idle;
  const isRunning = skill.lastStatus === 'running';

  return (
    <div className={`skill-card run-${skill.lastStatus}`}>
      <div className="skill-card-header">
        <div className="skill-info">
          <h3 className="skill-name">{skill.name}</h3>
          <p className="skill-description">{skill.description}</p>
        </div>
        <span className={`badge ${className}`}>{label}</span>
      </div>

      <div className="skill-meta">
        <span className="skill-method">{skill.method}</span>
        <span className="skill-url" title={skill.url}>{skill.url}</span>
      </div>

      {skill.lastResponse && (
        <div className={`skill-response ${skill.lastStatus === 'error' ? 'response-error' : 'response-success'}`}>
          {skill.lastResponse.status && (
            <span className="response-status">HTTP {skill.lastResponse.status}</span>
          )}
          <pre className="response-preview">{skill.lastResponse.preview}</pre>
        </div>
      )}

      <div className="skill-card-footer">
        <span className="last-used">
          Last run: <strong>{formatTime(skill.lastRun)}</strong>
        </span>
        <div className="skill-actions">
          <button
            className="btn btn-run"
            onClick={() => onRun(skill.id)}
            disabled={isRunning}
          >
            {isRunning ? '...' : '▶ Run'}
          </button>
          <button className="btn btn-remove" onClick={() => onRemove(skill.id)} title="Remove">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
