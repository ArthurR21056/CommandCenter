import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { useTodos } from './hooks/useTodos';
import { useUsers } from './hooks/useUsers';
import { useWeather } from './hooks/useWeather';
import BottomNav from './components/BottomNav';
import HomePage from './components/HomePage';
import TasksPage from './components/TasksPage';
import AutomationPage from './components/AutomationPage';
import ProfilePage from './components/ProfilePage';
import AccountMenu from './components/AccountMenu';
import LoginPage from './components/LoginPage';
import './App.css';

function Dashboard() {
  const { currentUser } = useUser();
  const [page, setPage] = useState('home');

  // My tasks (home page — filtered to current user)
  const { todos: myTodos, loading: myLoading, cycleStatus: myCycle } = useTodos({
    assignedTo: currentUser?.id,
  });

  // All tasks (tasks page)
  const { todos, loading, error, cycleStatus, assignTodo, addTodo, removeTodo } = useTodos();

  const { users, refetch: refetchUsers } = useUsers();
  const { weather, city } = useWeather();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">Command Center</h1>

          {/* Desktop nav links */}
          <nav className="nav-top-links">
            {['home', 'tasks', 'automation', 'profile'].map((p) => (
              <button
                key={p}
                className={`nav-top-link${page === p ? ' active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <AccountMenu onNavigate={setPage} onCreateUser={() => setPage('profile')} />
          </div>
        </div>
      </header>

      {page === 'home' && (
        <HomePage
          todos={myTodos}
          loading={myLoading}
          weather={weather}
          city={city}
          onCycle={myCycle}
        />
      )}
      {page === 'tasks' && (
        <TasksPage
          todos={todos}
          users={users}
          loading={loading}
          error={error}
          onCycle={cycleStatus}
          onAssign={assignTodo}
          onAdd={addTodo}
          onRemove={removeTodo}
        />
      )}
      {page === 'automation' && <AutomationPage />}
      {page === 'profile' && (
        <ProfilePage onRefetchUsers={refetchUsers} />
      )}

      <BottomNav page={page} onNavigate={setPage} />
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
