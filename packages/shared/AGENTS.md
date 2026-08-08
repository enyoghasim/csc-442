# @attendance/shared — Agent Guide

Plain TypeScript, no build step, no runtime logic — types and DTOs only.

## What belongs here

- Enums shared across apps (`UserRole`, `AttendanceStatus`)
- DTO/response-shape interfaces consumed by more than one app (`AuthResponse`, `SessionDTO`, `AttendanceRecordDTO`, `ClassDTO`)

## What does NOT belong here

- Any runtime logic (no functions, no classes with behavior, no framework code)
- Anything used by only one app — keep that local to the app instead

## Consuming this package

All three apps depend on it via `"@attendance/shared": "workspace:*"` and import from `@attendance/shared` (single barrel export at `src/index.ts`, no subpath exports). Since it ships raw `.ts` with no build step, both Next.js apps set `transpilePackages: ['@attendance/shared']` in `next.config.ts`, and the mobile app's `metro.config.js` is configured with monorepo `watchFolders`/`nodeModulesPaths` so Metro can resolve it.

Adding a field is just an edit + re-import — there's no build/publish step to run.
