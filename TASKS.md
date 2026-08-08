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
- [ ] Implement `lib/config/session.ts` (Redis-backed createSession/getSession/destroySession, opaque IDs, TTL)
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
