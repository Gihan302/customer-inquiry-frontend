import { z } from 'zod';
import { INQUIRY_VISIBILITIES } from '../types';

// Mirrors Backend/src/validators/inquiry.validator.ts so users get instant feedback.
// The backend validates again; this is guidance, not security.

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const isEmail = (value: string) => z.email().safeParse(value).success;
const isPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').length;
  return PHONE_PATTERN.test(value) && digits >= 7 && digits <= 15;
};

export const DESCRIPTION_MAX = 5000;

export const inquiryFormSchema = z.object({
  customer_name: requiredText('Customer name', 150),
  contact_info: requiredText('Contact info', 150).refine((v) => isEmail(v) || isPhone(v), {
    message: 'Enter a valid email address or phone number',
  }),
  subject: requiredText('Subject', 200),
  description: requiredText('Description', DESCRIPTION_MAX),
  visibility: z.enum(INQUIRY_VISIBILITIES),
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

export const INQUIRY_FORM_FIELDS = [
  'customer_name',
  'contact_info',
  'subject',
  'description',
  'visibility',
] as const satisfies readonly (keyof InquiryFormValues)[];
