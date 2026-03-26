const express = require('express');
const db = require('../db/database');

const router = express.Router();

const ensureStmt = db.prepare(`
  INSERT INTO users (client_key) VALUES (?)
  ON CONFLICT (client_key) DO UPDATE SET client_key = client_key
  RETURNING id, client_key, name, created_at
`);

/**
 * POST /api/users/ensure
 * Body: { clientKey: string }
 *
 * Upserts a user by client_key. Called once on app boot.
 * Returns { id, clientKey, name, isNew } so the frontend knows
 * whether to seed default data.
 */
router.post('/ensure', (req, res) => {
  const { clientKey } = req.body;

  if (!clientKey || typeof clientKey !== 'string') {
    return res.status(400).json({ error: 'clientKey is required' });
  }

  const existing = db.prepare('SELECT id, client_key, name FROM users WHERE client_key = ?').get(clientKey);

  if (existing) {
    return res.json({ id: existing.id, clientKey: existing.client_key, name: existing.name, isNew: false });
  }

  const user = ensureStmt.get(clientKey);
  return res.status(201).json({ id: user.id, clientKey: user.client_key, name: user.name, isNew: true });
});

/**
 * GET /api/users
 * Lists all users. Useful for an admin panel / user switcher later.
 */
router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, name, created_at FROM users ORDER BY created_at ASC').all();
  res.json(users);
});

module.exports = router;
