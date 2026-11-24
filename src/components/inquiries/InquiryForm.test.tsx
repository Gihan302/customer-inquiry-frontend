import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../services/api';
import type { InquiryFormValues } from '../../validations/inquiry.schema';
import InquiryForm from './InquiryForm';

const EMPTY: InquiryFormValues = {
  customer_name: '',
  contact_info: '',
  subject: '',
  description: '',
  visibility: 'Public',
};

function renderForm(onSubmit: (values: InquiryFormValues) => Promise<void>) {
  render(<InquiryForm defaultValues={EMPTY} showVisibility submitLabel="Create inquiry" onSubmit={onSubmit} />);
  return userEvent.setup();
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Customer name'), '  John Silva  ');
  await user.type(screen.getByLabelText('Contact info'), '077 123 4567');
  await user.type(screen.getByLabelText('Subject'), 'Service inquiry');
  await user.type(screen.getByLabelText('Description'), 'Customer wants information about the service.');
}

describe('InquiryForm (create inquiry) — Situation 1: invalid customer input', () => {
  it('shows an error for every missing field and does NOT submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = renderForm(onSubmit);

    await user.click(screen.getByRole('button', { name: 'Create inquiry' }));

    expect(await screen.findByText('Customer name is required')).toBeInTheDocument();
    expect(screen.getByText('Contact info is required')).toBeInTheDocument();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects contact info that is neither an email nor a phone number', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = renderForm(onSubmit);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText('Contact info'));
    await user.type(screen.getByLabelText('Contact info'), 'call me maybe');
    await user.click(screen.getByRole('button', { name: 'Create inquiry' }));

    expect(await screen.findByText('Enter a valid email address or phone number')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values with the chosen visibility when the form is valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = renderForm(onSubmit);

    await fillValidForm(user);
    await user.click(screen.getByRole('radio', { name: /Private/ }));
    await user.click(screen.getByRole('button', { name: 'Create inquiry' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      customer_name: 'John Silva',
      contact_info: '077 123 4567',
      subject: 'Service inquiry',
      description: 'Customer wants information about the service.',
      visibility: 'Private',
    });
  });

  it('shows BACKEND validation errors under the matching field (backend is the authority)', async () => {
    // e.g. the browser checks were bypassed or are out of date; the API still rejects the data.
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(400, 'Validation failed', [
        { field: 'subject', message: 'Subject must be at most 200 characters' },
      ]),
    );
    const user = renderForm(onSubmit);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Create inquiry' }));

    expect(await screen.findByText('Subject must be at most 200 characters')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toHaveAttribute('aria-invalid', 'true');
    // A field-level error does not also produce a generic form-level alert.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a form-level alert for errors that are not about a specific field', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(0, 'Cannot reach the server. Check your connection and try again.'));
    const user = renderForm(onSubmit);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Create inquiry' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server');
  });

  it('disables the submit button while saving, preventing duplicate inquiries from double clicks', async () => {
    let finishSaving: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finishSaving = resolve)));
    const user = renderForm(onSubmit);

    await fillValidForm(user);
    const submit = screen.getByRole('button', { name: 'Create inquiry' });
    await user.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
    await user.click(submit); // a second click while saving does nothing
    expect(onSubmit).toHaveBeenCalledTimes(1);

    finishSaving();
    await waitFor(() => expect(submit).toBeEnabled());
  });
});
