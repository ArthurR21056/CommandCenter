import { useState } from 'react';
import { useSkills } from './hooks/useSkills';
import { useTodos } from './hooks/useTodos';
import SkillCard from './components/SkillCard';
import AddSkillForm from './components/AddSkillForm';
import TodoSection from './components/TodoSection';
import './App.css';

export default function App() {
  const { skills, runSkill, addSkill, removeSkill } = useSkills();
  const { todos, cycleStatus, addTodo, removeTodo, resetAll } = useTodos();
  const [showAddSkill, setShowAddSkill] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  function handleAddSkill(skill) {
    addSkill(skill);
    setShowAddSkill(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1 className="app-title">Command Center</h1>
            <p className="app-date">{today}</p>
          </div>
        </div>
      </header>

      <main className="app-main">

        {/* ── Skills ── */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Skills</h2>
              <p className="section-sub">Executable API actions</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddSkill((v) => !v)}>
              {showAddSkill ? 'Cancel' : '+ Add Skill'}
            </button>
          </div>

          {showAddSkill && (
            <AddSkillForm onAdd={handleAddSkill} onCancel={() => setShowAddSkill(false)} />
          )}

          {skills.length === 0 ? (
            <p className="empty-state">No skills yet.</p>
          ) : (
            <div className="skill-grid">
              {skills.map((s) => (
                <SkillCard key={s.id} skill={s} onRun={runSkill} onRemove={removeSkill} />
              ))}
            </div>
          )}
        </section>

        <div className="section-divider" />

        {/* ── Todos ── */}
        <TodoSection
          todos={todos}
          onCycle={cycleStatus}
          onAdd={addTodo}
          onRemove={removeTodo}
          onReset={resetAll}
        />

      </main>
    </div>
  );
}
