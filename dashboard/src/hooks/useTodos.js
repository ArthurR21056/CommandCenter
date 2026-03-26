import { useState, useEffect } from 'react';
import { defaultTodos } from '../data/todos';

const STORAGE_KEY = 'commandcenter_todos_v2';
const STATUS_CYCLE = ['todo', 'pending', 'done'];

export function useTodos() {
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultTodos;
    } catch {
      return defaultTodos;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  function cycleStatus(id) {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length];
        return { ...t, status: next, lastUsed: new Date().toISOString().split('T')[0] };
      })
    );
  }

  function addTodo(todo) {
    setTodos((prev) => [...prev, { ...todo, id: Date.now(), status: 'todo', lastUsed: null }]);
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function resetAll() {
    setTodos((prev) => prev.map((t) => ({ ...t, status: 'todo' })));
  }

  return { todos, cycleStatus, addTodo, removeTodo, resetAll };
}
