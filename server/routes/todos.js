const express = require('express');
const db = require('../db/database');

const router = express.Router();

const VALID_STATUSES = ['todo', 'pending', 'done'];

const WITH_ASSIGNEE = `
  SELECT
    todos.*,
    users.name AS assignee_name
  FROM todos
  LEFT JOIN users ON todos.assignee_id = users.id
`;

function ownedTodo(todoId, userId) {
  return db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(todoId, userId);
}

/**
 * GET /api/todos
 */
router.get('/', (req, res) => {
  const todos = db
    .prepare(`${WITH_ASSIGNEE} WHERE todos.user_id = ? ORDER BY todos.created_at ASC`)
    .all(req.userId);
  res.json(todos);
});

/**
 * POST /api/todos
 * Body: { name, description?, assignee_id? }
 */
router.post('/', (req, res) => {
  const { name, description = '', assignee_id = null } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const result = db
    .prepare('INSERT INTO todos (user_id, name, description, assignee_id) VALUES (?, ?, ?, ?)')
    .run(req.userId, name, description, assignee_id);

  const todo = db
    .prepare(`${WITH_ASSIGNEE} WHERE todos.id = ?`)
    .get(result.lastInsertRowid);
  res.status(201).json(todo);
});

/**
 * PATCH /api/todos/:id
 * Body: { status?, assignee_id? }
 */
router.patch('/:id', (req, res) => {
  const { status, assignee_id } = req.body;

  const todo = ownedTodo(req.params.id, req.userId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const newStatus = status !== undefined ? status : todo.status;
  const newAssignee = assignee_id !== undefined ? assignee_id : todo.assignee_id;
  const lastUsed = status !== undefined ? new Date().toISOString().split('T')[0] : todo.last_used;

  db.prepare('UPDATE todos SET status = ?, last_used = ?, assignee_id = ? WHERE id = ?')
    .run(newStatus, lastUsed, newAssignee, todo.id);

  const updated = db.prepare(`${WITH_ASSIGNEE} WHERE todos.id = ?`).get(todo.id);
  res.json(updated);
});

/**
 * DELETE /api/todos/:id
 */
router.delete('/:id', (req, res) => {
  const todo = ownedTodo(req.params.id, req.userId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  db.prepare('DELETE FROM todos WHERE id = ?').run(todo.id);
  res.json({ ok: true });
});

/**
 * POST /api/todos/reset
 */
router.post('/reset', (req, res) => {
  db.prepare("UPDATE todos SET status = 'todo' WHERE user_id = ?").run(req.userId);
  const todos = db
    .prepare(`${WITH_ASSIGNEE} WHERE todos.user_id = ? ORDER BY todos.created_at ASC`)
    .all(req.userId);
  res.json(todos);
});

module.exports = router;
