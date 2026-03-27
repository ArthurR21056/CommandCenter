import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { useSkills } from './hooks/useSkills';
import { useTodos } from './hooks/useTodos';
import { useUsers } from './hooks/useUsers';
import SkillCard from './components/SkillCard';
import AddSkillForm from './components/AddSkillForm';
import TodoSection from './components/TodoSection';
import LoginPage from './components/LoginPage';
import './App.css';

function Dashboard() {
  const { logout } = useUser();
  const { skills, loading: skillsLoading, error: skillsError, runSkill, addSkill, removeSkill } = useSkills();
  const { todos, loading: todosLoading, error: todosError, cycleStatus, assignTodo, addTodo, removeTodo, resetAll } = useTodos();
  const { users } = useUsers();
  const [showAddSkill, setShowAddSkill] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  async function handleAddSkill(skill) {
    await addSkill(skill);
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
          <button className="btn btn-secondary" onClick={logout}>Sign out</button>
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

          {skillsError ? (
            <p className="section-error">Failed to load skills: {skillsError}</p>
          ) : skillsLoading ? (
            <p className="section-loading">Loading skills...</p>
          ) : skills.length === 0 ? (
            <p className="empty-state">No skills yet. Add one above.</p>
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
        {todosError ? (
          <p className="section-error">Failed to load todos: {todosError}</p>
        ) : (
          <TodoSection
            todos={todos}
            users={users}
            loading={todosLoading}
            onCycle={cycleStatus}
            onAssign={assignTodo}
            onAdd={addTodo}
            onRemove={removeTodo}
            onReset={resetAll}
          />
        )}

      </main>
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <UserProvider>
      <AppRouter />
    </UserProvider>
  );
}
