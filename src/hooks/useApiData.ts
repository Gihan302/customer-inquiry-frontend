import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/api';

interface InternalState<T> {
  data: T | undefined;
  error: ApiError | null;
  /** The key the current data/error belongs to. If it differs from the requested key, a load is running. */
  loadedKey: string | null;
  /** A manual or on-focus refresh is running. */
  refreshing: boolean;
  lastLoadedAt: Date | null;
}

export interface ApiDataResult<T> {
  data: T | undefined;
  error: ApiError | null;
  /** True only for the very first load, when there is nothing to show yet. */
  isLoading: boolean;
  /** True while any request is running (first load, new filters, or refresh). */
  isFetching: boolean;
  /** When the data shown was last loaded from the server. */
  lastLoadedAt: Date | null;
  /** Load again from the server (Refresh buttons, after edits). */
  refetch: () => void;
  /** Replace the data locally, e.g. with the record returned by a successful update. */
  setData: (data: T) => void;
}

/**
 * Loads data from the API and keeps it reasonably fresh.
 *
 * - `key` identifies WHAT to load (e.g. the serialized filters). When it changes
 *   the data is reloaded; the previous data stays visible meanwhile (no flicker).
 * - Reloads automatically when the browser tab becomes visible again, so a tab
 *   left open does not keep showing outdated statuses (stale-data situation).
 * - Ignores responses that arrive out of order: only the latest request wins.
 */
export function useApiData<T>(key: string, loader: () => Promise<T>): ApiDataResult<T> {
  const [state, setState] = useState<InternalState<T>>({
    data: undefined,
    error: null,
    loadedKey: null,
    refreshing: false,
    lastLoadedAt: null,
  });

  // Always use the latest loader and key without making them effect dependencies.
  const loaderRef = useRef(loader);
  const keyRef = useRef(key);
  useEffect(() => {
    loaderRef.current = loader;
    keyRef.current = key;
  });

  const latestRequest = useRef(0);

  const run = useCallback(async (forKey: string) => {
    const requestId = ++latestRequest.current;
    try {
      const data = await loaderRef.current();
      if (requestId !== latestRequest.current) return; // a newer request has started
      setState({ data, error: null, loadedKey: forKey, refreshing: false, lastLoadedAt: new Date() });
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      const apiError =
        error instanceof ApiError ? error : new ApiError(0, 'Something went wrong. Please try again.');
      setState((s) => ({ ...s, error: apiError, loadedKey: forKey, refreshing: false }));
    }
  }, []);

  // Load on mount and whenever the key changes. (State is only updated when the response arrives.)
  useEffect(() => {
    void run(key);
  }, [key, run]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, refreshing: true }));
    void run(keyRef.current);
  }, [run]);

  // Reload when the user comes back to this tab.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refetch]);

  const setData = useCallback((data: T) => {
    setState((s) => ({ ...s, data, error: null, lastLoadedAt: new Date() }));
  }, []);

  const isFetching = state.loadedKey !== key || state.refreshing;

  return {
    data: state.data,
    error: state.error,
    isLoading: isFetching && state.data === undefined,
    isFetching,
    lastLoadedAt: state.lastLoadedAt,
    refetch,
    setData,
  };
}
