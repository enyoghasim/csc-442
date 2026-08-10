/** Swagger example of `toPublicUser()`'s shape — shared by every auth endpoint that returns a user. */
export const PUBLIC_USER_EXAMPLE = {
  id: '3d3f0b8e-2b7a-4a3a-9b1a-8e6f7c2d1a90',
  role: 'student',
  name: 'Jane Doe',
  email: null,
  regNumber: '2019/1/12345CS',
  createdAt: '2026-07-22T10:00:00.000Z',
  updatedAt: '2026-07-22T10:00:00.000Z',
};

/** Swagger example of a `classes` row — shared by every classes endpoint. */
export const CLASS_EXAMPLE = {
  id: '7c1e3a2d-9f4b-4c8a-8d1e-2b6f5a9c0e17',
  name: 'Software Engineering',
  code: 'CSC 422',
  lecturerId: '3d3f0b8e-2b7a-4a3a-9b1a-8e6f7c2d1a90',
  createdAt: '2026-07-22T10:00:00.000Z',
  updatedAt: '2026-07-22T10:00:00.000Z',
};
