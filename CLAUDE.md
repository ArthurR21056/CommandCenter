# CommandCenter

A personal daily dashboard with executable API skills and todo tracking. Built with React (Vite) on the frontend and Express + SQLite on the backend.

## Project Structure

```
CommandCenter/
├── dashboard/        # React frontend (Vite)
└── server/           # Express backend (SQLite via better-sqlite3)
```

## Getting Started

### 1. Start the backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server runs on `http://localhost:3001`.

### 2. Start the frontend

```bash
cd dashboard
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. API calls are proxied to the backend automatically via Vite's proxy config.

---

## Architecture

### Backend (`server/`)

| File | Purpose |
|---|---|
| `index.js` | Express entry point, mounts routes |
| `db/database.js` | SQLite connection, schema creation, migrations |
| `middleware/resolveUser.js` | Reads `X-User-Id` header, attaches `req.userId` |
| `routes/users.js` | `POST /api/users/ensure` — upserts user on boot |
| `routes/skills.js` | CRUD for skills + `POST /api/skills/:id/run` proxy |
| `routes/todos.js` | CRUD for todos + reset + assignee support |

**Database schema:** `users`, `skills`, `todos`, `skill_runs`

**Auth model:** Each browser generates a `crypto.randomUUID()` client key on first load, stored in `localStorage`. This key is sent as `X-User-Id` on every request. `POST /api/users/ensure` upserts the user record. This is the groundwork for real auth — replacing the UUID with a JWT token only requires changes to `UserContext.jsx` and `resolveUser.js`.

### Frontend (`dashboard/src/`)

| Path | Purpose |
|---|---|
| `api/apiClient.js` | Fetch wrapper — prepends base URL, injects `X-User-Id` header |
| `context/UserContext.jsx` | Generates client key, calls `/users/ensure`, gates app until ready |
| `hooks/useSkills.js` | Skills state — fetches from API, manages ephemeral run state |
| `hooks/useTodos.js` | Todos state — optimistic updates for status/assignee changes |
| `hooks/useUsers.js` | Fetches all users for the assignee picker |
| `components/SkillCard.jsx` | Action card with Run button and response preview |
| `components/TodoSection.jsx` | Todo list with assignee chips and inline reassignment |
| `components/AddSkillForm.jsx` | Form for creating skills (method, url, body) |
| `components/StatusBadge.jsx` | Status pill (todo / pending / done) |

---

## Key Concepts

### Skills
Executable HTTP actions. Each skill stores a `method`, `url`, `headers`, and `body` server-side. Clicking **Run** calls `POST /api/skills/:id/run` — the **server** makes the outbound HTTP request (not the browser). This avoids CORS issues and logs every run to the `skill_runs` table.

### Todos
Daily tasks with `todo → pending → done` status cycling. Todos can be assigned to any user via the assignee chip on each item. Status and assignee updates use optimistic UI with rollback on failure.

### Multi-user
Each user is identified by a UUID stored in their browser's `localStorage`. The `resolveUser` middleware enforces this on all `/api/skills` and `/api/todos` routes. Adding real authentication (OAuth, JWT) only requires updating `UserContext.jsx` and `resolveUser.js` — no route or component changes needed.

---

## API Reference

### Users
| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/users/ensure` | `{ clientKey }` | Upsert user, returns `{ id, isNew }` |
| GET | `/api/users` | — | List all users |

### Skills *(requires `X-User-Id` header)*
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/skills` | — | List skills for current user |
| POST | `/api/skills` | `{ name, description, method, url, headers?, body? }` | Create skill |
| DELETE | `/api/skills/:id` | — | Delete skill |
| POST | `/api/skills/:id/run` | — | Execute skill (proxied server-side) |
| GET | `/api/skills/:id/runs` | — | Run history (last 20) |

### Todos *(requires `X-User-Id` header)*
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/todos` | — | List todos with assignee info |
| POST | `/api/todos` | `{ name, description?, assignee_id? }` | Create todo |
| PATCH | `/api/todos/:id` | `{ status?, assignee_id? }` | Update status or assignee |
| DELETE | `/api/todos/:id` | — | Delete todo |
| POST | `/api/todos/reset` | — | Reset all todos to `todo` status |

---

## GitHub Pages (static preview)

The frontend can be deployed statically to GitHub Pages (skills won't be runnable without the backend, but the UI is browsable):

```bash
cd dashboard
npm run deploy
```

Live at: `https://arthurr21056.github.io/CommandCenter/`

---

## Environment Variables

### Server (`server/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the Express server listens on |
| `DB_PATH` | `./commandcenter.db` | Path to the SQLite database file |

### Frontend (`dashboard/.env.local`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | API base URL (change for production deployments) |

---

## Development Notes

- The SQLite DB is created automatically on first server start — no setup step needed.
- Schema migrations run on startup in `db/database.js` using `ALTER TABLE IF NOT EXISTS` checks.
- The `skill_runs` table provides a full audit log of every skill execution.
- Vite proxies `/api/*` to `localhost:3001` in dev, so no CORS config is needed locally.
