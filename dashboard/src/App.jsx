import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { useSkills } from './hooks/useSkills';
import { useTodos } from './hooks/useTodos';
import { useUsers } from './hooks/useUsers';
import { useWeather } from './hooks/useWeather';
import SkillCard from './components/SkillCard';
import AddSkillForm from './components/AddSkillForm';
import TodoSection from './components/TodoSection';
import LoginPage from './components/LoginPage';
import CreateUserForm from './components/CreateUserForm';
import AccountMenu from './components/AccountMenu';
import SettingsPage from './components/SettingsPage';
import './App.css';

function Dashboard() {
  const { currentUser } = useUser();
  const { skills, loading: skillsLoading, error: skillsError, runSkill, addSkill, removeSkill } = useSkills();
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const { todos, loading: todosLoading, error: todosError, cycleStatus, assignTodo, addTodo, removeTodo } = useTodos({
    assignedTo: myTasksOnly ? currentUser?.id : undefined,
  });
  const { users, refetch: refetchUsers } = useUsers();
  const { weather, city } = useWeather();
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [page, setPage] = useState('dashboard');

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
            <p className="app-date">
              {today}
              {weather && (
                <span className="app-weather">
                  {weather.temp}{weather.unit} · {weather.condition}
                  {city && ` · ${city}`}
                </span>
              )}
            </p>
          </div>
          <div className="header-actions">
            <AccountMenu
              onNavigate={setPage}
              onCreateUser={() => setShowCreateUser(true)}
            />
          </div>
        </div>
      </header>

      {showCreateUser && (
        <CreateUserForm
          onClose={() => setShowCreateUser(false)}
          onCreated={() => refetchUsers()}
        />
      )}

      {page === 'settings' ? (
        <SettingsPage onNavigate={setPage} />
      ) : (
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
              <p className="section-error">Skills are not available with this backend.</p>
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
              myTasksOnly={myTasksOnly}
              onToggleMyTasks={() => setMyTasksOnly((v) => !v)}
              onCycle={cycleStatus}
              onAssign={assignTodo}
              onAdd={addTodo}
              onRemove={removeTodo}
            />
          )}

        </main>
      )}
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
