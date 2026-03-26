const express = require('express');
const db = require('../db/database');

const router = express.Router();

const VALID_STATUSES = ['todo', 'pending', 'done'];

function ownedTodo(todoId, userId) {
  return db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(todoId, userId);
}

/**
 * GET /api/todos
 */
router.get('/', (req, res) => {
  const todos = db
    .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at ASC')
    .all(req.userId);
  res.json(todos);
});

/**
 * POST /api/todos
 * Body: { name, description? }
 */
router.post('/', (req, res) => {
  const { name, description = '' } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const result = db
    .prepare('INSERT INTO todos (user_id, name, description) VALUES (?, ?, ?)')
    .run(req.userId, name, description);

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(todo);
});

/**
 * PATCH /api/todos/:id
 * Body: { status }
 */
router.patch('/:id', (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const todo = ownedTodo(req.params.id, req.userId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  const lastUsed = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE todos SET status = ?, last_used = ? WHERE id = ?').run(status, lastUsed, todo.id);

  res.json({ ...todo, status, last_used: lastUsed });
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
 * Resets all todos for the user back to 'todo' status.
 */
router.post('/reset', (req, res) => {
  db.prepare("UPDATE todos SET status = 'todo' WHERE user_id = ?").run(req.userId);
  const todos = db.prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at ASC').all(req.userId);
  res.json(todos);
});

module.exports = router;
