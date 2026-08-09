# Brand assets

Source SVGs for the "A" logo mark. Not a workspace package — just the source of truth these get generated from:

- `logo-mark.svg` — transparent-background mark with the glossy chrome/glass gradient material.
  Reserved for OS-level app icons and the dashboard's inline logo — re-implemented as inline SVG
  in `apps/dashboard/components/logo.tsx`, and the source for `icon.svg`'s mark-on-black-square
  composition below. Not used anywhere inside the mobile app's own UI (see `monochrome.svg`).
- `icon.svg` — the gradient mark on a black square, generates `apps/mobile/assets/icon.png`,
  `apps/mobile/assets/favicon.png`, `apps/dashboard/app/icon.png`, `apps/dashboard/app/apple-icon.png`.
- `monochrome.svg` — flat, single-color (`#ffffff`) mark, no gradient/shadow. Originally just the
  Android adaptive-icon monochrome layer, now doing double duty as the source for every in-app
  (not OS-icon) use of the mark on the mobile side — `apps/mobile/assets/logo-mark.png` (inline on
  the landing screen) and `apps/mobile/assets/splash-icon.png` (boot splash) — since the gradient
  reads badly at small/inline sizes. Also generates `apps/mobile/assets/android-icon-monochrome.png`.
- `foreground.svg` / `background.svg` — the other two Android adaptive-icon layers, generate
  `apps/mobile/assets/android-icon-{foreground,background}.png`.

To regenerate after editing a source SVG (requires `rsvg-convert`, e.g. `brew install librsvg`):

```bash
cd brand
MOBILE=../apps/mobile/assets
DASH=../apps/dashboard/app

rsvg-convert -w 1024 -h 1024 icon.svg -o "$MOBILE/icon.png"
rsvg-convert -w 512 -h 512 monochrome.svg -o "$MOBILE/splash-icon.png"
rsvg-convert -w 512 -h 512 monochrome.svg -o "$MOBILE/logo-mark.png"
rsvg-convert -w 1024 -h 1024 foreground.svg -o "$MOBILE/android-icon-foreground.png"
rsvg-convert -w 1024 -h 1024 background.svg -o "$MOBILE/android-icon-background.png"
rsvg-convert -w 1024 -h 1024 monochrome.svg -o "$MOBILE/android-icon-monochrome.png"
rsvg-convert -w 256 -h 256 icon.svg -o "$MOBILE/favicon.png"
rsvg-convert -w 1024 -h 1024 icon.svg -o "$DASH/icon.png"
rsvg-convert -w 1024 -h 1024 icon.svg -o "$DASH/apple-icon.png"
```

If you change the mark's path data, update it in both `logo-mark.svg` and `monochrome.svg` (same
paths, different fill treatment), and update the inline SVG in `apps/dashboard/components/logo.tsx`
to match `logo-mark.svg`.
