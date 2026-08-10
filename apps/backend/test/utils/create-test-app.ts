import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { sessionMiddleware } from '../../src/config/session';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

// Mirrors src/main.ts's bootstrap() wiring exactly (minus connectRedis()/listen(), which the
// Nest testing module doesn't need) — e2e tests exercise the real session cookie, validation,
// and error-envelope behavior, not a stripped-down test double of it.
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.setGlobalPrefix('api');
  app.use(sessionMiddleware);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  return app;
}

// Pulls the `connect.sid` cookie out of a Set-Cookie response header for reuse on later
// requests — supertest doesn't persist cookies across calls the way a browser would.
export function extractSessionCookie(
  setCookieHeader: string[] | undefined,
): string {
  const cookie = setCookieHeader?.find((c) => c.startsWith('connect.sid='));
  if (!cookie) throw new Error('No connect.sid cookie in response');
  return cookie.split(';')[0];
}
