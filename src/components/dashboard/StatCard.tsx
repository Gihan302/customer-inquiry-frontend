import { Link } from 'react-router';

interface StatCardProps {
  label: string;
  value: number | undefined;
  /** Clicking the card opens the inquiry list with this filter applied. */
  to: string;
  accent: string;
}

export default function StatCard({ label, value, to, accent }: StatCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value ?? '–'}</div>
      <div className="mt-1 text-xs text-indigo-600 opacity-0 transition group-hover:opacity-100">View list →</div>
    </Link>
  );
}
