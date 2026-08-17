import { config } from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

// Monorepo root .env is two levels up from apps/backend (pnpm/turbo run scripts with cwd = apps/backend)
config({ path: resolve(process.cwd(), '../../.env') });
config(); // fallback: a local apps/backend/.env, if present, wins for values not already set

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SESSION_TTL_SECONDS: z.coerce.number().default(604800),
  SESSION_SECRET: z.string().default('dev-secret-change-me'),
  BACKEND_PORT: z.coerce.number().default(3001),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
  );
}

// Every other file in this app reads config through this object — never process.env directly.
export const env = parsed.data;
