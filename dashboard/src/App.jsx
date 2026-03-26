import { useState } from 'react';
import { useSkills } from './hooks/useSkills';
import SkillCard from './components/SkillCard';
import AddSkillForm from './components/AddSkillForm';
import FilterBar from './components/FilterBar';
import './App.css';

export default function App() {
  const { skills, updateStatus, addSkill, removeSkill, resetAllForToday } = useSkills();
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const counts = {
    all: skills.length,
    todo: skills.filter((s) => s.status === 'todo').length,
    pending: skills.filter((s) => s.status === 'pending').length,
    done: skills.filter((s) => s.status === 'done').length,
  };

  const filtered = filter === 'all' ? skills : skills.filter((s) => s.status === filter);
  const donePercent = skills.length ? Math.round((counts.done / skills.length) * 100) : 0;

  function handleAdd(skill) {
    addSkill(skill);
    setShowAddForm(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1 className="app-title">Command Center</h1>
            <p className="app-date">{today}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={resetAllForToday}>
              Reset Day
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? 'Cancel' : '+ Add Skill'}
            </button>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <span>Daily Progress</span>
            <span>
              {counts.done} / {skills.length} done ({donePercent}%)
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${donePercent}%` }} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {showAddForm && (
          <AddSkillForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
        )}

        <FilterBar active={filter} onChange={setFilter} counts={counts} />

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No skills found{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
          </div>
        ) : (
          <div className="skill-grid">
            {filtered.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onStatusChange={updateStatus}
                onRemove={removeSkill}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
