# backend — Agent Guide

NestJS 11 + Drizzle (postgres-js driver) + Redis (ioredis). API only — no views, no templates.
Conventions here are ported from a sister project's NestJS/Drizzle/Redis backend, adapted where
noted.

## Project structure

```
src/
  main.ts                    bootstrap: connectRedis, session middleware, global 'api' prefix,
                              ValidationPipe, HttpExceptionFilter
  app.module.ts               root module — imports DatabaseModule + one module per domain
  config/                     one file per infra concern
    env.ts                    zod-validated typed env — NO other file reads process.env directly
    db.ts                     (see database/database.service.ts — Drizzle client lives there,
                               not here, since it's also a Nest-injectable service)
    redis.ts                  ioredis client singleton + connectRedis()
    redis-keys.ts             key-builder functions + TTL constants (sess:*, qr:*)
    session.ts                express-session config, connect-redis RedisStore — this IS the
                               real session wiring (not a stub); see "Authentication" below
  database/
    database.module.ts        @Global, exports DatabaseService
    database.service.ts       owns the postgres-js Pool + drizzle(pool, { schema })
    database.types.ts         DbExecutor type (db handle or tx handle)
    schema/                   ONE pgTable PER FILE (users, classes, enrollments,
                               class-sessions, attendance-records) + enums.schema.ts
                               (centralized pgEnum defs) + index.ts barrel. `users` has real
                               columns (role, name, email, regNumber, passwordHash) — the other
                               four tables are still id/createdAt/updatedAt stubs.
    seed/
      seed.ts                  seed script, run via `pnpm db:seed` — reads data/students.json,
                                inserts one lecturer + all students, bcrypt-hashes the shared
                                default password once and reuses the hash, idempotent via
                                onConflictDoNothing on email/regNumber
      data/students.json        name+regNumber pairs, extracted from a class list spreadsheet
                                (not committed to re-derive from the source .xlsx — this file
                                IS the source of truth now)
  controllers/                thin HTTP layer, one file per domain, @Controller per route group
  services/<domain>/           business logic, one folder per domain
  repositories/<domain>/       ONLY layer that touches DatabaseService/Drizzle
  modules/<domain>/            Nest module wiring (controller + service + repositories)
  dtos/                        request/query DTOs (class-validator), one file per domain
  common/
    guards/                    session-auth.guard.ts, roles.guard.ts — both real, see
                               "Authentication" below
    decorators/                roles.decorator.ts — @Roles(...roles: UserRole[]), read by
                               roles.guard.ts via Reflector
    filters/                   http-exception.filter.ts — single global filter
    utils/                     response-factory.ts (successResponse()), serialize-user.ts
                               (toPublicUser() — allow-list, strips passwordHash),
                               api-docs.util.ts (errorExample(), see "Swagger"), csv.util.ts
                               (toCsv() — generic header+rows -> CSV string)
    api-docs/                  <domain>.docs.ts — composed @Api*() decorators per route, kept
                               out of the controllers themselves; examples.ts — shared example
                               payloads (see "Swagger")
  @types/
    express-session/            module augmentation for SessionData (userId only — see below)
    express/                    module augmentation for Request.currentUserId (see below)
```

## Layering rule

**Controller → Service → Repository → Drizzle.** Controllers never touch Drizzle/`DatabaseService`
directly; services never touch `DatabaseService` directly (only repositories may); services never
touch `Request`/`Response`/session — route handlers extract cookies/session and pass plain args.
Every domain gets matching folders across `controllers/`, `services/<domain>/`,
`repositories/<domain>/`, `modules/<domain>/` even at stub stage, so the skeleton is consistent
end to end.

## Drizzle conventions

- One `pgTable` per file under `database/schema/`, uuid primary keys
  (`id: uuid('id').defaultRandom().primaryKey()`), `createdAt`/`updatedAt` timestamptz columns on
  every table.
- All `pgEnum` definitions centralized in `database/schema/enums.schema.ts` — don't let
  per-domain duplicate/divergent enums creep back in. These mirror `@attendance/shared`'s
  `UserRole`/`AttendanceStatus` TS enums; keep both in sync.
- `class_sessions` (Postgres table) / `classSessions` (Drizzle export) is deliberately named to
  avoid confusion with the auth "session" concept below, which lives only in Redis — never in
  Postgres.
- Migrations: `pnpm db:generate` → `pnpm db:migrate`. `drizzle.config.ts` loads env from the
  monorepo root `.env` (two levels up from this app).

## Authentication & sessions — hard rules

- **Opaque, Redis-backed session IDs only. No JWT, ever.**
- `config/session.ts` wires real `express-session` + `connect-redis` middleware. `SessionData`
  (`userId` only) lives in Redis under `sess:<id>` (TTL = `SESSION_TTL_SECONDS`), written directly
  via `req.session.userId = ...` in `AuthController.login` — no separate
  `createSession`/`getSession`/`destroySession` wrapper functions (that's `express-session`'s job,
  not ours to reimplement). Deliberately **not** cached: `role` is not stored in the session —
  looking it up fresh from the DB by `userId` at the point of an authorization check avoids acting
  on a role that's gone stale since login (e.g. a promotion/demotion that happened mid-session).
- `SESSION_SECRET` (in root `.env.example`) is **not** a JWT secret — it's `express-session`'s
  cookie-signing key (HMAC, prevents cookie tampering), an orthogonal concern. There is still no
  JWT anywhere.
- **One client-agnostic cookie path, no manual session-id handling.** `express-session` populates
  `request.session` automatically on every request, for both dashboard (browser cookie jar) and
  mobile (axios instance created with `withCredentials: true` in
  `apps/mobile/src/modules/shared/lib/api.ts`, so it stores/resends the httpOnly `connect.sid`
  cookie exactly like a browser would). Neither client needs to see or manage the raw session id.
- `common/guards/session-auth.guard.ts` throws `UnauthorizedException` if `request.session?.userId`
  is unset; on success it sets `request.currentUserId` (a separate property from `request.session`,
  kept that way so downstream code doesn't have to know it's session-backed). Applied via
  `@UseGuards(SessionAuthGuard)` at the controller level on every domain controller; apply it to
  any other route that needs a logged-in user.
- `common/guards/roles.guard.ts` + `common/decorators/roles.decorator.ts` — `@Roles(...roles:
UserRole[])` marks a route as role-restricted; `RolesGuard` looks the current user's role up
  **fresh from the DB** on every check (never cached, same reasoning as above — a role change
  must take effect immediately). Runs after `SessionAuthGuard` (needs `request.currentUserId`
  already set), applied per-route via `@UseGuards(RolesGuard)` + `@Roles(UserRole.Lecturer)` (or
  `.Student`) — e.g. `POST /api/classes` is lecturer-only, `POST /api/attendance/check-in` is
  student-only. A route with `@UseGuards(SessionAuthGuard)` but no `@Roles()` just needs _a_
  logged-in user, either role. `RolesGuard` needs `UsersRepository` via DI, so any module using it
  imports `AuthModule` (which exports both `UsersRepository` and `RolesGuard`).
- `users.role` (Drizzle's `pgEnum` literal union) and `@attendance/shared`'s `UserRole` (a plain
  `as const` object + type, not a TS `enum` — see that package's `AGENTS.md`) are the same string
  values but structurally distinct types; comparing them is fine without a cast since both resolve
  to the same `'student' | 'lecturer'` literal union.
- Logout destroys the session directly — `request.session.destroy(...)` in `AuthController.logout`,
  no wrapper needed now that there's only one path to a session.
- Login accepts `{ identifier, password }` — `identifier` is a lecturer's email or a student's
  regNumber, whichever matches (`UsersRepository.findByIdentifier`). Response is `{ user }` where
  `user` is `toPublicUser()`'d (passwordHash stripped, allow-list not deny-list — new sensitive
  columns don't leak by default). The session id itself is never in the response body — it only
  ever exists in the `Set-Cookie` header, written straight to Redis by connect-redis.

## Domains — classes, class-sessions, attendance

All three are real (Sprint 2/3/4), following the same `Controller → Service → Repository →
Drizzle` layering as auth. Ownership is checked by service methods (a lecturer can only
create/update/schedule/see reports for classes they teach), not by the DB — `getOwnedClass`/
`getOwnedSession`-style private (or, when reused cross-domain, public) helpers throw
`NotFoundException`/`ForbiddenException` before touching the write path.

- **`classes`** (`controllers/classes.controller.ts`) — `POST/GET /api/classes` (create is
  lecturer-only, list is role-aware: lecturers get classes they teach, students get classes
  they're enrolled in via a join), `PATCH /api/classes/:id`, `POST /api/classes/:id/enrollments`
  (enroll a student by regNumber). A duplicate class `code` or duplicate enrollment returns a
  clean `409` — `database/database.types.ts`'s `isUniqueViolation()` catches the Postgres unique-
  constraint error rather than letting it fall through to the global filter's generic `500`.
- **`class-sessions`** (`controllers/sessions.controller.ts`, route path `/api/sessions`) —
  `POST/GET /api/sessions` (schedule is lecturer-only, must own the class; list is role-aware
  same as classes), `GET /api/sessions/:id/qr-token` (lecturer-only, only while the session is
  inside its `[startsAt, endsAt]` window — issues a fresh random token into Redis via
  `config/redis-keys.ts`'s `qrTokenKey`/`QR_TOKEN_TTL_SECONDS` every call, overwriting whatever
  was there; there's no separate "fetch without rotating"). `ClassSessionsService.getOwnedSession`
  is public and reused by `AttendanceService`'s session-roster endpoint.
- **`attendance`** (`controllers/attendance.controller.ts`) — `POST /api/attendance/check-in`
  (student-only, rate-limited 5/min/IP via `@nestjs/throttler`'s `ThrottlerGuard`, configured in
  `modules/attendance/attendance.module.ts`; validates the session window, the student's
  enrollment, and the token against Redis, in that order, before writing an attendance record —
  duplicate check-in is a `409` via the same `isUniqueViolation()` path), `GET /api/attendance/me`
  (student's own history — every session of every class they're enrolled in, real record where
  one exists, `'absent'` synthesized for any _past_ session with no record, same default-absent
  reasoning as the roster below; a session that hasn't ended yet is omitted rather than shown
  absent, so it doesn't read as "already marked absent" before its check-in window even opens),
  `GET
/api/attendance/sessions/:sessionId` (lecturer-only roster — every enrolled student, `'absent'`
  filled in for anyone with no record for that session), `GET
/api/attendance/classes/:classId/summary` (lecturer-only, sessions-present / total-sessions
  percentage per student) and `.../summary/export` (same data as CSV via `common/utils/csv.util.ts`'s
  `toCsv()`, bypasses `successResponse()` on purpose via `@Res()` — it's a file download, not a
  JSON envelope).

## Response envelope

Every route returns `successResponse(data, message?)` from `common/utils/response-factory.ts` —
`{ success: true, data, message? }` — **including `/api/health`**, no exception. Errors go through
the single global `HttpExceptionFilter`, shape `{ success: false, error: { statusCode, message } }`.

## Naming conventions

kebab-case files, PascalCase classes, camelCase functions/vars, one domain = one set of matching
folder names across `controllers/services/repositories/modules` (e.g. `class-sessions`).

## Deviations from the reference backend (intentional, don't "fix")

- Env validation uses **zod**, not Joi (this project's other zod usage — request DTOs — makes zod
  the single validation library across the app).
- Redis client is **ioredis**, not the `redis` npm package.
- No RabbitMQ/S3/mail layers — out of scope for this project.
- No `xAppModule`-style renamed root module — plain `AppModule`.

## Swagger

Ported from the reference backend: `@nestjs/swagger`'s `SwaggerModule`/`DocumentBuilder` wired in
`main.ts`, served at `/api/docs` (outside `main.ts`'s global `api` prefix handling, same as the
reference). One security scheme — `addCookieAuth('connect.sid')` — covers both clients now that
mobile authenticates the same way dashboard does (see "Authentication" above).
Per-route docs live in `common/api-docs/<domain>.docs.ts` as composed decorators (`LoginDocs()`,
`MeDocs()`, ...) applied with a single line on each controller method — same pattern as the
reference's `common/api-docs/auth.docs.ts`, so a route's Swagger annotations never crowd out its
actual logic. Example payloads for docs live in `common/api-docs/examples.ts`; error-response
examples go through `common/utils/api-docs.util.ts`'s `errorExample()`, which mirrors this
project's actual `HttpExceptionFilter` envelope (`{ success: false, error: { statusCode, message } }`)
— not the reference's flatter shape.

## Testing

Two layers, both real: `pnpm test` (unit — `src/**/*.spec.ts`, repositories/Redis mocked, no DB
needed) and `pnpm test:e2e` (`test/*.e2e-spec.ts` — real Postgres + Redis, full `main.ts` bootstrap
via `test/utils/create-test-app.ts`, not a stripped-down test double: same session middleware,
`ValidationPipe`, `HttpExceptionFilter`). E2e specs log in as the seeded lecturer/student accounts
(`test/utils/fixtures.ts`), create their own uniquely-coded test data, and clean it up in
`afterAll` respecting FK order (`attendance_records` → `class_sessions` → `enrollments` →
`classes`). `test/jest-e2e.json` pins `maxWorkers: 1` — the 4 spec files share the same seeded
fixtures and real DB/Redis, and running them as concurrent workers produced a real intermittent
flake; `forceExit: true` is there because `config/redis.ts`'s `redis` export is a bare
module-level singleton, not part of Nest's DI-managed lifecycle, so nothing closes it when an
individual test app's `app.close()` runs.

## Out of scope still

Auth, the full schema, and the classes/class-sessions/attendance domains are all real now (see
"Authentication" and "Domains" above), with both unit and integration test coverage (see
"Testing"). What's left per the root `TASKS.md` is a manual QA pass covering expired-session edge
cases through the actual dashboard/mobile UIs (needs a browser/device, not available in every
environment this gets worked on), and non-engineering Sprint 5 items (technical report, demo
prep). Everything else outstanding in `TASKS.md` is dashboard/mobile UI work, out of this app's
scope.
