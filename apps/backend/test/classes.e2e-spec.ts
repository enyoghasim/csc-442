import type { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, extractSessionCookie } from './utils/create-test-app';
import { SEEDED_LECTURER, SEEDED_STUDENT } from './utils/fixtures';
import { DatabaseService } from '../src/database/database.service';
import { classes, enrollments } from '../src/database/schema';

describe('Classes (e2e)', () => {
  let app: INestApplication<App>;
  let db: DatabaseService;
  let lecturerCookie: string;
  let studentCookie: string;

  // Timestamp suffix keeps this idempotent across repeated runs even if a previous run's
  // afterAll cleanup never ran (e.g. a crashed test process).
  const classCode = `E2E-CLASSES-${Date.now()}`;
  let classId: string;

  beforeAll(async () => {
    app = await createTestApp();
    db = app.get(DatabaseService);

    const lecturerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(SEEDED_LECTURER)
      .expect(200);
    lecturerCookie = extractSessionCookie(
      lecturerLogin.headers['set-cookie'] as unknown as string[],
    );

    const studentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(SEEDED_STUDENT)
      .expect(200);
    studentCookie = extractSessionCookie(
      studentLogin.headers['set-cookie'] as unknown as string[],
    );
  });

  afterAll(async () => {
    // FK order: enrollments reference classes, so they go first.
    if (classId)
      await db.db.delete(enrollments).where(eq(enrollments.classId, classId));
    await db.db.delete(classes).where(eq(classes.code, classCode));
    await app.close();
  });

  it('rejects class creation from a student (role guard)', async () => {
    await request(app.getHttpServer())
      .post('/api/classes')
      .set('Cookie', studentCookie)
      .send({ name: 'Should Not Exist', code: `${classCode}-STUDENT` })
      .expect(403)
      .expect((res) => {
        expect(res.body.error.message).toBe('Insufficient role for this route');
      });
  });

  it('lecturer creates a class, duplicate code is rejected with 409', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/classes')
      .set('Cookie', lecturerCookie)
      .send({ name: 'E2E Classes Test', code: classCode })
      .expect(200);

    classId = created.body.data.id;
    expect(created.body.data.code).toBe(classCode);

    await request(app.getHttpServer())
      .post('/api/classes')
      .set('Cookie', lecturerCookie)
      .send({ name: 'Duplicate', code: classCode })
      .expect(409);
  });

  it("student doesn't see the class until enrolled, then does", async () => {
    const before = await request(app.getHttpServer())
      .get('/api/classes')
      .set('Cookie', studentCookie)
      .expect(200);
    expect(
      before.body.data.find((c: { id: string }) => c.id === classId),
    ).toBeUndefined();

    await request(app.getHttpServer())
      .post(`/api/classes/${classId}/enrollments`)
      .set('Cookie', lecturerCookie)
      .send({ regNumber: SEEDED_STUDENT.identifier })
      .expect(200);

    const after = await request(app.getHttpServer())
      .get('/api/classes')
      .set('Cookie', studentCookie)
      .expect(200);
    expect(
      after.body.data.find((c: { id: string }) => c.id === classId),
    ).toBeDefined();

    // Already enrolled — second attempt is a conflict, not a silent success.
    await request(app.getHttpServer())
      .post(`/api/classes/${classId}/enrollments`)
      .set('Cookie', lecturerCookie)
      .send({ regNumber: SEEDED_STUDENT.identifier })
      .expect(409);
  });
});
