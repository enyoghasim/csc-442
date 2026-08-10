# Attendance Tracking System — Task Board

## Sprint 0 — Bootstrap

- [x] pnpm workspace structure (backend, mobile, dashboard, shared)
- [x] Docker Compose (Postgres + Redis)
- [x] Backend health check route
- [x] Mobile: Expo app boots with 3-tab layout (Home, My Attendance, Settings) + NativeWind working
- [x] Dashboard: Next.js + shadcn boots with placeholder pages
- [x] Shared package wired into all three apps

## Sprint 1 — Auth + Schema (session-based, seeded accounts, no JWT)

- [ ] Define full Drizzle schema (`users` has real columns now — role, name, email, regNumber,
      passwordHash; `classes`/`enrollments`/`classSessions`/`attendance_records` still stubs)
- [x] Run first migration
- [x] Seed script: `apps/backend/src/database/seed/seed.ts` — reads `data/students.json`
      (name+regNumber, extracted from the CSC 422 class list), inserts one lecturer + 188
      students, bcrypt-hashed default password `p@ssword` for every account, idempotent
- [x] Session lifecycle — real `express-session` + `connect-redis` middleware
      (`apps/backend/src/config/session.ts`), not a custom createSession/getSession/destroySession
      wrapper (deliberate architecture choice, documented in `apps/backend/AGENTS.md`)
- [x] Login endpoint — verify credentials (bcrypt), create Redis session, set httpOnly cookie
      (dashboard) + return session id (mobile)
- [x] Logout endpoint — destroys the _actual_ session regardless of whether it authenticated via
      cookie or `Authorization: Session <id>` header (see `common/utils/session.ts`)
- [x] Auth guard for API routes — `SessionAuthGuard`, reads cookie (dashboard) or
      `Authorization: Session <id>` header (mobile) via Redis, applied to `GET /api/auth/me`
- [x] Role guard (student/lecturer) for protected routes — `RolesGuard` +
      `@Roles(...)` decorator (`common/guards/roles.guard.ts`,
      `common/decorators/roles.decorator.ts`), looks up role fresh from the DB per request;
      exported from `AuthModule` for Sprint 2 domain modules to consume once they have real
      routes to restrict
- [ ] Dashboard: login page wired to API (credentialed fetch) — still a static placeholder form
- [x] Mobile: login screen wired to API (react-hook-form + zod, matches the reference app's form
      pattern), session id stored via expo-secure-store, attached to future requests via
      `api.ts`'s interceptor

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
