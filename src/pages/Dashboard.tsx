import { Link } from 'react-router';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import RefreshButton from '../components/common/RefreshButton';
import { PageSpinner } from '../components/common/Spinner';
import StatCard from '../components/dashboard/StatCard';
import InquiryTable from '../components/inquiries/InquiryTable';
import { useApiData } from '../hooks/useApiData';
import { useAuth } from '../hooks/useAuth';
import { listInquiries } from '../services/inquiry.service';

/**
 * Loads the dashboard numbers from the normal list endpoint: asking for one row
 * with a filter and reading pagination.total gives the count. The counts
 * therefore follow exactly the same Public/Private rules as the list itself.
 */
async function loadDashboard() {
  const [recent, newCount, inProgressCount, resolvedCount, privateCount] = await Promise.all([
    listInquiries({ limit: 5 }),
    listInquiries({ limit: 1, status: 'New' }),
    listInquiries({ limit: 1, status: 'In Progress' }),
    listInquiries({ limit: 1, status: 'Resolved' }),
    listInquiries({ limit: 1, visibility: 'Private' }),
  ]);
  return {
    recent: recent.inquiries,
    total: recent.pagination.total,
    new: newCount.pagination.total,
    inProgress: inProgressCount.pagination.total,
    resolved: resolvedCount.pagination.total,
    myPrivate: privateCount.pagination.total,
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, isLoading, isFetching, lastLoadedAt, refetch } = useApiData('dashboard', loadDashboard);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome, {user?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of the inquiries you can access.</p>
        </div>
        <RefreshButton onRefresh={refetch} isRefreshing={isFetching && !isLoading} lastLoadedAt={lastLoadedAt} />
      </div>

      {error && (
        <Alert tone="error" action={<Button variant="secondary" onClick={refetch}>Try again</Button>}>
          {error.message}
        </Alert>
      )}

      {isLoading ? (
        <PageSpinner label="Loading dashboard..." />
      ) : (
        data && (
          <>
            <section aria-label="Inquiry counts" className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <StatCard label="All accessible" value={data.total} to="/inquiries" accent="bg-slate-400" />
              <StatCard label="New" value={data.new} to="/inquiries?status=New" accent="bg-sky-500" />
              <StatCard
                label="In Progress"
                value={data.inProgress}
                to="/inquiries?status=In+Progress"
                accent="bg-amber-500"
              />
              <StatCard label="Resolved" value={data.resolved} to="/inquiries?status=Resolved" accent="bg-emerald-500" />
              <StatCard
                label="My private"
                value={data.myPrivate}
                to="/inquiries?visibility=Private"
                accent="bg-violet-500"
              />
            </section>

            <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Latest inquiries</h2>
                <Link to="/inquiries" className="text-sm font-medium text-indigo-700 hover:underline">
                  View all →
                </Link>
              </div>
              {data.recent.length > 0 ? (
                <InquiryTable inquiries={data.recent} currentUserId={user?.id} compact />
              ) : (
                <EmptyState
                  title="No inquiries yet"
                  action={
                    <Link to="/inquiries/new" className="text-sm font-medium text-indigo-700 hover:underline">
                      Create the first inquiry →
                    </Link>
                  }
                />
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}
