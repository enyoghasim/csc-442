# Build from the monorepo root: docker build -f apps/dashboard/Dockerfile .
# (Dokploy: set this as the Dockerfile path, leave the build context/path at the repo root —
# needed so pnpm can see the workspace lockfile and packages/shared.)

FROM node:24-bookworm-slim AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune dashboard --docker

FROM base AS installer
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they must be passed
# as build args (Dokploy: set as a "Build Arg" on the app, not just a runtime env var).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm turbo run build --filter=dashboard

FROM base AS runner
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs dashboard
COPY --from=installer /app/apps/dashboard/.next/standalone ./
COPY --from=installer /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
USER dashboard

ENV NODE_ENV=production
EXPOSE 7890
CMD ["node", "apps/dashboard/server.js"]
