// Seeded accounts from src/database/seed/seed.ts — same shared password for every account
// (see that file's comment), real rows in the dev DB these e2e tests run against.
export const SEEDED_LECTURER = {
  identifier: 'lecturer@csc422.local',
  password: 'p@ssword',
};

export const SEEDED_STUDENT = {
  identifier: '2022514022', // Okafor Gift Chukwudi, src/database/seed/data/students.json
  password: 'p@ssword',
};

// A second seeded student, used where a test needs someone deliberately NOT enrolled in a class.
export const SEEDED_STUDENT_UNENROLLED = {
  identifier: '2022514074', // Agbo-Anike Chibundo
  password: 'p@ssword',
};
