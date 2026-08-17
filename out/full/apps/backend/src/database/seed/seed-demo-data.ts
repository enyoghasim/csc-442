import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '../../.env') });
config();

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import {
  attendanceRecords,
  classes,
  classSessions,
  enrollments,
  users,
} from '../schema';

// Enriches whatever classes the seeded lecturer already has with a demo-able amount of history —
// past sessions plus attendance records with realistic, non-uniform per-student attendance — so
// the reports page (metrics, per-class summary, matrix export) has something worth looking at.
// Safe to re-run: tops up sessions/enrollments/records rather than duplicating them.
const SESSIONS_PER_CLASS = 8;
const SESSION_HOUR_UTC = 9;
const STUDENTS_PER_CLASS = 45;

// Deterministic per-class PRNG (seeded off the class id) so re-running the script regenerates the
// same roster/attendance pattern instead of drifting further each time.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const [lecturer] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'lecturer'))
    .limit(1);
  if (!lecturer) {
    throw new Error('No seeded lecturer found — run `pnpm db:seed` first.');
  }

  const lecturerClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.lecturerId, lecturer.id));
  if (lecturerClasses.length === 0) {
    throw new Error(
      'Lecturer has no classes yet — create at least one via the dashboard first.',
    );
  }

  const students = await db
    .select()
    .from(users)
    .where(eq(users.role, 'student'));
  const now = new Date();

  for (const klass of lecturerClasses) {
    const random = mulberry32(hashCode(klass.id));
    const roster = [...students]
      .sort(() => random() - 0.5)
      .slice(0, Math.min(STUDENTS_PER_CLASS, students.length));

    if (roster.length > 0) {
      await db
        .insert(enrollments)
        .values(
          roster.map((student) => ({
            studentId: student.id,
            classId: klass.id,
          })),
        )
        .onConflictDoNothing();
    }

    const existingSessions = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.classId, klass.id));

    const sessionsToCreate = Math.max(
      0,
      SESSIONS_PER_CLASS - existingSessions.length,
    );
    const newSessionRows = Array.from({ length: sessionsToCreate }, (_, i) => {
      const weeksAgo = sessionsToCreate - i;
      const startsAt = new Date(now);
      startsAt.setUTCDate(startsAt.getUTCDate() - weeksAgo * 7);
      startsAt.setUTCHours(SESSION_HOUR_UTC, 0, 0, 0);
      const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
      return { classId: klass.id, startsAt, endsAt };
    });

    const insertedSessions =
      newSessionRows.length > 0
        ? await db.insert(classSessions).values(newSessionRows).returning()
        : [];

    const heldSessions = [...existingSessions, ...insertedSessions].filter(
      (session) => session.endsAt < now,
    );

    const records: (typeof attendanceRecords.$inferInsert)[] = [];
    for (const student of roster) {
      // A per-student reliability score biases their attendance across the whole class, instead
      // of every session being an independent coin flip — gives the metrics/percentages real
      // spread (some consistently strong, some borderline, a few genuinely at-risk).
      const reliability = 0.55 + random() * 0.4; // 55%-95%
      for (const session of heldSessions) {
        const roll = random();
        if (roll > reliability) continue; // absent — synthesized automatically, no row needed
        const status: 'present' | 'late' =
          roll > reliability - 0.08 ? 'late' : 'present';
        records.push({
          classSessionId: session.id,
          studentId: student.id,
          status,
          checkedInAt: new Date(
            session.startsAt.getTime() + random() * 10 * 60 * 1000,
          ),
        });
      }
    }

    if (records.length > 0) {
      await db.insert(attendanceRecords).values(records).onConflictDoNothing();
    }

    console.log(
      `${klass.name} (${klass.code}): ${roster.length} enrolled, ${sessionsToCreate} new session(s), ${records.length} attendance record(s) seeded.`,
    );
  }

  await client.end();
}

main().catch((error: unknown) => {
  console.error('Demo data seed failed:', error);
  process.exit(1);
});
