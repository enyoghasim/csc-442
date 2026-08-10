# Attendance Tracking System — Task Board

## Sprint 0 — Bootstrap

- [x] pnpm workspace structure (backend, mobile, dashboard, shared)
- [x] Docker Compose (Postgres + Redis)
- [x] Backend health check route
- [x] Mobile: Expo app boots with 3-tab layout (Home, My Attendance, Settings) + NativeWind working
- [x] Dashboard: Next.js + shadcn boots with placeholder pages
- [x] Shared package wired into all three apps

## Sprint 1 — Auth + Schema (session-based, seeded accounts, no JWT)

- [x] Define full Drizzle schema — `classes` (name, code, lecturerId), `enrollments`
      (studentId, classId, unique pair), `classSessions` (classId, startsAt/endsAt check-in
      window), `attendanceRecords` (classSessionId, studentId, status, checkedInAt, unique
      per session/student); migration `0002_concerned_sister_grimm.sql` applied
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

- [x] Backend: classes API — `POST/GET /api/classes` (create is lecturer-only via `RolesGuard`,
      list is role-aware: lecturers get classes they teach, students get classes they're
      enrolled in), `PATCH /api/classes/:id` (lecturer must own the class),
      `POST /api/classes/:id/enrollments` (enroll a student by regNumber); duplicate class code
      and duplicate enrollment both return a clean 409, not a raw DB error
- [ ] Dashboard: create/edit/list classes
- [ ] Dashboard: enroll students into a class
- [ ] Dashboard: schedule a class session (date/start/end)
- [ ] Mobile Home tab: show today's real class/session info

## Sprint 3 — QR Check-in

- [x] Backend: generate rotating QR token per active class session, store in Redis with TTL —
      `GET /api/sessions/:id/qr-token` (lecturer only, must own class, session must be within
      its `[startsAt, endsAt]` window), overwrites `qr:<classSessionId>` with a fresh random
      token + `QR_TOKEN_TTL_SECONDS` TTL every call — poll it to rotate the displayed code
- [x] Backend: endpoint to fetch current QR token for a class session — same endpoint as above
      (fetch and rotate are the same action; there's no separate "current without rotating")
- [x] Backend: check-in endpoint — `POST /api/attendance/check-in` (student only), validates
      session window, enrollment, and the token against Redis, then writes an attendance
      record; duplicate check-in returns 409, not a raw DB error
- [x] Rate limiting on check-in endpoint — `@nestjs/throttler`, 5 requests/min per IP
      (`ThrottlerModule.forRoot` in `modules/attendance/attendance.module.ts`)
- [ ] Dashboard: live QR display on session page, auto-refreshing
- [ ] Mobile: wire expo-camera QR scanner to check-in endpoint

## Sprint 4 — History & Reports

- [ ] Mobile My Attendance tab: wire calendar to real attendance data, tap-day detail view
- [x] Backend: attendance report per class session/class — `GET /api/attendance/sessions/:id`
      (per-session roster, every enrolled student, 'absent' filled in for anyone with no
      record) and `GET /api/attendance/classes/:id/summary` (per-student sessions-present /
      total-sessions percentage across the whole class); `GET /api/attendance/me` is the
      student-facing equivalent (own history, joined with session start/end)
- [ ] Dashboard: attendance report per class session/class (%, present/absent list) — UI
- [x] Backend: CSV export endpoint — `GET /api/attendance/classes/:id/summary/export`
- [ ] Dashboard: export button — UI

## Sprint 5 — Testing & Report

- [x] Unit tests: backend services — `AuthService`, `ClassesService`, `ClassSessionsService`,
      `AttendanceService` (40 tests, Jest, repositories/Redis mocked; `jest.config`'s
      `transformIgnorePatterns` needed no change in the end — see the `packages/shared`
      `package.json` fix below, which was the actual fix)
- [ ] Integration tests: login, session, attendance endpoints
- [x] Manual QA pass (backend): exercised expired/inactive QR window, wrong token, duplicate
      check-in, unenrolled student, wrong-role rejection, and rate-limit-exceeded against the
      running dev server + Postgres/Redis — see commit history for the full pass
- [ ] Manual QA pass (dashboard/mobile): expired session, duplicate scan, wrong class edge cases
- [ ] Technical report draft
- [ ] Final polish + demo prep
