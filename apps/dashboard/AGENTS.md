# dashboard — Agent Guide

Next.js (App Router) + shadcn/ui (Radix base, Nova preset), Tailwind v4. Lecturer-facing web app.
No direct sister-project reference exists for this app (the monorepo-pattern reference project's
dashboard is Vue-based) — conventions here are synthesized from the project brief using the same
documentation format as `apps/backend`/`apps/mobile`.

## Project structure

```
app/
  layout.tsx                 root layout — wraps every page with components/layout/sidebar.tsx
  page.tsx                   landing page
  login/page.tsx              placeholder login form
  classes/page.tsx            placeholder classes table
  sessions/page.tsx           placeholder sessions table
  sessions/[id]/page.tsx      placeholder live QR display
  reports/page.tsx            placeholder reports/export
components/
  ui/                         shadcn-generated primitives (button, card, table, input, ...) —
                               regenerate via `pnpm dlx shadcn@latest add <component>`, don't
                               hand-edit generated internals beyond what shadcn itself supports
  layout/sidebar.tsx           shared nav, links to all top-level pages, renders <Logo />
  logo.tsx                     inline-SVG "A" mark — mirrors apps/mobile's assets/logo-mark.png
                                and repo-root brand/logo-mark.svg; keep all three in sync
assets/fonts/                  Google Sans .ttf files, same copies as apps/mobile/assets/fonts/
lib/utils.ts                   shadcn's cn() helper (clsx + tailwind-merge)
```

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
  Used in the sidebar and the login card. Mirrors `apps/mobile/assets/logo-mark.png` (rasterized
  from the same source at repo-root `brand/logo-mark.svg`) — if the mark changes, update the SVG
  path data here too.

## shadcn/ui conventions

- New components: `pnpm dlx shadcn@latest add <name>` from `apps/dashboard/`, not hand-written
  from scratch — keeps them in sync with the registry.
- `components.json` pins style `radix-nova` — don't switch base libraries (Base UI / React Aria)
  or presets without updating this file deliberately.
- Theming is CSS-variable based (Tailwind v4, no `tailwind.config.js`) — see `app/globals.css`.

## Session / CORS (future work — not wired yet)

The dashboard has no login logic yet. Once wired (Sprint 1): the login page's fetch call to
`POST /api/auth/login` must use `credentials: 'include'` so the backend's httpOnly session cookie
is stored; the backend's CORS config (`apps/backend/src/main.ts`) already sets
`credentials: true`. **No JWT, ever** — same hard rule as the backend; the cookie carries only an
opaque session id.

## Naming conventions

kebab-case files, PascalCase named-export components (except `page.tsx`/`layout.tsx`, which are
Next.js's required default exports), one page per route matching promp.md's page list above.

## Out of scope this pass (Sprint 0)

No data fetching, no auth, no real class/session/report data — every page is static placeholder
content per the root `TASKS.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
