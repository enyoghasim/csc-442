# Attendance Tracking System

A university attendance tracking system with two roles — **Lecturer** and **Student**. Lecturers manage classes and sessions from a web dashboard and start sessions to generate rotating QR codes; students scan the QR on mobile to check in and view their attendance history.

Accounts are pre-seeded (no self-registration). Auth is strictly session-based — opaque session IDs stored in Redis, no JWT anywhere.

## Structure

```
apps/
  backend/      NestJS — API only, no UI
  mobile/       Expo React Native app (student-facing)
  dashboard/    Next.js + shadcn/ui (lecturer-facing web app)
packages/
  shared/       Shared TypeScript types/DTOs used across all three apps
```

See the root [AGENTS.md](./AGENTS.md) for structural conventions, and each app's own `AGENTS.md` for stack-specific conventions.

## Setup

```bash
pnpm install
docker compose up -d      # Postgres + Redis
cp .env.example .env      # fill in as needed

pnpm dev:backend           # http://localhost:3001
pnpm dev:dashboard         # http://localhost:3000
pnpm dev:mobile            # Expo dev server
```

Once Postgres is up, apply the schema and seed accounts:

```bash
pnpm --filter backend db:migrate
pnpm db:seed
```

## Seeded test accounts

`apps/backend/src/database/seed/seed.ts` seeds one lecturer and 188 students (from a class list
spreadsheet, `apps/backend/src/database/seed/data/students.json`). Every seeded account shares the
same default password:

- **Password (all accounts):** `p@ssword`
- **Lecturer login:** `lecturer@csc422.local`
- **Student login:** any regNumber from `students.json`, e.g. `2022514022`

## Monorepo tooling

pnpm workspaces + [Turborepo](https://turbo.build) for task orchestration/caching (`turbo run dev|build|lint|typecheck`). Root scripts (`dev:backend`, `dev:mobile`, `dev:dashboard`, `docker:up`, `docker:down`, `db:seed`) wrap the underlying `turbo`/`pnpm --filter` commands — see [package.json](./package.json).

## Task tracking

See [TASKS.md](./TASKS.md) for the sprint-by-sprint checklist.
