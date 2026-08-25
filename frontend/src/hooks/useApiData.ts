'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong while loading this section. Please try again.';

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return DEFAULT_ERROR_MESSAGE;
}

interface UseApiDataOptions {
  /** Skip fetching entirely (e.g. section not in view yet). */
  enabled?: boolean;
}

/**
 * Hardened data-fetching primitive for public sections:
 * - unmount-safe (no setState after unmount)
 * - exposes a typed error message instead of swallowing failures
 * - `retry()` re-runs the fetcher without remounting
 * - fetcher identity is irrelevant; it is read through a ref
 */
export function useApiData<T>(fetcher: () => Promise<T>, options: UseApiDataOptions = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, loading, error, retry } as const;
}
