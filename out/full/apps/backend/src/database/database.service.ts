import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as schema from './schema';
import type { DbExecutor } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client = postgres(env.DATABASE_URL);

  readonly db: DbExecutor = drizzle(this.client, { schema });

  async onModuleDestroy(): Promise<void> {
    await this.client.end();
  }
}
