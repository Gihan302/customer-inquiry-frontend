import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { InquiryListParams } from '../services/inquiry.service';
import { INQUIRY_STATUSES, INQUIRY_VISIBILITIES, type InquiryStatus, type InquiryVisibility } from '../types';

export const PAGE_SIZE = 10;

export interface InquiryFilters {
  page: number;
  status?: InquiryStatus;
  visibility?: InquiryVisibility;
  search: string;
}

const isStatus = (v: string | null): v is InquiryStatus =>
  v !== null && (INQUIRY_STATUSES as readonly string[]).includes(v);
const isVisibility = (v: string | null): v is InquiryVisibility =>
  v !== null && (INQUIRY_VISIBILITIES as readonly string[]).includes(v);

/**
 * Inquiry list filters stored in the URL query string (?page=2&status=New&search=john).
 * Refreshing or sharing the URL keeps the same view. Invalid values in a
 * hand-edited URL fall back to defaults instead of causing API errors.
 */
export function useInquiryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<InquiryFilters>(() => {
    const page = Number(searchParams.get('page'));
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    return {
      page: Number.isInteger(page) && page >= 1 ? page : 1,
      status: isStatus(status) ? status : undefined,
      visibility: isVisibility(visibility) ? visibility : undefined,
      search: (searchParams.get('search') ?? '').slice(0, 100),
    };
  }, [searchParams]);

  /** Change one or more filters. Changing anything except the page goes back to page 1. */
  const updateFilters = useCallback(
    (changes: Partial<InquiryFilters>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '' || (key === 'page' && value === 1)) next.delete(key);
            else next.set(key, String(value));
          }
          if (!('page' in changes)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const apiParams: InquiryListParams = useMemo(
    () => ({
      page: filters.page,
      limit: PAGE_SIZE,
      status: filters.status,
      visibility: filters.visibility,
      search: filters.search.trim() || undefined,
    }),
    [filters],
  );

  const hasActiveFilters = Boolean(filters.status || filters.visibility || filters.search.trim());

  return { filters, apiParams, updateFilters, clearFilters, hasActiveFilters };
}
