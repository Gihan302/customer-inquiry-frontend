import type { InquiryStatus } from '../../types';
import { NEXT_STATUSES, transitionLabel } from '../../utils/status';
import Button from '../common/Button';
import { StatusBadge } from './Badges';

interface StatusActionsProps {
  status: InquiryStatus;
  /** The status currently being saved, if any (disables all buttons, spinner on that one). */
  pendingStatus: InquiryStatus | null;
  disabled?: boolean;
  onChange: (next: InquiryStatus) => void;
}

/** Shows the current status and ONLY the changes the workflow allows from it. */
export default function StatusActions({ status, pendingStatus, disabled = false, onChange }: StatusActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Current status:</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex flex-wrap gap-2">
        {NEXT_STATUSES[status].map((next) => (
          <Button
            key={next}
            variant={next === 'Resolved' ? 'primary' : 'secondary'}
            loading={pendingStatus === next}
            disabled={disabled || pendingStatus !== null}
            onClick={() => onChange(next)}
          >
            {transitionLabel(status, next)}
          </Button>
        ))}
      </div>
    </div>
  );
}
