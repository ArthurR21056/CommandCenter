require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const resolveUser = require('./middleware/resolveUser');
const usersRouter = require('./routes/users');
const skillsRouter = require('./routes/skills');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Public routes (no auth required) ─────────────────────────────────────────

app.use('/api/users', usersRouter);

// ── Authenticated routes ──────────────────────────────────────────────────────

app.use('/api/skills', resolveUser, skillsRouter);
app.use('/api/todos', resolveUser, todosRouter);

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Serve built frontend in production ────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dashboard', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Command Center server running on http://localhost:${PORT}`);
});
