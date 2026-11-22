import { Navigate, Outlet, useLocation } from 'react-router';
import { PageSpinner } from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';

/** Router state set when a signed-out user is sent to /login. */
export interface LoginRedirectState {
  /** The page the user originally tried to open. */
  from?: string;
}

/**
 * Only renders its child routes for a signed-in user; otherwise redirects to /login
 * and remembers where the user was going.
 *
 * This is a convenience for the user, NOT security: the backend checks the token
 * and the Public/Private rules on every request regardless of what the frontend shows.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <PageSpinner label="Checking your session..." />;
  if (status === 'unauthenticated') {
    const state: LoginRedirectState = { from: location.pathname + location.search };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}

/**
 * The login page. As soon as the user is signed in (including right after a
 * successful login) this sends them to the page they originally asked for, or
 * the dashboard. It is the ONLY place that redirects after login, so there is
 * no race between two competing navigations.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <PageSpinner label="Checking your session..." />;
  if (status === 'authenticated') {
    const from = (location.state as LoginRedirectState | null)?.from;
    // Only follow internal paths (never redirect to another site).
    const target = from && from.startsWith('/') && !from.startsWith('//') ? from : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
