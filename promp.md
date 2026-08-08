# Prompt for Claude Code

Paste everything below into Claude Code.

---

I'm bootstrapping a monorepo for a university software engineering project called **Attendance Tracking System**. I need you to scaffold the initial workspace structure only — no feature implementation yet, just a clean, working foundation all apps can build on top of.

## Project Overview

An attendance tracking system with two roles: **Lecturer** and **Student**. There is **no self-registration** — all accounts are pre-seeded (imported from a class list) with default passwords, since this uses school credentials. There is only a login flow, never a register flow, anywhere in the system.

**Auth is strictly session-based — no JWT anywhere.** Session is handled with express-session or sum similar and since they are sent with requests automatically we are good to go

- Lecturers (on the web dashboard) create classes, schedule sessions, and start a session to generate a rotating QR code (short TTL, stored in Redis) that students scan to check in.
- Students (on the mobile app) scan the QR code to mark themselves present for a session, and can view their own attendance history.

### Feature list (for context only — do not implement yet, just note in the tasks file)

1. Auth — login only (email/matric-no + password), **session-based** (Redis-backed opaque session ID, no JWT), role-based (student/lecturer). Accounts are seeded via a script, not self-registered.
2. Class management — lecturer creates/edits classes (dashboard)
3. Enrollment — students enrolled into classes (lecturer-managed, dashboard)
4. Session management — lecturer schedules a class session (date, start time, end time) (dashboard) — note: "session" here means a class meeting, distinct from the auth "session" concept; keep naming clear in code (e.g. `classSessions` table vs auth `sessions` in Redis)
5. QR check-in — lecturer starts a class session on the dashboard, backend generates a rotating QR token stored in Redis with TTL (~60–90s), dashboard displays the QR and auto-refreshes it
6. Attendance marking — student scans QR on mobile, backend validates token + enrollment + class session window, writes attendance record
7. Attendance history — student view of their own attendance, calendar-based, on mobile
8. Lecturer dashboard reports — attendance % per student per class, exportable report (CSV, later)
9. Rate limiting / anti-abuse on the check-in endpoint

## Monorepo Structure

Use a **pnpm workspace** with this layout:

```
attendance-tracker/
├── apps/
│   ├── backend/         # Next.js — API routes only, no UI
│   ├── mobile/          # Expo React Native app (student-facing)
│   └── dashboard/       # Next.js + shadcn/ui (lecturer-facing web app)
├── packages/
│   └── shared/          # Shared TypeScript types/DTOs used across all three apps
├── pnpm-workspace.yaml
├── package.json          # root — workspace scripts only, no dependencies
├── .gitignore
├── .env.example
├── docker-compose.yml     # Postgres + Redis for local dev
├── TASKS.md               # task tracking file, see below
└── README.md
```

## Backend (`apps/backend`) — Next.js (API routes only)

- Initialize as a Next.js app using the App Router, but structured as an **API-only** service — routes live under `app/api/**/route.ts`. No pages/UI needed; a placeholder root page is fine (e.g. "Attendance Tracker API").
- Install and configure:
  - **Drizzle ORM** with the `postgres` driver (`drizzle-orm` + `postgres` npm package), plus `drizzle-kit` for migrations
  - `ioredis` for Redis client — this is the session store, **no JWT library needed**
  - `bcrypt` (or `argon2`) for password hashing — used only by the seed script and login route, since there's no register flow
  - `zod` for request validation
- Create a `drizzle/` folder inside `apps/backend` with a `schema.ts` stub containing empty `pgTable` scaffolds (with `// TODO` comments) for: `users`, `classes`, `enrollments`, `classSessions`, `attendance_records`. (Note: named `classSessions` in Postgres to avoid confusion with auth sessions, which live only in Redis.)
- Create a `lib/session.ts` stub with placeholder function signatures only (no logic yet): `createSession(userId, role)`, `getSession(sessionId)`, `destroySession(sessionId)` — these will wrap Redis get/set/del calls with a TTL, generating opaque session IDs (e.g. via `crypto.randomUUID()`).
- Create placeholder route handlers (each returning a stub JSON response) for:
  - `app/api/auth/login/route.ts` (POST) — will call `createSession` and set the cookie/return the session ID
  - `app/api/auth/logout/route.ts` (POST) — will call `destroySession`
  - `app/api/classes/route.ts`
  - `app/api/sessions/route.ts` (class sessions, not auth sessions)
  - `app/api/attendance/route.ts`
  - `app/api/health/route.ts` → returns `{ status: 'ok' }`, this is our smoke test
- Create a `scripts/seed.ts` stub — will later read a class list (CSV/JSON) and insert lecturer/student users with hashed default passwords. For now just scaffold the file with a `// TODO: implement seeding` and wire an npm script to run it (e.g. via `tsx`).
- Add `drizzle.config.ts` at the backend root pointing to the schema file and reading `DATABASE_URL` from env.
- Add npm scripts: `dev`, `build`, `start`, `db:generate`, `db:migrate`, `db:studio`, `db:seed`.

## Mobile (`apps/mobile`) — Expo + NativeWind

- Initialize with `create-expo-app` using the TypeScript template.
- Install and configure:
  - `expo-router` for navigation (file-based), using a **tab layout** as the main navigation
  - `nativewind` + `tailwindcss` — set up `tailwind.config.js`, `babel.config.js`, and a `global.css` (or nativewind's required setup) so Tailwind classes work on RN components
  - `expo-camera` for QR scanning (just install, don't implement scanning logic yet)
  - `expo-secure-store` for storing the session ID (install only, no logic yet — this replaces any token storage)
  - A basic API client stub (`src/api/client.ts`) reading the backend base URL from env via `expo-constants`, with a placeholder that shows how the session ID will be attached as a custom header on future requests (`Authorization: Session <id>`) — just a placeholder `GET /health` call for now, no session logic wired yet
- **Tab structure** (3 tabs, using `expo-router`'s `(tabs)` group):
  1. **Home** — placeholder screen with a basic info card (e.g. student name, today's classes — static placeholder data for now) and a prominent "Scan QR" button (button only, no camera logic wired yet — just navigates to a placeholder scanner screen/modal)
  2. **My Attendance** — placeholder screen with a calendar view (install `react-native-calendars` for this) showing marked dates (static placeholder data), where tapping a day is stubbed to open a placeholder detail view/modal for that day's attendance record
  3. **Settings** — placeholder screen with a basic list (profile info placeholder, logout button stub, no logic yet)
- A separate (non-tab) route for the QR scanner screen, reachable from the Home "Scan QR" button — placeholder only, no `expo-camera` logic wired yet.
- Make sure `pnpm --filter mobile start` boots the Expo dev server without errors, tabs render, and Tailwind classes actually apply (e.g. style one placeholder element with `className` to confirm NativeWind is working).

## Dashboard (`apps/dashboard`) — Next.js + shadcn/ui

- Initialize as a Next.js app (App Router), TypeScript, Tailwind CSS.
- Set up **shadcn/ui** (`npx shadcn init` equivalent) with a basic theme, and install a few starter components (`button`, `card`, `table`, `input`) so the setup is verified working.
- Create placeholder pages/routes for: `/login`, `/classes`, `/sessions`, `/sessions/[id]` (live QR display placeholder), `/reports` — each a simple page using shadcn `Card`/placeholder content, no real logic or data fetching yet.
- Add a minimal shared layout (sidebar or top nav) linking the above pages, using shadcn components, so it's visually navigable even with placeholder content.
- Note for later: the dashboard will rely on the httpOnly session cookie set by the backend's login route (cross-origin, so backend CORS + cookie config will need `credentials: 'include'` on fetches and proper `SameSite`/`secure` cookie settings) — no logic needed yet, just keep this in mind for the placeholder login page's future fetch call.
- Make sure `pnpm --filter dashboard dev` boots without errors and shadcn components render styled correctly.

## Shared package (`packages/shared`)

- A minimal TypeScript package (`tsconfig.json`, `package.json`, `src/index.ts`) exporting:
  - `UserRole` enum (`student`, `lecturer`)
  - `AttendanceStatus` enum (`present`, `absent`, `late`)
  - Placeholder empty interfaces: `AuthResponse` (will include the session id for mobile), `SessionDTO` (class session, not auth), `AttendanceRecordDTO`, `ClassDTO` (each with a `// TODO: define fields` comment)
- All three apps (`backend`, `mobile`, `dashboard`) should be able to import from `@attendance/shared` — set up the workspace package name and dependency/path resolution correctly so imports resolve in all three.

## Docker Compose

`docker-compose.yml` at root with two services:

- `postgres` (postgres:16, exposed on 5432, named volume, default db/user/pass matching `.env.example`)
- `redis` (redis:7, exposed on 6379) — used for both auth sessions and QR check-in tokens

## Environment

`.env.example` at root listing all vars needed across apps:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/attendance_tracker
REDIS_URL=redis://localhost:6379
SESSION_TTL_SECONDS=604800
BACKEND_PORT=3001
DASHBOARD_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

(No JWT secrets — session IDs are opaque and validated by Redis lookup only.)

## Root package.json scripts

Add convenience scripts at the root using `pnpm --filter`:

- `dev:backend` → `pnpm --filter backend dev`
- `dev:mobile` → `pnpm --filter mobile start`
- `dev:dashboard` → `pnpm --filter dashboard dev`
- `docker:up` → `docker compose up -d`
- `docker:down` → `docker compose down`
- `db:seed` → `pnpm --filter backend db:seed`

## TASKS.md

Create a `TASKS.md` file at the root to track project work as a checklist grouped by sprint:

```markdown
# Attendance Tracking System — Task Board

## Sprint 0 — Bootstrap

- [x] pnpm workspace structure (backend, mobile, dashboard, shared)
- [x] Docker Compose (Postgres + Redis)
- [x] Backend health check route
- [x] Mobile: Expo app boots with 3-tab layout (Home, My Attendance, Settings) + NativeWind working
- [x] Dashboard: Next.js + shadcn boots with placeholder pages
- [x] Shared package wired into all three apps

## Sprint 1 — Auth + Schema (session-based, seeded accounts, no JWT)

- [ ] Define full Drizzle schema (users, classes, enrollments, classSessions, attendance_records)
- [ ] Run first migration
- [ ] Seed script: import class list (CSV/JSON) → insert lecturer/student users with hashed default passwords
- [ ] Implement `lib/session.ts` (Redis-backed createSession/getSession/destroySession, opaque IDs, TTL)
- [ ] Login endpoint — verify credentials, create Redis session, set httpOnly cookie (dashboard) + return session id (mobile)
- [ ] Logout endpoint — destroy Redis session
- [ ] Auth middleware for API routes — reads cookie (dashboard) or `Authorization: Session <id>` header (mobile), looks up Redis, attaches user/role to request
- [ ] Role guard (student/lecturer) for protected routes
- [ ] Dashboard: login page wired to API (credentialed fetch)
- [ ] Mobile: login screen wired to API, session id stored via expo-secure-store, attached to future requests

## Sprint 2 — Classes & Sessions

- [ ] Dashboard: create/edit/list classes
- [ ] Dashboard: enroll students into a class
- [ ] Dashboard: schedule a class session (date/start/end)
- [ ] Mobile Home tab: show today's real class/session info

## Sprint 3 — QR Check-in

- [ ] Backend: generate rotating QR token per active class session, store in Redis with TTL
- [ ] Backend: endpoint to fetch current QR token for a class session
- [ ] Backend: check-in endpoint — validate token, session window, enrollment; write attendance record
- [ ] Rate limiting on check-in endpoint
- [ ] Dashboard: live QR display on session page, auto-refreshing
- [ ] Mobile: wire expo-camera QR scanner to check-in endpoint

## Sprint 4 — History & Reports

- [ ] Mobile My Attendance tab: wire calendar to real attendance data, tap-day detail view
- [ ] Dashboard: attendance report per class session/class (%, present/absent list)
- [ ] CSV export endpoint + dashboard export button

## Sprint 5 — Testing & Report

- [ ] Unit tests: backend route handlers/services (Jest or Vitest)
- [ ] Integration tests: login, session, attendance endpoints
- [ ] Manual QA pass: expired session, expired QR token, duplicate scan, wrong class edge cases
- [ ] Technical report draft
- [ ] Final polish + demo prep
```

## Constraints

- Use **pnpm** exclusively (no npm/yarn lockfiles).
- No register flow anywhere — login only, accounts are seeded.
- **No JWT.** Auth is strictly session-based: opaque session IDs stored in Redis, validated by lookup on every request. Do not install or reference any JWT library.
- Everything must actually run: after scaffolding, verify `pnpm install` succeeds at the root, `docker compose up -d` brings up Postgres + Redis cleanly, `pnpm dev:backend` serves `/api/health`, `pnpm dev:dashboard` boots and renders styled shadcn components, and `pnpm dev:mobile` boots the Expo dev server with the 3 tabs visible and NativeWind styling confirmed working.
- Keep this step to structure and boilerplate only — no business logic, no real schema columns, no session logic implemented yet (stub functions/signatures only). That comes next.
- Use TypeScript strict mode in all three apps.
- Add a root `README.md` with setup instructions (clone → `pnpm install` → `docker compose up -d` → `pnpm dev:backend` / `pnpm dev:dashboard` / `pnpm dev:mobile`).

Confirm each step works before moving to the next, and give me a final summary of what was created and how to run each app.
