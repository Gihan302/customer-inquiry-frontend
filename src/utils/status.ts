import type { InquiryStatus } from '../types';

/**
 * Status changes the backend allows (Backend/src/services/inquiry.service.ts):
 *   New -> In Progress -> Resolved, and Resolved -> In Progress (reopen).
 * The UI only offers these; the backend still enforces them independently.
 */
export const NEXT_STATUSES: Record<InquiryStatus, readonly InquiryStatus[]> = {
  New: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: ['In Progress'],
};

/** Button text for each possible change. */
export function transitionLabel(from: InquiryStatus, to: InquiryStatus): string {
  if (from === 'Resolved' && to === 'In Progress') return 'Reopen';
  if (to === 'In Progress') return 'Start progress';
  if (to === 'Resolved') return 'Mark as resolved';
  return `Move to ${to}`;
}
