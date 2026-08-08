import path from 'node:path';

// eslint only exists per-app (no root eslint config) — route staged files to the local eslint
// of whichever app/package they belong to, grouped so each only runs once per commit.
const PACKAGES = {
  'apps/backend': 'backend',
  'apps/mobile': 'mobile',
  'apps/dashboard': 'dashboard',
};

function eslintCommands(files) {
  const groups = new Map();

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const pkgDir = Object.keys(PACKAGES).find((dir) => rel.startsWith(`${dir}/`));
    if (!pkgDir) continue; // packages/shared has no eslint config — prettier-only below
    const relInPkg = path.relative(pkgDir, rel);
    const list = groups.get(pkgDir) ?? [];
    list.push(relInPkg);
    groups.set(pkgDir, list);
  }

  return Array.from(groups.entries()).map(
    ([pkgDir, relFiles]) => `pnpm --filter ${PACKAGES[pkgDir]} exec eslint --fix ${relFiles.map((f) => `"${f}"`).join(' ')}`,
  );
}

export default {
  '**/*.{js,jsx,ts,tsx}': (files) => eslintCommands(files),
  '**/*.{json,md,yml,yaml}': (files) => `prettier --write ${files.map((f) => `"${f}"`).join(' ')}`,
};
