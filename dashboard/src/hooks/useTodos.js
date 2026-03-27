import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

export function useTodos() {
  const { isReady } = useUser();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/todos');
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) fetchTodos();
  }, [isReady, fetchTodos]);

  async function cycleStatus(id) {
    const STATUS_CYCLE = ['todo', 'pending', 'done'];
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(todo.status) + 1) % STATUS_CYCLE.length];

    // Optimistic update
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));

    try {
      const updated = await api.patch(`/todos/${id}`, { status: next });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      // Roll back on failure
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
      throw err;
    }
  }

  async function assignTodo(id, assignee_id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, assignee_id } : t)));
    try {
      const updated = await api.patch(`/todos/${id}`, { assignee_id });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
    }
  }

  async function addTodo(todo) {
    const created = await api.post('/todos', todo);
    setTodos((prev) => [...prev, created]);
  }

  async function removeTodo(id) {
    await api.delete(`/todos/${id}`);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function resetAll() {
    const updated = await api.post('/todos/reset', {});
    setTodos(updated);
  }

  return { todos, loading, error, cycleStatus, assignTodo, addTodo, removeTodo, resetAll };
}
