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
                               (centralized pgEnum defs) + index.ts barrel
    seed/seed.ts               seed script, run via `pnpm db:seed`
  controllers/                thin HTTP layer, one file per domain, @Controller per route group
  services/<domain>/           business logic, one folder per domain
  repositories/<domain>/       ONLY layer that touches DatabaseService/Drizzle
  modules/<domain>/            Nest module wiring (controller + service + repositories)
  dtos/                        request/query DTOs (class-validator), one file per domain
  common/
    guards/                    session-auth.guard.ts (stub — not wired to any route yet)
    filters/                   http-exception.filter.ts — single global filter
    utils/                     response-factory.ts — successResponse() helper
  @types/express-session/       module augmentation for SessionData
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
- `config/session.ts` wires real `express-session` + `connect-redis` middleware (this is
  infrastructure boilerplate, not the "no session logic yet" business logic promp.md's Sprint 0
  scope refers to — the session _lifecycle_ (who gets logged in, role checks) is still Sprint 1).
  The cookie carries only the session id; `SessionData` (`userId`, `role`) lives in Redis under
  `sess:<id>` (TTL = `SESSION_TTL_SECONDS`), written directly via `req.session.userId = ...` in
  the auth controller on login — no separate `createSession`/`getSession`/`destroySession`
  wrapper functions (that's `express-session`'s job, not ours to reimplement).
- `SESSION_SECRET` (in root `.env.example`) is **not** a JWT secret — it's `express-session`'s
  cookie-signing key (HMAC, prevents cookie tampering), an orthogonal concern. There is still no
  JWT anywhere.
- Mobile has no cookie jar, so login also returns the session id in the response body; mobile
  attaches it as `Authorization: Session <id>` on future requests (Sprint 1).
- `common/guards/session-auth.guard.ts` is a stub (`canActivate` always returns `true`) — Sprint 1
  wires it to check `request.session?.userId` and isn't applied to any controller yet.

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
- No RabbitMQ/S3/mail/Swagger layers — out of scope for this project.
- No `xAppModule`-style renamed root module — plain `AppModule`.

## Out of scope this pass (Sprint 0)

No real schema columns beyond `id`/`createdAt`/`updatedAt`. No session lifecycle logic (login
doesn't actually set `req.session.userId` yet). No auth guard wired to any route. No rate
limiting. No QR token generation. All of that is Sprint 1+ per the root `TASKS.md`.
