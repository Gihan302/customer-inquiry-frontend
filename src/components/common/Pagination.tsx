import type { Pagination as PaginationData } from '../../types';
import Button from './Button';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({ pagination, onPageChange, disabled = false }: PaginationProps) {
  const { page, limit, total, total_pages } = pagination;
  if (total === 0) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-slate-600">
          Page {page} of {Math.max(total_pages, 1)}
        </span>
        <Button
          variant="secondary"
          disabled={disabled || page >= total_pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
