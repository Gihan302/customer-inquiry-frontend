import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { TextField } from '../components/common/FormField';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../validations/auth.schema';
import { applyServerErrors } from '../validations/serverErrors';

export default function Login() {
  const { login, sessionExpired } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      // On success, PublicOnlyRoute redirects to the page the user originally asked for.
      await login(values.email, values.password);
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ['email', 'password']));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Customer Inquiry Management</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in with your staff account</p>
        </div>

        <form
          // Second callback runs when client-side validation fails: drop any outdated server error.
          onSubmit={handleSubmit(onSubmit, () => setFormError(null))}
          noValidate
          className="space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          {sessionExpired && !formError && (
            <Alert tone="warning">Your session has ended. Please sign in again.</Alert>
          )}
          {formError && <Alert tone="error">{formError}</Alert>}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  );
}
