# Brand assets

Source SVGs for the "A" logo mark. Not a workspace package — just the source of truth these get generated from:

- `logo-mark.svg` — transparent-background mark, used to generate `apps/mobile/assets/logo-mark.png` and `apps/mobile/assets/splash-icon.png`, and re-implemented as inline SVG in `apps/dashboard/components/logo.tsx`.
- `icon.svg` — mark on a black square, generates `apps/mobile/assets/icon.png`, `apps/mobile/assets/favicon.png`, `apps/dashboard/app/icon.png`, `apps/dashboard/app/apple-icon.png`.
- `foreground.svg` / `background.svg` / `monochrome.svg` — Android adaptive-icon layers, generate the matching `apps/mobile/assets/android-icon-*.png` files.

To regenerate after editing a source SVG (requires `rsvg-convert`, e.g. `brew install librsvg`):

```bash
cd brand
MOBILE=../apps/mobile/assets
DASH=../apps/dashboard/app

rsvg-convert -w 1024 -h 1024 icon.svg -o "$MOBILE/icon.png"
rsvg-convert -w 512 -h 512 logo-mark.svg -o "$MOBILE/splash-icon.png"
rsvg-convert -w 512 -h 512 logo-mark.svg -o "$MOBILE/logo-mark.png"
rsvg-convert -w 1024 -h 1024 foreground.svg -o "$MOBILE/android-icon-foreground.png"
rsvg-convert -w 1024 -h 1024 background.svg -o "$MOBILE/android-icon-background.png"
rsvg-convert -w 1024 -h 1024 monochrome.svg -o "$MOBILE/android-icon-monochrome.png"
rsvg-convert -w 256 -h 256 icon.svg -o "$MOBILE/favicon.png"
rsvg-convert -w 1024 -h 1024 icon.svg -o "$DASH/icon.png"
rsvg-convert -w 1024 -h 1024 icon.svg -o "$DASH/apple-icon.png"
```

If you change the mark's path data, also update the inline SVG in `apps/dashboard/components/logo.tsx` to match.
