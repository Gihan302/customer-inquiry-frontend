import { useId, type ComponentProps, type ReactNode } from 'react';

const CONTROL_CLASSES =
  'block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:outline-none disabled:bg-slate-100';

const ringFor = (hasError: boolean) =>
  hasError ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-indigo-600';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled input that shows its validation error underneath. Works with react-hook-form's register(). */
export function TextField({ label, error, hint, className = '', ...inputProps }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL_CLASSES} ${ringFor(Boolean(error))} ${className}`}
        {...inputProps}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, error, hint, className = '', ...textareaProps }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL_CLASSES} ${ringFor(Boolean(error))} ${className}`}
        {...textareaProps}
      />
    </FieldShell>
  );
}
