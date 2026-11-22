import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  DESCRIPTION_MAX,
  INQUIRY_FORM_FIELDS,
  inquiryFormSchema,
  type InquiryFormValues,
} from '../../validations/inquiry.schema';
import { applyServerErrors } from '../../validations/serverErrors';
import Alert from '../common/Alert';
import Button from '../common/Button';
import { TextAreaField, TextField } from '../common/FormField';

interface InquiryFormProps {
  defaultValues: InquiryFormValues;
  /** Visibility can only be chosen when creating (the API does not allow changing it later). */
  showVisibility: boolean;
  submitLabel: string;
  /** Throw to show an error in the form; return normally on success. */
  onSubmit: (values: InquiryFormValues) => Promise<void>;
  onCancel?: () => void;
}

export default function InquiryForm({
  defaultValues,
  showVisibility,
  submitLabel,
  onSubmit,
  onCancel,
}: InquiryFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues,
  });

  // Live character counter for the description.
  const descriptionLength = useWatch({ control, name: 'description' })?.length ?? 0;

  const submit = async (values: InquiryFormValues) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      // Backend validation errors appear under the matching fields (Situation 1).
      setFormError(applyServerErrors(error, setError, INQUIRY_FORM_FIELDS));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit, () => setFormError(null))} noValidate className="space-y-5">
      {formError && <Alert tone="error">{formError}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Customer name"
          autoComplete="off"
          maxLength={150}
          error={errors.customer_name?.message}
          {...register('customer_name')}
        />
        <TextField
          label="Contact info"
          autoComplete="off"
          maxLength={150}
          hint="Email address or phone number"
          error={errors.contact_info?.message}
          {...register('contact_info')}
        />
      </div>

      <TextField label="Subject" maxLength={200} error={errors.subject?.message} {...register('subject')} />

      <TextAreaField
        label="Description"
        rows={6}
        maxLength={DESCRIPTION_MAX}
        error={errors.description?.message}
        hint={`${descriptionLength} / ${DESCRIPTION_MAX} characters`}
        {...register('description')}
      />

      {showVisibility && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Visibility</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['Public', 'Every staff member can view and update it.'],
                ['Private', 'Only you can view and update it.'],
              ] as const
            ).map(([value, description]) => (
              <label
                key={value}
                className="flex cursor-pointer gap-3 rounded-lg p-3 ring-1 ring-slate-300 has-[:checked]:bg-indigo-50 has-[:checked]:ring-2 has-[:checked]:ring-indigo-600"
              >
                <input type="radio" value={value} className="mt-0.5 accent-indigo-600" {...register('visibility')} />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{value}</span>
                  <span className="block text-xs text-slate-500">{description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.visibility && <p className="mt-1 text-xs text-red-600">{errors.visibility.message}</p>}
        </fieldset>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
