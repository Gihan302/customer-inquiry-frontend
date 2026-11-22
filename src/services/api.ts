import axios, { AxiosError } from 'axios';
import type { ApiErrorBody, ErrorDetail } from '../types';

// ---------------------------------------------------------------------
// Token storage
// localStorage keeps the user signed in across page refreshes. Trade-off:
// any script running on the page can read it (XSS), which React's default
// output escaping and the short token lifetime mitigate. See DECISIONS.md.
// ---------------------------------------------------------------------
const TOKEN_KEY = 'cims_access_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ---------------------------------------------------------------------
// One error type for the whole app
// ---------------------------------------------------------------------
export class ApiError extends Error {
  /** HTTP status code, or 0 if the server could not be reached. */
  readonly status: number;
  /** Field-level validation errors from the backend (may be empty). */
  readonly errors: ErrorDetail[];

  constructor(status: number, message: string, errors: ErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === 'object' && data !== null && 'message' in data && 'errors' in data;
}

function toApiError(error: unknown): ApiError {
  if (!(error instanceof AxiosError)) {
    return new ApiError(0, 'Something went wrong. Please try again.');
  }
  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return new ApiError(0, 'The server took too long to respond. Please try again.');
  }
  if (!error.response) {
    return new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  const { status, data } = error.response;
  if (isApiErrorBody(data)) {
    return new ApiError(status, data.message, data.errors);
  }
  return new ApiError(status, 'Unexpected response from the server.');
}

/** Human-readable message for any error caught in a component. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------------
// "Session expired" hook: AuthContext registers a callback so that a 401
// from ANY request (e.g. the token expired) signs the user out.
// ---------------------------------------------------------------------
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// ---------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach the token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Normalise errors and handle expired/invalid sessions in one place.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    const isLoginRequest =
      error instanceof AxiosError && error.config?.url?.endsWith('/auth/login') === true;

    // A 401 on login just means "wrong password"; anywhere else it means the session is over.
    if (apiError.status === 401 && !isLoginRequest) {
      tokenStorage.clear();
      onUnauthorized?.();
    }
    return Promise.reject(apiError);
  },
);
