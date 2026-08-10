export const CLASSES_ENDPOINTS = {
  list: '/api/classes',
  create: '/api/classes',
  update: (id: string) => `/api/classes/${id}`,
  enroll: (id: string) => `/api/classes/${id}/enrollments`,
} as const;
