import type { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, extractSessionCookie } from './utils/create-test-app';
import {
  SEEDED_LECTURER,
  SEEDED_STUDENT,
  SEEDED_STUDENT_UNENROLLED,
} from './utils/fixtures';
import { DatabaseService } from '../src/database/database.service';
import {
  attendanceRecords,
  classSessions,
  classes,
  enrollments,
} from '../src/database/schema';

describe('Attendance / QR check-in (e2e)', () => {
  let app: INestApplication<App>;
  let db: DatabaseService;
  let lecturerCookie: string;
  let studentCookie: string;
  let unenrolledCookie: string;

  const classCode = `E2E-ATTENDANCE-${Date.now()}`;
  let classId: string;
  let sessionId: string;

  beforeAll(async () => {
    app = await createTestApp();
    db = app.get(DatabaseService);

    const login = async (creds: { identifier: string; password: string }) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(creds)
        .expect(200);
      return extractSessionCookie(
        res.headers['set-cookie'] as unknown as string[],
      );
    };
    lecturerCookie = await login(SEEDED_LECTURER);
    studentCookie = await login(SEEDED_STUDENT);
    unenrolledCookie = await login(SEEDED_STUDENT_UNENROLLED);

    const classRes = await request(app.getHttpServer())
      .post('/api/classes')
      .set('Cookie', lecturerCookie)
      .send({ name: 'E2E Attendance Test', code: classCode })
      .expect(200);
    classId = classRes.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/classes/${classId}/enrollments`)
      .set('Cookie', lecturerCookie)
      .send({ regNumber: SEEDED_STUDENT.identifier })
      .expect(200);

    const now = new Date();
    const sessionRes = await request(app.getHttpServer())
      .post('/api/sessions')
      .set('Cookie', lecturerCookie)
      .send({
        classId,
        startsAt: now.toISOString(),
        endsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      })
      .expect(200);
    sessionId = sessionRes.body.data.id;
  });

  afterAll(async () => {
    // FK order: attendance_records -> class_sessions -> enrollments -> classes.
    if (sessionId)
      await db.db
        .delete(attendanceRecords)
        .where(eq(attendanceRecords.classSessionId, sessionId));
    if (sessionId)
      await db.db.delete(classSessions).where(eq(classSessions.id, sessionId));
    if (classId)
      await db.db.delete(enrollments).where(eq(enrollments.classId, classId));
    await db.db.delete(classes).where(eq(classes.code, classCode));
    await app.close();
  });

  it('rejects check-in with a bad token', async () => {
    await request(app.getHttpServer())
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({ classSessionId: sessionId, token: 'not-the-real-token' })
      .expect(400)
      .expect((res) => {
        expect(res.body.error.message).toBe('Invalid or expired QR code');
      });
  });

  it('rejects check-in from a student not enrolled in the class', async () => {
    const tokenRes = await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}/qr-token`)
      .set('Cookie', lecturerCookie)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/attendance/check-in')
      .set('Cookie', unenrolledCookie)
      .send({ classSessionId: sessionId, token: tokenRes.body.data.token })
      .expect(403)
      .expect((res) => {
        expect(res.body.error.message).toBe(
          'You are not enrolled in this class',
        );
      });
  });

  it('full flow: issue token, check in, duplicate check-in rejected, roster + history reflect it', async () => {
    const tokenRes = await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}/qr-token`)
      .set('Cookie', lecturerCookie)
      .expect(200);
    const token = tokenRes.body.data.token;
    expect(tokenRes.body.data.classSessionId).toBe(sessionId);

    await request(app.getHttpServer())
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({ classSessionId: sessionId, token })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/attendance/check-in')
      .set('Cookie', studentCookie)
      .send({ classSessionId: sessionId, token })
      .expect(409)
      .expect((res) => {
        expect(res.body.error.message).toBe(
          'Already checked in for this session',
        );
      });

    const roster = await request(app.getHttpServer())
      .get(`/api/attendance/sessions/${sessionId}`)
      .set('Cookie', lecturerCookie)
      .expect(200);
    expect(roster.body.data).toContainEqual(
      expect.objectContaining({
        regNumber: SEEDED_STUDENT.identifier,
        status: 'present',
      }),
    );

    const summary = await request(app.getHttpServer())
      .get(`/api/attendance/classes/${classId}/summary`)
      .set('Cookie', lecturerCookie)
      .expect(200);
    expect(summary.body.data).toContainEqual(
      expect.objectContaining({
        regNumber: SEEDED_STUDENT.identifier,
        sessionsPresent: 1,
        totalSessions: 1,
        percentage: 100,
      }),
    );

    const history = await request(app.getHttpServer())
      .get('/api/attendance/me')
      .set('Cookie', studentCookie)
      .expect(200);
    expect(history.body.data).toContainEqual(
      expect.objectContaining({ classSessionId: sessionId, status: 'present' }),
    );

    const csv = await request(app.getHttpServer())
      .get(`/api/attendance/classes/${classId}/summary/export`)
      .set('Cookie', lecturerCookie)
      .expect(200);
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain(SEEDED_STUDENT.identifier);
  });

  it('rejects everything above from a student role via the lecturer-only routes', async () => {
    await request(app.getHttpServer())
      .get(`/api/attendance/sessions/${sessionId}`)
      .set('Cookie', studentCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/attendance/classes/${classId}/summary`)
      .set('Cookie', studentCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}/qr-token`)
      .set('Cookie', studentCookie)
      .expect(403);
  });
});
