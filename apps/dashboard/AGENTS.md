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
  reports/page.tsx              real: class picker + attendance summary table + export dropdown
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
                                the rotating-token poll; sessions.mutation.ts's
                                ScheduleSessionPayload is the wire shape — ISO strings — the
                                *form's* date+hour+minute dropdowns get composed into before
                                calling it), validations/sessions.ts (scheduleSessionSchema +
                                combineDateTime(), see "Date/time inputs" below),
                                components/{schedule-session-dialog,sessions-table,qr-display,
                                session-detail}.tsx, types.ts (re-exports ClassSessionDTO)
  attendance/                  services/{attendance.endpoints,attendance.query}.ts (no
                                mutation — lecturer side is read-only), components/
                                {session-roster-table,class-summary-table,export-summary-dropdown,
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
                               alert-dialog, sheet, select, dropdown-menu, popover, calendar,
                               label, badge, separator, skeleton, sonner, ...) — regenerate via
                               `pnpm dlx shadcn@latest add <component>`, don't hand-edit generated
                               internals beyond what shadcn itself supports (except swapping their
                               default lucide-react icons for HugeIcons — see "Icons" below, a
                               deliberate deviation from stock shadcn output). No `form.tsx` — this
                               registry (radix-nova) doesn't ship one; forms use react-hook-form's
                               `Controller`/`useController` directly instead, matching
                               apps/mobile's pattern.
  layout/sidebar-nav.tsx        the actual nav content (logo/title, links, user info, logout with
                                confirmation) — shared between the two chrome variants below so
                                they can't drift apart. Takes an optional `onNavigate` to close the
                                mobile Sheet on link tap.
  layout/sidebar.tsx            desktop-only fixed sidebar (`hidden md:flex`), just wraps
                                SidebarNav in the `<nav>` shell.
  layout/mobile-nav.tsx         `md:hidden` top app bar with a hamburger button opening a Sheet
                                containing SidebarNav — see "Responsive layout" below.
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
gets `MobileNav` + `Sidebar` + content (see "Responsive layout" below). Both return `null` while
loading or mid-redirect so there's no flash of the wrong screen — same reasoning as apps/mobile's
`(auth)/_layout.tsx` / `(app)/_layout.tsx`, just collapsed into one gate since dashboard has no
route groups.

## Responsive layout

Below `md`: `AppShell` stacks `MobileNav` (a top bar with a hamburger button opening a `Sheet`
with the full nav) above full-width content; `Sidebar` renders nothing (`hidden md:flex`). At
`md`+: `MobileNav` renders nothing (`md:hidden`), `Sidebar` shows as a fixed-width row item next
to content. Both variants render the exact same `SidebarNav` content — don't add nav
links/behavior to one without the other. Tables don't need any special mobile handling beyond
what they already have: shadcn's `Table` wraps in `overflow-x-auto` by default.

## Tables — spacing and date formatting

All four data tables (`classes-table.tsx`, `sessions-table.tsx`, `session-roster-table.tsx`,
`class-summary-table.tsx`) add `className="py-3"` to every data-row `TableCell` — shadcn's default
`p-2` reads cramped once rows have real content next to each other. Their loading/error/empty
placeholder rows use `py-8` instead, so a single-line status message doesn't look like a sliver
sitting under the header. Row hover itself needs no extra work — `TableRow`
(`components/ui/table.tsx`) already ships `hover:bg-muted/50`; don't re-add it per table.

Any timestamp rendered as a full date (not just a time) goes through
`modules/shared/lib/util.ts`'s `formatDateTime()` (e.g. "Aug 10, 2026, 9:00 AM") — never
`Date.prototype.toLocaleString()` directly, which defaults to ambiguous `M/D/YYYY` in most
locales. Same rule as apps/mobile's `lib/status.ts` `formatHeaderDate`, just dashboard's version
also keeps the time since these are session start/end timestamps, not day headers. A time-only
value (e.g. roster's "checked in at") can still use `toLocaleTimeString()` directly — there's no
ambiguity once the date component is dropped.

## Logout confirmation

`SidebarNav`'s logout button is an `AlertDialog` trigger, not a direct `onClick={() => logout()}`
— "Log out?" / "You'll need to sign in again..." with a `variant="destructive"` confirm action.
`useLogoutMutation` (`modules/auth/services/auth.mutation.ts`) fires a `sonner` success toast
before redirecting — the `Toaster` lives in the root layout so it persists across the client-side
navigation to `/login`, it isn't unmounted mid-toast.

## Icons — HugeIcons, not lucide-react

`@hugeicons/react`'s `HugeiconsIcon` + `@hugeicons/core-free-icons` (e.g. `<HugeiconsIcon
icon={Logout03Icon} size={16} />`) — the same icon set `apps/mobile` uses via
`@hugeicons/react-native`, for one consistent icon language across both user-facing apps. Every
shadcn-generated primitive that ships its own lucide-react icons (`dialog.tsx`, `sheet.tsx`,
`select.tsx`, `dropdown-menu.tsx`, `calendar.tsx`, `sonner.tsx`) has had them swapped for HugeIcons
equivalents — when regenerating one of these via the shadcn CLI, re-apply the swap rather than
leaving the regenerated lucide imports in place. `lucide-react` stays a dependency only because
`shadcn`'s own tooling expects it to be installed; don't import from it in app code.

## Date/time inputs — dropdowns, not native `datetime-local`

`schedule-session-dialog.tsx` doesn't use `<input type="datetime-local">` — browser-native
date/time pickers look inconsistent across platforms and don't pick up this app's dark theme. A
session's start and end are collected as one shared `Calendar` date (in a `Popover`, the standard
shadcn date-picker composition) plus separate Hour/Minute `Select` dropdowns per side
(`TimeSelect` in the same file, backed by `useController` since it needs two field values/setters
at once — cleaner than nesting two render-prop `Controller`s). `validations/sessions.ts`'s
`combineDateTime(date, hour, minute)` composes the real `Date` both for the schema's cross-field
`endsAt > startsAt` refine and for the dialog's submit handler, which builds the ISO strings
`sessions.mutation.ts`'s `ScheduleSessionPayload` actually wants — the mutation layer only ever
sees the wire shape, not the form's internal date+hour+minute split.

## Export — CSV and Excel

`export-summary-dropdown.tsx` (a `DropdownMenu` off one "Export" button) offers both. CSV reuses
the existing backend endpoint unchanged (`GET /api/attendance/classes/:id/summary/export`, a
top-level `<a download>` — see "Session / CORS" below for why that works without axios). Excel has
no backend endpoint — there's no need for one: it's generated client-side with the `xlsx`
(SheetJS) package from the exact same data `useClassSummaryQuery` already fetched for the table on
screen (`XLSX.utils.json_to_sheet` → `XLSX.writeFile`, which handles the browser download itself).
If the export data shape ever changes, update both the CSV column list
(`apps/backend/src/services/attendance/attendance.service.ts`'s `classSummaryCsv`) and this
component's `rows` mapping — they're independent code paths that happen to produce matching
columns, not generated from one shared definition.

## QR payload contract

`modules/sessions/components/qr-display.tsx` renders `qrcode.react`'s `QRCodeSVG` with
`value={JSON.stringify({ classSessionId, token })}` from the polled `GET
/api/sessions/:id/qr-token` response — this exact shape (key order: `classSessionId` then
`token`, no wrapper) is what apps/mobile's scanner parses. Polls every 15s via
`useQrTokenQuery`'s `refetchInterval` — authenticator-app-style timing: the backend's Redis TTL
(`QR_TOKEN_TTL_SECONDS`) is 39s, a buffer past this interval rather than a match to it, so a code
scanned right as it's about to rotate still has slack before the backend would reject it as
expired. A shrinking ring (SVG `stroke-dashoffset`, CSS-transitioned) next to the "Refreshes in
Ns" text visualizes the countdown. Polling only runs while the session's `[startsAt, endsAt]`
window is open client-side (checked every second locally, since the window can open/close while
the page sits idle) — the endpoint 400s outside that window, so polling pauses via
`enabled: active` rather than surfacing the 400 as an error state.

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
(`modules/attendance/components/export-summary-dropdown.tsx`'s CSV item) is the one exception: a plain
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
  the closest thing so far). Manual verification since has included real headless-browser
  click-throughs (Playwright via a one-off script, not a committed test suite — no `chromium-cli`/
  Playwright is wired into this repo's own tooling) at both desktop and mobile viewport widths,
  not just curl + dev/build output.
- `app/page.tsx` (`/`) is a welcome card + quick-nav cards to Classes/Sessions/Reports — not one
  of the five original brief'd deliverable pages, so kept intentionally light.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
