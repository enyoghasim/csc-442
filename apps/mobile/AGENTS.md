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
    _layout.tsx              Root layout: font loading + splash screen, QueryClientProvider,
                              Stack delegating to (auth) and (app)
    (auth)/                  Unauthenticated route group, mirrors the reference app's (auth) group
      _layout.tsx             Stack, redirects to /(app)/(tabs) if useCurrentUserQuery has a user
      login.tsx                Login screen — real, wired to the backend (see "Auth module" below)
    (app)/                   Authenticated route group, mirrors the reference app's (app) group
      _layout.tsx             Stack, redirects to /(auth)/login if useCurrentUserQuery has no user
      (tabs)/                 Bottom-tab screens: index (Home), attendance (My Attendance), settings
      scanner.tsx              Non-tab route (modal), reachable from Home's "Scan QR" button
  modules/                  All business/domain logic. Route files import FROM here — never the reverse.
    <domain>/                auth, attendance, classes, shared
      components/           Domain-specific UI components (not routes)
      services/               API layer: <domain>.endpoints.ts, <domain>.query.ts,
                               <domain>.mutation.ts (see "Auth module" below for the pattern)
      store/                  Zustand stores
      validations/            Zod schemas + inferred types (`export type XValues = z.infer<...>`)
      types.ts                Flat file for the domain's shared TS types (NOT a types/ folder,
                               except shared/)
    shared/components/       button.tsx, themed-text.tsx, input.tsx, error-message.tsx — the
                              design-system primitives, see "Styling" below
    auth/                    services/{auth.endpoints,auth.mutation,auth.query}.ts,
                              validations/auth.ts, components/{overlay-video,login-screen}.tsx
  global.css                 Tailwind entrypoint
```

`modules/shared/` is the one exception with extra structure (`lib/api.ts`, `lib/env.ts`,
`lib/util.ts` — `cn()` plus `ApiError`/`handleApiError`/`validateApiResponse`, see "Auth module"
below, `types/api.ts`, `services/query-client.ts`, `services/query-keys.ts`) since it's imported
by every other module. A new domain gets its own `modules/<domain>/` following this same shape.

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

- `modules/shared/lib/api.ts` is the single axios instance, base URL from `EXPO_PUBLIC_API_URL`,
  created with `withCredentials: true` — that's the whole auth story client-side. The backend sets
  an httpOnly `connect.sid` session cookie on login; axios stores and resends it automatically on
  every later request, same as dashboard's browser cookie jar. No session id is ever read from the
  response body or stored in app code (no `expo-secure-store`, no `Authorization` header to
  manage). **No JWT, ever** — same hard rule as the backend.
- `modules/shared/types/api.ts`'s `ApiResponse<T>` matches **our own backend's** actual envelope
  (`{ success, data?, message? }`) — NOT the reference project's shape (it has an `errors:
ApiFieldError[]` array ours doesn't). If you're ever tempted to copy an API-layer snippet from
  the reference verbatim, check it against `apps/backend/src/common/utils/response-factory.ts`
  and `http-exception.filter.ts` first.
- `modules/shared/lib/util.ts`'s `handleApiError()` unwraps our backend's error shape
  specifically: `{ success: false, error: { statusCode, message } }`, where `message` can be a
  plain string (`UnauthorizedException('Invalid credentials')`) **or** a nested Nest exception
  object (`{ statusCode, message, error }`, from class-validator `ValidationPipe` failures) — it
  handles both. Every mutation wraps its body in `try { ... } catch (error) { throw
handleApiError(error) }`; every response is unwrapped via `validateApiResponse<T>()` before use
  — never read `response.data.data` directly.

## Auth module — the reference pattern for every future domain

`modules/auth/` is the first fully-wired domain and the template for `classes`/`attendance` once
those land. Copy this shape, don't reinvent it per domain:

- **`validations/auth.ts`** — `loginSchema` (zod) + `export type LoginValues =
z.infer<typeof loginSchema>`. One `identifier` field, wire-compatible with the backend's generic
  `{ identifier, password }` body — but mobile is student-only, so the app only ever sends a
  regNumber through it (`login-screen.tsx`'s field is labeled "Matric no.", not "email"). Lecturer
  email login is dashboard-only. There's no register/forgot-password schema because those flows
  don't exist here.
- **`services/auth.endpoints.ts`** — a flat `AUTH_ENDPOINTS = { login: '/api/auth/login', ... }
as const` object. Note the `/api` prefix — matches the backend's global prefix
  (`app.setGlobalPrefix('api')` in `main.ts`), don't drop it.
- **`services/auth.mutation.ts`** — `useLoginMutation`/`useLogoutMutation`, each: call `api.*`,
  `validateApiResponse`, update the `userKeys.detail('me')` cache directly
  (`queryClient.setQueryData` on login) or invalidate it (`buildMutationOptions(userKeys.all, ...)`
  on logout), then `router.replace(...)`. Catches wrap everything in `handleApiError`. Neither
  mutation touches a session id — the cookie is the backend's job, not app code's (see "API layer
  conventions").
- **`services/auth.query.ts`** — `useCurrentUserQuery`, keyed `userKeys.detail('me')`, just calls
  `GET /api/auth/me` and returns `null` (not an error) if it fails — this is what
  `(auth)/_layout.tsx`, `(app)/_layout.tsx`, and `src/app/index.tsx` all key their redirects off.
- **`components/login-screen.tsx`** — `react-hook-form` + `@hookform/resolvers/zod` +
  `Controller`-wrapped `Input`s, `ErrorMessage` for mutation errors, ported from the reference
  screen **1:1** minus the parts that don't apply here (no forgot-password link, no "Sign Up"
  footer — no such screens/flow exist).

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
  `danger`) × sizes (`sm`/`md`/`lg`), loading state via `modules/shared/components/spinner.tsx`'s
  `Spinner` (a `Loading03Icon` rotated with `reanimated`'s `useSharedValue`/`withRepeat`/
  `withTiming`), ported 1:1 from the reference — not RN's `ActivityIndicator`. `spinnerColors`
  maps each variant to the `Spinner`'s `color` prop. Prefer `Button` over a raw `TouchableOpacity`.
- **Tab bar** (`src/app/(app)/(tabs)/_layout.tsx`) — ported from the reference **exactly**, not the
  plain `Tabs` from `expo-router`: `Tabs`/`TabSlot`/`TabList`/`TabTrigger` from `expo-router/ui`,
  a custom `TabButton` that scales up 1.05x on focus via `react-native-reanimated`
  (`useDerivedValue`/`useAnimatedStyle`/`withTiming`) and fires `expo-haptics` light impact on
  press, icons via `@hugeicons/react-native` + `@hugeicons/core-free-icons` (`Home01Icon`,
  `Calendar01Icon`, `Settings01Icon` — exact icon names, check `@hugeicons/core-free-icons`'s
  `dist/types/index.d.ts` before guessing a new one). Requires
  `react-native-reanimated/plugin` last in `babel.config.js`'s `plugins` array, and the whole app
  wrapped in `GestureHandlerRootView` (`src/app/_layout.tsx`) — both copied from the reference too.
  Don't quietly swap this back to the default `Tabs` component to "simplify" it.
- **`cn()`** in `modules/shared/lib/util.ts` (`clsx` + `tailwind-merge`) merges classes for any
  component accepting a `className` prop.
- **Brand color tokens** in `tailwind.config.js`: `accent.hover` (#3b82f6, blue), `danger.hover`
  (#ef4444, red) — the same values the dashboard app's CSS variables use, so pick colors from here
  rather than inventing new ones.
- **Logo**: `assets/logo-mark.png` and `assets/splash-icon.png` (transparent) — the reference
  app's own ring+arc mark (a "head" ring over a "shoulders" arc, i.e. a simple user glyph) with its
  two side crescents dropped, rendered **flat white, no gradient** (source: repo-root
  `brand/monochrome.svg`) — the glossy chrome/glass material reads badly at the small/inline sizes
  these are used at. Used on the landing screen (`src/app/index.tsx`) and the boot splash
  (`app.json`'s `expo-splash-screen` plugin config). The gradient version (`brand/logo-mark.svg`)
  is reserved for OS-level app icons and the dashboard's inline `components/logo.tsx` — don't pull
  it into mobile's own UI. See `brand/README.md` for the regeneration commands and the full
  gradient-vs-flat split across every generated asset.
- **`assets/expo.icon/`** — Apple's Icon Composer bundle format (`icon.json` + `Assets/*.svg`),
  wired via `app.json`'s `ios.icon`, mirrors the reference app's setup exactly. The SVG inside is
  a **flat white** silhouette of the same ring+arc mark (no gradient/shadow baked in) — iOS itself
  applies the glass/shadow/translucency effect from `icon.json`'s config at build time on
  supported OS versions. Don't add gradients to that SVG; it'll fight the OS-applied ones. This
  can't be visually verified without an actual Xcode/EAS build — Metro bundling doesn't touch app
  icons at all.
- **Landing screen** (`src/app/index.tsx`, outside both route groups): `OverlayVideo`
  (`modules/auth/components/overlay-video.tsx`, `expo-video`, muted+looping background video from
  `assets/videos/landing.mp4`) behind a single "Log in" button — no "Create account" button, since
  there's no register flow anywhere in this app.

## Route groups (mirrors the reference app)

- **`(auth)`** — unauthenticated screens (currently just `login`). Redirects to `/(app)/(tabs)` if
  `useCurrentUserQuery` already has a user.
- **`(app)`** — authenticated screens (`(tabs)` + `scanner`). Redirects to `/(auth)/login` if
  `useCurrentUserQuery` has no user. Both gates return `null` while the query is loading (no
  flash-of-wrong-screen) rather than rendering either branch early.
- Absolute route pushes must include the full group path — `router.push('/(auth)/login')`,
  `router.push('/(app)/scanner')` — not the old flat `/login`/`/scanner`.

## Not wired yet (Sprint 3)

`expo-camera` is installed but `modules/attendance/components/scanner-screen.tsx` has no scanning
logic — placeholder UI only, reachable via the Home tab's "Scan QR" button → `src/app/(app)/scanner.tsx`.

## Testing

Do not write Chromium/Playwright/browser-automation tests for this app. If asked to verify a
change, run/build the app (`pnpm --filter mobile start`) and check behavior directly.
