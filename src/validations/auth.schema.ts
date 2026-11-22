import { z } from 'zod';

// Mirrors the backend login rules (Backend/src/validators/auth.validator.ts).
// Frontend validation is only for user guidance; the backend validates again.
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email('Enter a valid email address').max(150, 'Email must be at most 150 characters')),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(72, 'Password must be at most 72 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
