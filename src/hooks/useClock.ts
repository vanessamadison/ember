import { useEffect, useState } from 'react';

/**
 * Monotonic clock for relative-time UI. Avoids calling Date.now() during render
 * (React Compiler purity rule) while still updating labels periodically.
 */
export function useClock(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
