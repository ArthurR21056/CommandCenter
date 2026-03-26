import StatusBadge from './StatusBadge';

const STATUS_CYCLE = ['todo', 'pending', 'done'];

function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SkillCard({ skill, onStatusChange, onRemove }) {
  const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(skill.status) + 1) % STATUS_CYCLE.length];

  return (
    <div className={`skill-card status-${skill.status}`}>
      <div className="skill-card-header">
        <div className="skill-info">
          <h3 className="skill-name">{skill.name}</h3>
          <p className="skill-description">{skill.description}</p>
        </div>
        <StatusBadge status={skill.status} />
      </div>

      <div className="skill-card-footer">
        <span className="last-used">
          Last used: <strong>{formatDate(skill.lastUsed)}</strong>
        </span>
        <div className="skill-actions">
          <button
            className="btn btn-cycle"
            onClick={() => onStatusChange(skill.id, nextStatus)}
            title={`Mark as ${nextStatus}`}
          >
            → {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
          </button>
          <button
            className="btn btn-remove"
            onClick={() => onRemove(skill.id)}
            title="Remove skill"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
