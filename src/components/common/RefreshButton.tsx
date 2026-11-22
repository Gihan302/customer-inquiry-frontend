import { formatTime } from '../../utils/format';
import Button from './Button';

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastLoadedAt: Date | null;
}

/**
 * Manual refresh plus "last updated" time. Data shown in a tab can become
 * outdated when another tab or colleague changes it (no real-time updates by
 * design); this makes the age visible and lets the user reload on demand.
 */
export default function RefreshButton({ onRefresh, isRefreshing, lastLoadedAt }: RefreshButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {lastLoadedAt && (
        <span className="text-xs text-slate-500" aria-live="polite">
          Updated {formatTime(lastLoadedAt)}
        </span>
      )}
      <Button variant="secondary" onClick={onRefresh} loading={isRefreshing}>
        {!isRefreshing && (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
              clipRule="evenodd"
            />
          </svg>
        )}
        Refresh
      </Button>
    </div>
  );
}
