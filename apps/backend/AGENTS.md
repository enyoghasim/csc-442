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
    guards/                    session-auth.guard.ts — real, see "Authentication" below
    filters/                   http-exception.filter.ts — single global filter
    utils/                     response-factory.ts (successResponse()), serialize-user.ts
                               (toPublicUser() — allow-list, strips passwordHash),
                               api-docs.util.ts (errorExample(), see "Swagger")
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
  `@UseGuards(SessionAuthGuard)` on `GET /api/auth/me` and `POST /api/auth/logout`; apply it to any
  other route that needs a logged-in user.
- Logout destroys the session directly — `request.session.destroy(...)` in `AuthController.logout`,
  no wrapper needed now that there's only one path to a session.
- Login accepts `{ identifier, password }` — `identifier` is a lecturer's email or a student's
  regNumber, whichever matches (`UsersRepository.findByIdentifier`). Response is `{ user }` where
  `user` is `toPublicUser()`'d (passwordHash stripped, allow-list not deny-list — new sensitive
  columns don't leak by default). The session id itself is never in the response body — it only
  ever exists in the `Set-Cookie` header, written straight to Redis by connect-redis.

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

## Out of scope still

Login/logout/me and the `users` table are real (see "Authentication" above). Everything else
per the root `TASKS.md` is still ahead: `classes`/`enrollments`/`class_sessions`/
`attendance_records` are still id/createdAt/updatedAt stubs with no real columns, no role guard
distinguishing student vs lecturer routes yet (the guard checks _authenticated_, not _authorized
for this role_), no rate limiting, no QR token generation.
