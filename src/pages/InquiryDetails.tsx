import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import RefreshButton from '../components/common/RefreshButton';
import { PageSpinner } from '../components/common/Spinner';
import { VisibilityBadge } from '../components/inquiries/Badges';
import InquiryForm from '../components/inquiries/InquiryForm';
import StatusActions from '../components/inquiries/StatusActions';
import { useApiData } from '../hooks/useApiData';
import { useAuth } from '../hooks/useAuth';
import { ApiError, getErrorMessage } from '../services/api';
import { getInquiry, updateInquiry, updateInquiryStatus } from '../services/inquiry.service';
import type { Inquiry, InquiryStatus } from '../types';
import { formatDateTime } from '../utils/format';
import type { InquiryFormValues } from '../validations/inquiry.schema';

interface Notice {
  tone: 'success' | 'warning' | 'error';
  text: string;
}

const VALID_ID = /^[1-9]\d{0,14}$/;

export default function InquiryDetails() {
  const { id: idParam = '' } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const id = VALID_ID.test(idParam) ? Number(idParam) : null;
  const { data: inquiry, error, isLoading, isFetching, lastLoadedAt, refetch, setData } = useApiData(
    `inquiry-${idParam}`,
    () => (id === null ? Promise.reject(new ApiError(404, 'Inquiry not found')) : getInquiry(id)),
  );

  // A one-time message passed by the create page ("Inquiry created successfully.").
  const [notice, setNotice] = useState<Notice | null>(() => {
    const flash = (location.state as { flash?: string } | null)?.flash;
    return flash ? { tone: 'success', text: flash } : null;
  });
  useEffect(() => {
    // Remove the flash from browser history so a page refresh does not show it again.
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(null);
  /** The version the user started editing from (sent as expected_updated_at). */
  const [editBase, setEditBase] = useState<Inquiry | null>(null);
  const [conflict, setConflict] = useState(false);

  // ---- Not found / not allowed (Situation 3) ----
  // The backend answers 404 both for ids that do not exist and for other staff
  // members' Private inquiries, so the page cannot (and should not) tell them apart.
  const notFound = error && (error.status === 404 || error.status === 400);
  if (notFound && !isFetching) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <EmptyState
          title="Inquiry not found"
          description="It does not exist, or you do not have permission to view it."
          action={
            <Link to="/inquiries" className="text-sm font-medium text-indigo-700 hover:underline">
              ← Back to inquiries
            </Link>
          }
        />
      </div>
    );
  }

  if (isLoading) return <PageSpinner label="Loading inquiry..." />;

  if (!inquiry) {
    return (
      <Alert tone="error" action={<Button variant="secondary" onClick={refetch}>Try again</Button>}>
        {error?.message ?? 'Could not load this inquiry.'}
      </Alert>
    );
  }

  // ---- Status change ----
  const changeStatus = async (next: InquiryStatus) => {
    setPendingStatus(next);
    setNotice(null);
    try {
      const result = await updateInquiryStatus(inquiry.id, next);
      setData(result.inquiry);
      setNotice(
        result.changed
          ? { tone: 'success', text: `Status changed to “${result.inquiry.status}”.` }
          : { tone: 'warning', text: `This inquiry was already “${result.inquiry.status}” (it was updated elsewhere).` },
      );
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
        // The status we showed was outdated (another tab or colleague changed it).
        const reason = err.status === 400 ? (err.errors[0]?.message ?? err.message) : err.message;
        setNotice({ tone: 'warning', text: `${reason}. The latest version has been loaded.` });
        refetch();
      } else if (err instanceof ApiError && err.status === 404) {
        refetch(); // shows the "not found" view
      } else {
        setNotice({ tone: 'error', text: getErrorMessage(err) });
      }
    } finally {
      setPendingStatus(null);
    }
  };

  // ---- Edit ----
  const startEditing = () => {
    setNotice(null);
    setConflict(false);
    setEditBase(inquiry);
  };

  const saveEdits = async (values: InquiryFormValues) => {
    if (!editBase) return;
    try {
      const updated = await updateInquiry(inquiry.id, {
        customer_name: values.customer_name,
        contact_info: values.contact_info,
        subject: values.subject,
        description: values.description,
        // Optimistic concurrency: refuse to save if the record changed since editing began.
        expected_updated_at: editBase.updated_at,
      });
      setData(updated);
      setEditBase(null);
      setNotice({ tone: 'success', text: 'Inquiry updated successfully.' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflict(true);
        return;
      }
      throw err; // InquiryForm shows validation and other errors
    }
  };

  const reloadAfterConflict = () => {
    setConflict(false);
    setEditBase(null);
    setNotice({ tone: 'warning', text: 'Latest version loaded. Your unsaved changes were discarded.' });
    refetch();
  };

  const isOwner = inquiry.created_by === user?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/inquiries" className="text-sm font-medium text-indigo-700 hover:underline">
            ← Back to inquiries
          </Link>
          <h1 className="mt-2 break-words text-xl font-semibold text-slate-900">{inquiry.subject}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Inquiry #{inquiry.id}</span>
            <span aria-hidden="true">·</span>
            <VisibilityBadge visibility={inquiry.visibility} />
            {inquiry.visibility === 'Private' && <span>Only you can see this inquiry.</span>}
          </div>
        </div>
        {!editBase && (
          <RefreshButton onRefresh={refetch} isRefreshing={isFetching} lastLoadedAt={lastLoadedAt} />
        )}
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      {error && !notFound && <Alert tone="error">{error.message}</Alert>}

      {editBase ? (
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Edit inquiry</h2>
          {conflict && (
            <div className="mb-5">
              <Alert
                tone="warning"
                action={
                  <Button variant="secondary" onClick={reloadAfterConflict}>
                    Reload latest
                  </Button>
                }
              >
                Someone else changed this inquiry after you started editing, so your changes were
                <strong> not saved</strong>. Reload the latest version, then make your changes again.
              </Alert>
            </div>
          )}
          <InquiryForm
            defaultValues={{
              customer_name: editBase.customer_name,
              contact_info: editBase.contact_info,
              subject: editBase.subject,
              description: editBase.description,
              visibility: editBase.visibility,
            }}
            showVisibility={false}
            submitLabel="Save changes"
            onSubmit={saveEdits}
            onCancel={() => {
              setEditBase(null);
              setConflict(false);
            }}
          />
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Customer name">{inquiry.customer_name}</Detail>
              <Detail label="Contact info">{inquiry.contact_info}</Detail>
              <Detail label="Created by">{isOwner ? 'You' : 'Colleague'}</Detail>
              <Detail label="Created">{formatDateTime(inquiry.created_at)}</Detail>
              <Detail label="Last updated">{formatDateTime(inquiry.updated_at)}</Detail>
            </dl>
            <div>
              <h2 className="text-sm font-medium text-slate-500">Description</h2>
              {/* Rendered as text (React escapes it), never as HTML. */}
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{inquiry.description}</p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={startEditing} disabled={pendingStatus !== null}>
                Edit details
              </Button>
            </div>
          </section>

          <section className="h-fit rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Status</h2>
            <StatusActions
              status={inquiry.status}
              pendingStatus={pendingStatus}
              disabled={isFetching}
              onChange={changeStatus}
            />
          </section>
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-900">{children}</dd>
    </div>
  );
}
