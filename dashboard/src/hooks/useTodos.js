import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

const STATUS_CYCLE = ['pending', 'in_progress', 'done'];

export function useTodos() {
  const { isAuthenticated } = useUser();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/tasks');
      setTodos(data.tasks ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchTodos();
  }, [isAuthenticated, fetchTodos]);

  async function cycleStatus(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(todo.status) + 1) % STATUS_CYCLE.length];

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
    try {
      const updated = await api.patch(`/tasks/${id}`, { status: next });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
      throw err;
    }
  }

  async function assignTodo(id, assigned_to) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, assigned_to } : t)));
    try {
      const updated = await api.patch(`/tasks/${id}`, { assigned_to });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
    }
  }

  async function addTodo(task) {
    const created = await api.post('/tasks', task);
    setTodos((prev) => [...prev, created]);
  }

  async function removeTodo(id) {
    await api.delete(`/tasks/${id}`);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return { todos, loading, error, cycleStatus, assignTodo, addTodo, removeTodo };
}
