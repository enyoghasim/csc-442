# Build from the monorepo root: docker build -f apps/backend/Dockerfile .
# (Dokploy: set this as the Dockerfile path, leave the build context/path at the repo root —
# needed so pnpm can see the workspace lockfile and packages/shared.)

FROM node:24-bookworm-slim AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune backend --docker

FROM base AS installer
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=backend

FROM base AS runner
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --create-home --uid 1001 --gid nodejs backend
COPY --from=installer /app .
RUN chown -R backend:nodejs /app
USER backend

ENV NODE_ENV=production
EXPOSE 3001
WORKDIR /app/apps/backend
# drizzle-kit migrate is idempotent (tracks applied migrations), safe to run on every boot —
# keeps a single-instance deploy self-migrating without a separate release step.
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit migrate && node dist/src/main.js"]
