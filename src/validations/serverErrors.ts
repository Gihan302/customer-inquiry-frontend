import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError, getErrorMessage } from '../services/api';

/**
 * Shows backend validation errors ({ field, message }[]) next to the matching
 * form fields. Errors for fields the form does not have, and non-validation
 * errors, are returned as a single message for a form-level alert.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  formFields: readonly Path<T>[],
): string | null {
  if (!(error instanceof ApiError)) return getErrorMessage(error);

  const unmatched: string[] = [];
  for (const detail of error.errors) {
    if ((formFields as readonly string[]).includes(detail.field)) {
      setError(detail.field as Path<T>, { type: 'server', message: detail.message });
    } else {
      unmatched.push(detail.message);
    }
  }

  if (error.errors.length > 0 && unmatched.length === 0) return null;
  return unmatched.length > 0 ? `${error.message}: ${unmatched.join('; ')}` : error.message;
}
