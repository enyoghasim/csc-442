import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '../../.env') });
config();

import { readFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from '../schema';

const DEFAULT_PASSWORD = 'p@ssword';

type StudentSeed = { name: string; regNumber: string };

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const students = JSON.parse(
    readFileSync(join(__dirname, 'data/students.json'), 'utf-8'),
  ) as StudentSeed[];

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const lecturerRows = [
    {
      role: 'lecturer' as const,
      name: 'Course Lecturer',
      email: 'lecturer@csc422.local',
      regNumber: null,
      passwordHash,
    },
  ];

  const studentRows = students.map((s) => ({
    role: 'student' as const,
    name: s.name,
    email: null,
    regNumber: s.regNumber,
    passwordHash,
  }));

  const lecturersInserted = await db
    .insert(users)
    .values(lecturerRows)
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  const studentsInserted = await db
    .insert(users)
    .values(studentRows)
    .onConflictDoNothing({ target: users.regNumber })
    .returning({ id: users.id });

  console.log(
    `Seeded ${lecturersInserted.length} lecturer(s), ${studentsInserted.length} student(s) (${students.length - studentsInserted.length} already existed).`,
  );
  console.log(`Default password for every seeded account: ${DEFAULT_PASSWORD}`);
  console.log(`Lecturer login: lecturer@csc422.local`);

  await client.end();
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
