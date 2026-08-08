import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './schema';

// The db handle, or a transaction handle passed through from a caller-coordinated transaction.
// Repository write methods accept an optional `executor: DbExecutor` so the same method works
// standalone or inside a transaction.
export type DbExecutor = PostgresJsDatabase<typeof schema>;
