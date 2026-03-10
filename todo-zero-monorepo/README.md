# Todo Zero Monorepo

A real-time synced todo app built with **Zero** (Rocicorp), **React**, **Electron**, and **Flow CSS** — structured as a pnpm + Turbo monorepo.

## Architecture

```
todo-zero-monorepo/
├── apps/
│   ├── web/        → React + Vite web app with Flow CSS
│   ├── desktop/    → Electron desktop app (loads web UI)
│   └── server/     → Hono API server (auth, seed data)
├── packages/
│   └── shared/     → Zero schema, TypeScript types
├── docker/         → Local dev Docker Compose (Postgres)
└── .dokploy/       → Production Docker Compose + Dockerfiles
```

## Stack

| Layer | Technology |
|-------|-----------|
| Sync | [Zero](https://zero.rocicorp.dev) (Rocicorp) — real-time client-side sync |
| Frontend | React 19, Vite |
| Desktop | Electron |
| Styling | Flow CSS (custom, flow-based CSS system) |
| API | Hono, JWT auth |
| Database | PostgreSQL 16 (with logical WAL) |
| Monorepo | pnpm workspaces + Turborepo |
| Deploy | Docker Compose on Dokploy |

## Quick Start (Local Dev)

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 10
- Docker (for Postgres)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start Postgres

```bash
pnpm dev:db
```

### 3. Seed the database

```bash
cp .env.example .env
pnpm --filter @todo/server db:seed
```

### 4. Start Zero cache server

```bash
# In a separate terminal
export ZERO_UPSTREAM_DB="postgresql://postgres:password@localhost:5432/todo_zero"
export ZERO_REPLICA_FILE="/tmp/todo_zero_replica.db"
pnpm dev:zero-cache
```

### 5. Start the web app

```bash
# In another terminal
pnpm dev:web
```

Open http://localhost:5173 — you should see the Todo app syncing via Zero.

### 6. (Optional) Start the desktop app

```bash
# Requires the web dev server running first
pnpm dev:desktop
```

### All-in-one (if you have concurrently)

```bash
pnpm dev:all
```

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev:db` | Start Postgres via Docker |
| `pnpm dev:zero-cache` | Start Zero cache server |
| `pnpm dev:web` | Start web dev server (Vite) |
| `pnpm dev:desktop` | Start Electron desktop app |
| `pnpm dev:server` | Start API server |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm dev:db:down` | Stop Postgres |

## How Zero Sync Works

1. **Postgres** stores the canonical todo data
2. **Zero-cache** replicates Postgres → SQLite replica via logical WAL
3. **React client** uses `@rocicorp/zero` to query the replica and mutate data
4. Changes flow: Client → Zero-cache → Postgres → Zero-cache → All clients

Open the app in two browser tabs — changes sync instantly.

## Flow CSS

The styling uses a custom "Flow CSS" system (`apps/web/src/flow.css`) built on:

- **CSS custom properties** for consistent design tokens (spacing, colors, typography)
- **Flow layout primitives**: `.flow-stack` (vertical), `.flow-row` (horizontal), `.flow-center`
- **Data-attribute variants**: `data-variant="primary"`, `data-space="lg"`, etc.
- **Natural document flow**: minimal position hacks, content flows naturally

This keeps styling composable and framework-agnostic — works in both web and desktop.

## Deploy to Dokploy

### 1. Push to Git

Dokploy can deploy from a Git repo. Push this monorepo to GitHub/GitLab.

### 2. Configure in Dokploy

1. Create a new **Compose** project in Dokploy
2. Point it at `.dokploy/docker-compose.yml`
3. Set environment variables (see `.dokploy/.env.example`):
   - `POSTGRES_PASSWORD` — secure database password
   - `ZERO_AUTH_SECRET` — JWT signing secret
   - `VITE_PUBLIC_SERVER` — public URL of zero-cache (e.g., `https://yourdomain.com:4848`)

### 3. Deploy

Dokploy builds and runs:
- **postgres** — database with WAL enabled
- **zero-cache** — Zero replication server
- **server** — API/auth server
- **web** — Nginx serving the built React app

### 4. Seed production database

```bash
# SSH into the server or exec into the container
docker exec -it <server-container> node -e "
  const pg = require('pg');
  // ... run seed script
"
```

Or run the seed script before first deploy.

## Development Notes

- **Zero requires `strictNullChecks: true`** in tsconfig — already configured.
- **Postgres must use `wal_level=logical`** — configured in Docker Compose.
- **Desktop app in dev mode** loads the Vite dev server URL (`http://localhost:5173`). For production builds, you'd run `pnpm --filter @todo/web build` first, then copy `apps/web/dist` into the Electron bundle.
- **`@rocicorp/zero` postinstall** needs to run (installs native SQLite bindings). If using pnpm, ensure `node-linker=hoisted` or allow postinstall scripts.

## License

MIT
