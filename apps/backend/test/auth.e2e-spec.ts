import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, extractSessionCookie } from './utils/create-test-app';
import { SEEDED_LECTURER } from './utils/fixtures';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: SEEDED_LECTURER.identifier,
        password: 'wrong-password',
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({
          success: false,
          error: { statusCode: 401, message: 'Invalid credentials' },
        });
      });
  });

  it('rejects GET /api/auth/me with no session', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401)
      .expect((res) => {
        expect(res.body.error.message).toBe('Not authenticated');
      });
  });

  it('logs in, reads the session via /me, then logout invalidates it', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(SEEDED_LECTURER)
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.user).toMatchObject({
      role: 'lecturer',
      email: SEEDED_LECTURER.identifier,
    });
    // The session id is never in the response body — only in Set-Cookie.
    expect(JSON.stringify(loginResponse.body)).not.toContain('passwordHash');

    const cookie = extractSessionCookie(
      loginResponse.headers['set-cookie'] as unknown as string[],
    );

    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(meResponse.body.data.email).toBe(SEEDED_LECTURER.identifier);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(200);

    // Same cookie, now destroyed server-side — must be rejected.
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(401);
  });
});
