import type { InquiryStatus, InquiryVisibility } from '../../types';

const STATUS_STYLES: Record<InquiryStatus, string> = {
  New: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'In Progress': 'bg-amber-50 text-amber-800 ring-amber-600/20',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

const BASE = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={`${BASE} ${STATUS_STYLES[status]}`}>{status}</span>;
}

export function VisibilityBadge({ visibility }: { visibility: InquiryVisibility }) {
  if (visibility === 'Public') {
    return <span className={`${BASE} bg-slate-50 text-slate-600 ring-slate-500/20`}>Public</span>;
  }
  return (
    <span
      className={`${BASE} bg-violet-50 text-violet-700 ring-violet-600/20`}
      title="Only you can see this inquiry"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
          clipRule="evenodd"
        />
      </svg>
      Private
    </span>
  );
}
