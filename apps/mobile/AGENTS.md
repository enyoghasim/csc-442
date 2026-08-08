# mobile — Agent Guide

Expo (React Native) app, student-facing. Expo Router (file-based routing) + TanStack Query +
Zustand + NativeWind (Tailwind for RN) + axios. Conventions here are ported from a sister
project's Expo app, adapted where noted.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Project structure

```
src/
  app/                      Expo Router routes ONLY. File path = URL path. No business logic here.
    index.tsx                Landing screen (video background + "Log in" button)
    login.tsx                Login screen (placeholder, Sprint 1 wires the form)
    (tabs)/                 Bottom-tab screens: index (Home), attendance (My Attendance), settings
    scanner.tsx             Non-tab route (modal), reachable from Home's "Scan QR" button
    _layout.tsx             Root layout: font loading + splash screen, QueryClientProvider, Stack
  modules/                  All business/domain logic. Route files import FROM here — never the reverse.
    <domain>/                auth, attendance, classes, shared
      components/           Domain-specific UI components (not routes)
      services/               API layer (axios calls, TanStack Query hooks, once wired)
      store/                  Zustand stores
      validations/            Zod schemas + inferred types for forms (once forms exist)
      types.ts                Flat file for the domain's shared TS types (NOT a types/ folder,
                               except shared/)
    shared/components/       button.tsx, themed-text.tsx — the design-system primitives, see
                              "Styling" below
    auth/components/         overlay-video.tsx, login-screen.tsx
  global.css                 Tailwind entrypoint
```

`modules/shared/` is the one exception with extra structure (`lib/api.ts`, `lib/env.ts`,
`lib/util.ts`, `services/query-client.ts`, `services/query-keys.ts`) since it's imported by every
other module. A new domain gets its own `modules/<domain>/` following this same shape.

## Naming conventions — follow strictly

- **Files & folders:** kebab-case, always. Never PascalCase or camelCase filenames.
- **Components:** PascalCase export, **named** export (not default), kebab-case filename matching
  it — `export const HomeScreen = ...` in `home-screen.tsx`. Route files under `src/app/` are the
  only default exports (Expo Router requires it).
- **Hooks** (once they exist): prefixed `use`, suffixed `Query`/`Mutation` — `useClassesQuery`,
  `useLoginMutation`.

## Imports — follow strictly

- **Relative imports everywhere** — inside both `src/modules/**` and `src/app/**`. A `@/*` → `src/*`
  alias exists in `tsconfig.json` but isn't used in practice; don't introduce it into new files
  just because it's configured.

## API layer conventions

- `modules/shared/lib/api.ts` is the single axios instance, base URL from `EXPO_PUBLIC_API_URL`.
  Its request interceptor already attaches `Authorization: Session <id>` from
  `modules/auth/services/auth-storage.ts` — this is the **only** place the session id is
  read/written (via `expo-secure-store`). **No JWT, ever** — same hard rule as the backend.
- `modules/auth/services/auth-storage.ts` functions (`getSessionId`/`setSessionId`/
  `clearSessionId`) are stubs until Sprint 1's login flow lands.

## Styling — dark-only, Google Sans, ported from the sister project

- **Dark theme only** (`app.json`'s `userInterfaceStyle: "dark"`) — screens use `bg-black`,
  `text-white`, `zinc-*` for muted text/borders, no light-mode variants.
- **Font: Google Sans**, 9 weights, loaded via `useFonts` in `src/app/_layout.tsx` from
  `assets/fonts/GoogleSans-*.ttf` (splash screen stays up via `expo-splash-screen` until loaded).
  These are the actual Google Sans files, not an open-licensed substitute — the user explicitly
  chose to accept the licensing risk after this was flagged; don't "fix" this by swapping fonts.
  Never use plain `font-bold`/`font-medium` Tailwind classes (RN doesn't synthesize weights for
  custom TTFs) — always go through `ThemedText`'s `weight` prop or the `font-google-sans-*`
  classes in `tailwind.config.js`.
- **`modules/shared/components/themed-text.tsx`** — centralizes font-family + size/line-height
  `variant`s (`title`/`subtitle`/`lg`/`md`/`sm`/`xs`) and `weight`s (`regular`/`medium`/
  `semibold`/`bold`). Prefer this over a raw RN `<Text>` for anything but the most trivial label.
- **`modules/shared/components/button.tsx`** — variants (`light`/`outline-light`/`outline-dark`/
  `danger`) × sizes (`sm`/`md`/`lg`), loading state via `ActivityIndicator` (not a custom spinner —
  kept dependency-light, no `@hugeicons`/`reanimated` for this). Prefer this over a raw
  `TouchableOpacity` for buttons.
- **`cn()`** in `modules/shared/lib/util.ts` (`clsx` + `tailwind-merge`) merges classes for any
  component accepting a `className` prop.
- **Brand color tokens** in `tailwind.config.js`: `accent.hover` (#3b82f6, blue), `danger.hover`
  (#ef4444, red) — the same values the dashboard app's CSS variables use, so pick colors from here
  rather than inventing new ones.
- **Logo**: `assets/logo-mark.png` (transparent) — a hand-built 3D-bevel "A" mark (source SVG at
  repo-root `brand/`), used on the landing screen (`src/app/index.tsx`) and login screen. The
  dashboard's `components/logo.tsx` renders the same mark as inline SVG — keep both in sync if the
  mark ever changes.
- **Landing screen** (`src/app/index.tsx`, outside the `(tabs)` group): `OverlayVideo`
  (`modules/auth/components/overlay-video.tsx`, `expo-video`, muted+looping background video from
  `assets/videos/landing.mp4`) behind a single "Log in" button — no "Create account" button, since
  there's no register flow anywhere in this app.

## Not wired yet (Sprint 3)

`expo-camera` is installed but `modules/attendance/components/scanner-screen.tsx` has no scanning
logic — placeholder UI only, reachable via the Home tab's "Scan QR" button → `src/app/scanner.tsx`.

## Testing

Do not write Chromium/Playwright/browser-automation tests for this app. If asked to verify a
change, run/build the app (`pnpm --filter mobile start`) and check behavior directly.
