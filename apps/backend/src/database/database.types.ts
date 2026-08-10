import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './schema';

// The db handle, or a transaction handle passed through from a caller-coordinated transaction.
// Repository write methods accept an optional `executor: DbExecutor` so the same method works
// standalone or inside a transaction.
export type DbExecutor = PostgresJsDatabase<typeof schema>;

// postgres.js throws a PostgresError with a `.code` matching the Postgres error code
// (https://www.postgresql.org/docs/current/errcodes-appendix.html) — services catch this to
// translate a unique-constraint violation into a 409 rather than letting it fall through to the
// global filter's generic 500.
const UNIQUE_VIOLATION = '23505';
export function isUniqueViolation(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === UNIQUE_VIOLATION
  );
}
