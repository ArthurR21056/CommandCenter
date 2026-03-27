# CommandCenter

A personal daily dashboard with executable API skills and todo tracking. Built with React (Vite) on the frontend and Express + SQLite on the backend.

## Project Structure

```
CommandCenter/
├── dashboard/          # React frontend (Vite + nginx)
├── server/             # Express backend (SQLite via better-sqlite3)
├── scripts/
│   └── run.sh          # Convenience wrapper for Docker operations
└── docker-compose.yml  # Orchestrates frontend + backend
```

---

## Running with Docker (recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) v2+ (`docker compose`)

### Quick start

```bash
# Clone the repo
git clone https://github.com/ArthurR21056/CommandCenter.git
cd CommandCenter

# Start everything
./scripts/run.sh
```

The dashboard will be available at **http://localhost:8080**.

### Using the run script

```bash
./scripts/run.sh                          # Build and start all services
./scripts/run.sh down                     # Stop all services
./scripts/run.sh restart                  # Rebuild and restart
./scripts/run.sh logs                     # Tail all logs
./scripts/run.sh logs frontend            # Tail a specific service
./scripts/run.sh build                    # Rebuild images only
./scripts/run.sh clean                    # Remove containers, volumes, and images
```

### Pointing to an external API (port 3000)

If you have the new API backend running on port 3000, override the API host:

```bash
./scripts/run.sh --api-host http://localhost:3000
```

Or on Linux/WSL where `host.docker.internal` is not automatically available:

```bash
./scripts/run.sh --api-host http://host.docker.internal:3000
```

You can also edit `docker-compose.yml` directly and change the `API_HOST` value under the `frontend` service.

### Services

| Service    | Container port | Host port | Description                     |
|------------|---------------|-----------|----------------------------------|
| `frontend` | 80            | 8080      | nginx serving the React dashboard |
| `server`   | 3001          | 3001      | Express + SQLite legacy backend   |

SQLite data is persisted in a Docker volume (`sqlite-data`) so your todos and skills survive restarts.

---

## Running locally (without Docker)

### 1. Start the backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server runs on **http://localhost:3001**.

### 2. Start the frontend

```bash
cd dashboard
npm install
npm run dev
```

Dashboard runs on **http://localhost:5173**. API calls proxy to `localhost:3000` automatically via Vite.

> **Note:** The Vite dev proxy is configured to forward `/api/*` to `localhost:3000` (the new external API). To use the legacy backend instead, update the `proxy.target` in `dashboard/vite.config.js` to `http://localhost:3001` and remove the `rewrite` option.

---

## Architecture

See [CLAUDE.md](./CLAUDE.md) for a full breakdown of the codebase, API reference, and development notes.

---

## Environment Variables

### Server (`server/.env`)

| Variable   | Default                  | Description                      |
|------------|--------------------------|----------------------------------|
| `PORT`     | `3001`                   | Port the Express server listens on |
| `DB_PATH`  | `./commandcenter.db`     | Path to the SQLite database file  |

### Frontend (`dashboard/.env.local`)

| Variable            | Default | Description                                      |
|---------------------|---------|--------------------------------------------------|
| `VITE_API_BASE_URL` | `/api`  | API base URL (change for production deployments) |

---

## Deploying to GitHub Pages (static preview)

The frontend can be deployed to GitHub Pages. Skills won't execute without a backend, but the UI is browsable.

```bash
cd dashboard
npm run deploy
```

Live at: **https://arthurr21056.github.io/CommandCenter/**
