import { z } from 'zod';

// Mirrors apps/backend's CreateClassRequest (dtos/classes.dto.ts) validation rules 1:1.
export const createClassSchema = z.object({
  name: z.string().min(1, 'Enter a class name'),
  code: z.string().min(1, 'Enter a class code'),
});

export type CreateClassValues = z.infer<typeof createClassSchema>;

export const enrollStudentSchema = z.object({
  regNumber: z.string().min(1, 'Enter a student regNumber'),
});

export type EnrollStudentValues = z.infer<typeof enrollStudentSchema>;
