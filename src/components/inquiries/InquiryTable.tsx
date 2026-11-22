import { Link } from 'react-router';
import type { Inquiry } from '../../types';
import { formatDateTime } from '../../utils/format';
import { StatusBadge, VisibilityBadge } from './Badges';

interface InquiryTableProps {
  inquiries: Inquiry[];
  currentUserId: number | undefined;
  /** Hide less important columns (used on the dashboard). */
  compact?: boolean;
}

export default function InquiryTable({ inquiries, currentUserId, compact = false }: InquiryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Subject</th>
            <th scope="col" className="px-4 py-3">Customer</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Visibility</th>
            {!compact && <th scope="col" className="px-4 py-3">Created by</th>}
            <th scope="col" className="px-4 py-3">Created</th>
            {!compact && <th scope="col" className="px-4 py-3">Last updated</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="hover:bg-slate-50">
              <td className="max-w-xs px-4 py-3">
                <Link
                  to={`/inquiries/${inquiry.id}`}
                  className="block truncate font-medium text-indigo-700 hover:underline"
                  title={inquiry.subject}
                >
                  {inquiry.subject}
                </Link>
              </td>
              <td className="max-w-[12rem] truncate px-4 py-3 text-slate-700" title={inquiry.customer_name}>
                {inquiry.customer_name}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={inquiry.status} />
              </td>
              <td className="px-4 py-3">
                <VisibilityBadge visibility={inquiry.visibility} />
              </td>
              {!compact && (
                <td className="px-4 py-3 text-slate-600">
                  {inquiry.created_by === currentUserId ? 'You' : 'Colleague'}
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(inquiry.created_at)}</td>
              {!compact && (
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(inquiry.updated_at)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
