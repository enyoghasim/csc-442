# Attendance Tracker — Agent Guide

Monorepo for the Attendance Tracking System: three independent apps plus one shared package, each with its own toolchain and its own `AGENTS.md`. This root file is a router, not a rulebook — figure out where the task lives, then go read (and follow) that app's `AGENTS.md` before touching any code. Don't cross-apply one app's conventions to another; they're deliberately different stacks.

| Folder                               | Stack                                                   | Docs                                                   |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------ |
| [apps/backend/](apps/backend/)       | NestJS — API only, no UI                                | [apps/backend/AGENTS.md](apps/backend/AGENTS.md)       |
| [apps/mobile/](apps/mobile/)         | Expo / React Native (TypeScript), student-facing        | [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md)         |
| [apps/dashboard/](apps/dashboard/)   | Next.js (App Router) + shadcn/ui, lecturer-facing       | [apps/dashboard/AGENTS.md](apps/dashboard/AGENTS.md)   |
| [packages/shared/](packages/shared/) | Plain TypeScript, no build step                         | [packages/shared/AGENTS.md](packages/shared/AGENTS.md) |
| [brand/](brand/)                     | Source SVGs for the logo mark (not a workspace package) | —                                                      |

## Hard rules that apply everywhere

- **No JWT, anywhere, ever.** Auth is strictly session-based: opaque session IDs stored in Redis, validated by lookup on every request. If you find yourself reaching for a JWT library, stop — that's the wrong direction for this project.
- **No self-registration.** Accounts are pre-seeded from a class list. There is only a login flow, never a register flow, in any app.
- pnpm exclusively — no npm/yarn lockfiles.

## Design system (mobile + dashboard)

Both user-facing apps share one dark-only visual identity, ported from a sister project:
Google Sans typography (actual font files in each app's `assets/fonts/`, a known licensing
tradeoff the user accepted knowingly), the same "A" logo mark — flat, no gradient, for in-app use
in both (source at `brand/monochrome.svg`, rasterized into `apps/mobile/assets/`, re-implemented
as inline SVG in `apps/dashboard/components/logo.tsx`; `brand/logo-mark.svg`'s glossy chrome/glass
version is reserved for OS-level app icons only, see `brand/README.md`) — and the same
accent/danger color hex values
(`#3b82f6`/`#ef4444`). Changing any of these in one app without the other is a regression, not a
style choice — see each app's `AGENTS.md` "Styling" section for specifics.

## Cross-cutting

If a task spans more than one app, treat it as separate work per app: read each app's `AGENTS.md` independently, and scope commits per app rather than mixing them into one — a change touching both `apps/backend` and `apps/mobile` is two commits, not one, unless the change is genuinely only in `packages/shared`.

Monorepo tooling is pnpm workspaces + Turborepo (`turbo.json` at root). Root `package.json` scripts wrap `turbo run <task> --filter=<app>`.
