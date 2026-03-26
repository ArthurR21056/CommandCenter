const express = require('express');
const db = require('../db/database');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function ownedSkill(skillId, userId) {
  return db.prepare('SELECT * FROM skills WHERE id = ? AND user_id = ?').get(skillId, userId);
}

function formatSkill(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    method: row.method,
    url: row.url,
    createdAt: row.created_at,
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/skills
 * Returns all skills for the current user.
 * url/headers/body are intentionally omitted — the server owns those.
 */
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY created_at ASC')
    .all(req.userId);
  res.json(rows.map(formatSkill));
});

/**
 * POST /api/skills
 * Body: { name, description, method, url, headers?, body? }
 */
router.post('/', (req, res) => {
  const { name, description = '', method = 'GET', url, headers = {}, body = '' } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'name and url are required' });
  }

  const result = db
    .prepare(
      'INSERT INTO skills (user_id, name, description, method, url, headers, body) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(req.userId, name, description, method, url, JSON.stringify(headers), body);

  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(formatSkill(skill));
});

/**
 * DELETE /api/skills/:id
 */
router.delete('/:id', (req, res) => {
  const skill = ownedSkill(req.params.id, req.userId);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  db.prepare('DELETE FROM skill_runs WHERE skill_id = ?').run(skill.id);
  db.prepare('DELETE FROM skills WHERE id = ?').run(skill.id);
  res.json({ ok: true });
});

/**
 * POST /api/skills/:id/run
 * The server makes the outbound HTTP call and logs the result.
 * Returns { httpStatus, preview }.
 */
router.post('/:id/run', async (req, res) => {
  const skill = ownedSkill(req.params.id, req.userId);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  let headers = {};
  try { headers = JSON.parse(skill.headers); } catch {}

  let httpStatus = null;
  let preview = null;
  let errorMessage = null;

  try {
    const options = { method: skill.method, headers };
    if (skill.body && skill.method !== 'GET') {
      options.body = skill.body;
    }

    const response = await fetch(skill.url, options);
    httpStatus = response.status;

    const text = await response.text();
    try {
      preview = JSON.stringify(JSON.parse(text), null, 2).slice(0, 500);
    } catch {
      preview = text.slice(0, 500);
    }

    db.prepare(
      'INSERT INTO skill_runs (skill_id, user_id, http_status, response_preview) VALUES (?, ?, ?, ?)'
    ).run(skill.id, req.userId, httpStatus, preview);

    res.json({ httpStatus, preview, ok: response.ok });
  } catch (err) {
    errorMessage = err.message;

    db.prepare(
      'INSERT INTO skill_runs (skill_id, user_id, error_message) VALUES (?, ?, ?)'
    ).run(skill.id, req.userId, errorMessage);

    res.status(502).json({ httpStatus: null, preview: errorMessage, ok: false });
  }
});

/**
 * GET /api/skills/:id/runs
 * Returns run history for a skill.
 */
router.get('/:id/runs', (req, res) => {
  const skill = ownedSkill(req.params.id, req.userId);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  const runs = db
    .prepare('SELECT * FROM skill_runs WHERE skill_id = ? ORDER BY ran_at DESC LIMIT 20')
    .all(skill.id);
  res.json(runs);
});

module.exports = router;
