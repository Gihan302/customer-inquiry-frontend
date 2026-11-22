import { Link } from 'react-router';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import RefreshButton from '../components/common/RefreshButton';
import { PageSpinner } from '../components/common/Spinner';
import InquiryFilters from '../components/inquiries/InquiryFilters';
import InquiryTable from '../components/inquiries/InquiryTable';
import { useApiData } from '../hooks/useApiData';
import { useAuth } from '../hooks/useAuth';
import { useInquiryFilters } from '../hooks/useInquiryFilters';
import { listInquiries } from '../services/inquiry.service';

export default function Inquiries() {
  const { user } = useAuth();
  const { filters, apiParams, updateFilters, clearFilters, hasActiveFilters } = useInquiryFilters();
  const { data, error, isLoading, isFetching, lastLoadedAt, refetch } = useApiData(
    JSON.stringify(apiParams),
    () => listInquiries(apiParams),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inquiries</h1>
          <p className="mt-1 text-sm text-slate-500">
            All Public inquiries, plus the Private inquiries you created.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={refetch} isRefreshing={isFetching && !isLoading} lastLoadedAt={lastLoadedAt} />
          <Link
            to="/inquiries/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            New inquiry
          </Link>
        </div>
      </div>

      <InquiryFilters
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {error && (
        <Alert
          tone="error"
          action={
            <Button variant="secondary" onClick={refetch}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
      )}

      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200">
        {isLoading ? (
          <PageSpinner label="Loading inquiries..." />
        ) : data && data.inquiries.length > 0 ? (
          // Dim the old rows while the next page/filter loads.
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={isFetching}>
            <InquiryTable inquiries={data.inquiries} currentUserId={user?.id} />
          </div>
        ) : data && hasActiveFilters ? (
          <EmptyState
            title="No inquiries match your filters"
            description="Try a different search or clear the filters."
            action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : data && filters.page > 1 ? (
          <EmptyState
            title="This page is empty"
            action={<Button variant="secondary" onClick={() => updateFilters({ page: 1 })}>Go to first page</Button>}
          />
        ) : data ? (
          <EmptyState
            title="No inquiries yet"
            description="Create the first customer inquiry to get started."
            action={
              <Link to="/inquiries/new" className="text-sm font-medium text-indigo-700 hover:underline">
                Create an inquiry →
              </Link>
            }
          />
        ) : null}
      </div>

      {data && (
        <Pagination
          pagination={data.pagination}
          onPageChange={(page) => updateFilters({ page })}
          disabled={isFetching}
        />
      )}
    </div>
  );
}
