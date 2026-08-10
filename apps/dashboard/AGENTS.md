# dashboard — Agent Guide

Next.js (App Router) + shadcn/ui (Radix base, Nova preset), Tailwind v4. Lecturer-facing web app.
No direct sister-project reference exists for this app (the monorepo-pattern reference project's
dashboard is Vue-based) — conventions here are synthesized from the project brief using the same
documentation format as `apps/backend`/`apps/mobile`. Wired to the real backend as of Sprint
1–4: real auth, classes, sessions, live QR, and reports — see "Project structure" below for what's
real vs. still a placeholder.

## Project structure

```
app/                          Route files ONLY — thin, import from modules/. Never the reverse.
  layout.tsx                   root layout — QueryProvider + AppShell (auth gate + sidebar/login
                                chrome) + Toaster (sonner)
  page.tsx                     landing page (auth-gated like everything but /login)
  login/page.tsx                real login form (modules/auth/components/login-form.tsx)
  classes/page.tsx              real: list + create-class dialog + per-row enroll-student dialog
  sessions/page.tsx             real: list + schedule-session dialog, links to session detail
  sessions/[id]/page.tsx        real: live QR display (polling, rotates ~60s) + roster (polling)
  reports/page.tsx              real: class picker + attendance summary table + CSV export link
modules/                      All business/domain logic — mirrors apps/mobile/src/modules/.
  auth/                        services/{auth.endpoints,auth.mutation,auth.query}.ts,
                                validations/auth.ts (identifier is always an email here — lecturer
                                only), components/{login-form,auth-gate}.tsx, types.ts
                                (re-exports PublicUser/UserRole/AuthResponse from @attendance/shared)
  classes/                     services/{classes.endpoints,classes.query,classes.mutation}.ts,
                                validations/classes.ts, components/{create-class-dialog,
                                enroll-student-dialog,classes-table}.tsx, types.ts (re-exports
                                ClassDTO)
  sessions/                    (class sessions) services/{sessions.endpoints,sessions.query,
                                sessions.mutation}.ts (sessions.query.ts also has useQrTokenQuery,
                                the rotating-token poll), validations/sessions.ts,
                                components/{schedule-session-dialog,sessions-table,qr-display,
                                session-detail}.tsx, types.ts (re-exports ClassSessionDTO)
  attendance/                  services/{attendance.endpoints,attendance.query}.ts (no
                                mutation — lecturer side is read-only), components/
                                {session-roster-table,class-summary-table,export-summary-link,
                                reports-content}.tsx, types.ts — SessionRosterEntry /
                                ClassAttendanceSummaryEntry defined LOCALLY (not in
                                @attendance/shared — these are report/read-models, not table DTOs,
                                same reasoning as apps/mobile's attendance/types.ts stub comment)
  shared/                      lib/{env,api,util}.ts (env: NEXT_PUBLIC_API_URL, throws if unset;
                                api: axios instance, withCredentials: true; util: ApiError +
                                handleApiError + validateApiResponse, ported from apps/mobile's
                                modules/shared/lib/util.ts — cn() is NOT duplicated here, it stays
                                at the root lib/utils.ts since every shadcn-generated component
                                imports it from `@/lib/utils` specifically),
                                services/{query-client,query-keys}.ts (userKeys/classKeys/
                                sessionKeys/attendanceKeys), components/{query-provider,app-shell,
                                error-message}.tsx
components/
  ui/                         shadcn-generated primitives (button, card, table, input, dialog,
                               select, label, badge, separator, sonner, ...) — regenerate via
                               `pnpm dlx shadcn@latest add <component>`, don't hand-edit generated
                               internals beyond what shadcn itself supports. No `form.tsx` — this
                               registry (radix-nova) doesn't ship one; forms use react-hook-form's
                               `Controller` directly instead, matching apps/mobile's pattern.
  layout/sidebar.tsx           shared nav — 'use client' (needs useCurrentUserQuery for the name
                                display + useLogoutMutation for the logout button), highlights the
                                active route, renders <Logo />
  logo.tsx                     inline-SVG "A" mark, flat/no gradient — mirrors apps/mobile's
                                assets/logo-mark.png and repo-root brand/monochrome.svg; keep
                                all three in sync
assets/fonts/                  Google Sans .ttf files, same copies as apps/mobile/assets/fonts/
lib/utils.ts                   shadcn's cn() helper (clsx + tailwind-merge) — the ONLY cn(), see
                                modules/shared/lib/util.ts note above
```

## Auth gating — client-side, no Server Component session reads

The session lives behind an httpOnly `connect.sid` cookie on a separate-port API
(`localhost:3001`), so there's nothing a Server Component here can read directly. Gating happens
in `modules/shared/components/app-shell.tsx` (renders `modules/auth/components/auth-gate.tsx`,
both `'use client'`), wired into `app/layout.tsx` inside `QueryProvider`: `AuthGate` calls
`useCurrentUserQuery` (`GET /api/auth/me`, returns `null` on any failure, `retry: false`, mirrors
apps/mobile's hook of the same name) and redirects to `/login` for every route except `/login`
when there's no user, or away from `/login` to `/classes` when there already is one. `AppShell`
also swaps chrome based on route: `/login` gets a centered card with no sidebar, everything else
gets `Sidebar` + content. Both return `null` while loading or mid-redirect so there's no flash of
the wrong screen — same reasoning as apps/mobile's `(auth)/_layout.tsx` / `(app)/_layout.tsx`,
just collapsed into one gate since dashboard has no route groups.

## QR payload contract

`modules/sessions/components/qr-display.tsx` renders `qrcode.react`'s `QRCodeSVG` with
`value={JSON.stringify({ classSessionId, token })}` from the polled `GET
/api/sessions/:id/qr-token` response — this exact shape (key order: `classSessionId` then
`token`, no wrapper) is what apps/mobile's scanner parses. Polls every 60s via
`useQrTokenQuery`'s `refetchInterval` (the token's Redis TTL is ~90s, so 60s stays comfortably
ahead of expiry) and only while the session's `[startsAt, endsAt]` window is open client-side
(checked every second locally, since the window can open/close while the page sits idle) — the
endpoint 400s outside that window, so polling pauses via `enabled: active` rather than surfacing
the 400 as an error state.

## Styling — dark-by-default, Google Sans, matches apps/mobile

- **Dark by default, no toggle.** `app/layout.tsx` puts a static `dark` class on `<html>`
  (shadcn's `.dark` CSS-variable block in `app/globals.css`) — there is no light/dark switch.
  If a toggle is ever added, the default must stay dark to match mobile.
- **Font: Google Sans**, loaded via `next/font/local` in `app/layout.tsx` from
  `assets/fonts/GoogleSans-*.ttf` (same files as `apps/mobile/assets/fonts/`), exposed as
  `--font-sans` and wired to Tailwind's `font-sans` by shadcn's `@theme inline` block in
  `app/globals.css`. These are the actual Google Sans files, not an open-licensed substitute — a
  known licensing risk the user explicitly accepted; don't swap fonts to "fix" this.
- **Accent/danger colors** in `app/globals.css`'s `.dark` block: `--primary: #3b82f6` (blue),
  `--destructive: #ef4444` (red) — the same hex values as `apps/mobile/tailwind.config.js`'s
  `accent.hover`/`danger.hover`. Keep them in sync if either changes; don't let them drift back to
  shadcn's neutral defaults.
- **Logo**: `components/logo.tsx` — inline SVG, not an `<img>`, so it stays crisp at any size.
  Used in the sidebar and the login card. Flat white mark, no gradient/shadow — mirrors
  `apps/mobile/assets/logo-mark.png` (both rasterized from the same source at repo-root
  `brand/monochrome.svg`), **not** `brand/logo-mark.svg`'s glossy chrome/glass treatment, which is
  reserved for OS-level app icons only (see `brand/README.md`) and reads badly at these small
  inline sizes. If the mark changes, update the SVG path data here too. The browser-tab favicon
  (`app/icon.png`/`apple-icon.png`) follows the same flat-on-web reasoning — generated from
  `brand/icon-mono.svg` (flat mark on black square), not `brand/icon.svg`'s gradient version.
- The rendered QR code sits in a white card (`bg-white p-4` in `qr-display.tsx`) even on this
  dark-only app — QR scanners need real contrast, not the dark theme's `--background`.

## shadcn/ui conventions

- New components: `pnpm dlx shadcn@latest add <name>` from `apps/dashboard/`, not hand-written
  from scratch — keeps them in sync with the registry.
- `components.json` pins style `radix-nova` — don't switch base libraries (Base UI / React Aria)
  or presets without updating this file deliberately.
- Theming is CSS-variable based (Tailwind v4, no `tailwind.config.js`) — see `app/globals.css`.

## Session / CORS

Every mutating request goes through `modules/shared/lib/api.ts`'s axios instance
(`withCredentials: true`), so the httpOnly session cookie the backend sets on
`POST /api/auth/login` is stored and resent automatically — the backend's CORS config
(`apps/backend/src/main.ts`) already sets `credentials: true`. The CSV export
(`modules/attendance/components/export-summary-link.tsx`) is the one exception: a plain
`<a href download>` top-level navigation instead of an axios call, since it's a file download and
the cookie is `SameSite=Lax` (sent on top-level GET navigations regardless). **No JWT, ever** —
same hard rule as the backend; the cookie carries only an opaque session id, never read or stored
by app code.

## Naming conventions

kebab-case files, PascalCase named-export components (except `page.tsx`/`layout.tsx`, which are
Next.js's required default exports). Imports use the `@/*` path alias (`@/components/...`,
`@/modules/...`, `@/lib/...`) throughout — unlike apps/mobile, which deliberately avoids the alias
in favor of relative imports; that's a mobile-specific convention, not a monorepo-wide one.

## Known gaps / not yet done

- No integration/e2e test suite for this app (root `TASKS.md`'s Sprint 5 manual-QA-pass bullet is
  the closest thing so far — exercised via curl against the live backend + Next's dev/build
  output, not a headless-browser click-through, since no browser automation tool was available in
  the environment this was built in).
- `app/page.tsx` (`/`) is still the Sprint-0 static landing card (auth-gated like every other
  route, just no real content of its own) — not one of the five brief'd deliverable pages, so left
  alone.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
