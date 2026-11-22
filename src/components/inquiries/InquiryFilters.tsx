import { useEffect, useRef, useState } from 'react';
import type { InquiryFilters as Filters } from '../../hooks/useInquiryFilters';
import { INQUIRY_STATUSES, INQUIRY_VISIBILITIES } from '../../types';

interface InquiryFiltersProps {
  filters: Filters;
  onChange: (changes: Partial<Filters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const SELECT_CLASSES =
  'rounded-lg border-0 py-2 pl-3 pr-8 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none';

export default function InquiryFilters({ filters, onChange, onClear, hasActiveFilters }: InquiryFiltersProps) {
  // Local text so typing feels instant; the URL (and API call) only updates once
  // the user has paused typing for 400 ms (debounce), not on every keystroke.
  const [searchText, setSearchText] = useState(filters.search);
  const timer = useRef<number | undefined>(undefined);
  const lastPushed = useRef(filters.search);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      lastPushed.current = value;
      onChange({ search: value });
    }, 400);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // If the URL's search changes for another reason ("Clear filters", back button),
  // show that value in the box. Our own debounced updates are ignored here.
  useEffect(() => {
    if (filters.search !== lastPushed.current) {
      lastPushed.current = filters.search;
      window.clearTimeout(timer.current);
      setSearchText(filters.search);
    }
  }, [filters.search]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[16rem] flex-1">
        <label htmlFor="inquiry-search" className="mb-1 block text-xs font-medium text-slate-600">
          Search
        </label>
        <input
          id="inquiry-search"
          type="search"
          value={searchText}
          maxLength={100}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Customer name or subject"
          className="block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="inquiry-status" className="mb-1 block text-xs font-medium text-slate-600">
          Status
        </label>
        <select
          id="inquiry-status"
          value={filters.status ?? ''}
          onChange={(e) => onChange({ status: (e.target.value || undefined) as Filters['status'] })}
          className={SELECT_CLASSES}
        >
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="inquiry-visibility" className="mb-1 block text-xs font-medium text-slate-600">
          Visibility
        </label>
        <select
          id="inquiry-visibility"
          value={filters.visibility ?? ''}
          onChange={(e) => onChange({ visibility: (e.target.value || undefined) as Filters['visibility'] })}
          className={SELECT_CLASSES}
        >
          <option value="">All</option>
          {INQUIRY_VISIBILITIES.map((v) => (
            <option key={v} value={v}>
              {v === 'Private' ? 'Private (mine)' : v}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="py-2 text-sm font-medium text-indigo-700 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
