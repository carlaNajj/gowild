import { useEffect, useRef } from 'react';

/**
 * Polls a fetch function at regular intervals.
 * Automatically pauses when the browser tab is hidden (Page Visibility API)
 * and resumes + immediate refetch when the tab becomes visible again.
 */
export function usePolling(fetchFn: () => void | Promise<void>, intervalMs = 5000) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchRef = useRef(fetchFn);

  // Keep ref up to date
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const tick = () => {
      try {
        fetchRef.current();
      } catch {
        // ignore polling errors
      }
    };

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        tick(); // immediate refetch when tab becomes visible
        start();
      }
    };

    // Initial start
    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}
