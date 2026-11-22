import { Link, useNavigate } from 'react-router';
import InquiryForm from '../components/inquiries/InquiryForm';
import { createInquiry } from '../services/inquiry.service';
import type { InquiryFormValues } from '../validations/inquiry.schema';

const EMPTY_FORM: InquiryFormValues = {
  customer_name: '',
  contact_info: '',
  subject: '',
  description: '',
  visibility: 'Public',
};

export default function CreateInquiry() {
  const navigate = useNavigate();

  const handleSubmit = async (values: InquiryFormValues) => {
    // Only these fields are sent: status and created_by are decided by the backend.
    const inquiry = await createInquiry(values);
    navigate(`/inquiries/${inquiry.id}`, { state: { flash: 'Inquiry created successfully.' } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/inquiries" className="text-sm font-medium text-indigo-700 hover:underline">
          ← Back to inquiries
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">New inquiry</h1>
        <p className="mt-1 text-sm text-slate-500">New inquiries start with the status “New”.</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <InquiryForm
          defaultValues={EMPTY_FORM}
          showVisibility
          submitLabel="Create inquiry"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/inquiries')}
        />
      </div>
    </div>
  );
}
