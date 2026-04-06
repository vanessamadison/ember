export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const secondsAgo = Math.floor((now - timestamp) / 1000);

  if (secondsAgo < 60) {
    return 'just now';
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return `${daysAgo}d ago`;
  }

  const weeksAgo = Math.floor(daysAgo / 7);
  if (weeksAgo < 4) {
    return `${weeksAgo}w ago`;
  }

  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo}mo ago`;
  }

  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo}y ago`;
}

export function formatTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
}

export function formatDateTime(date: Date | number): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return `${str.substring(0, length - 3)}...`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type DebouncedFunction<TArgs extends unknown[]> = (
  ...args: TArgs
) => void;

export function debounce<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  ms: number
): DebouncedFunction<TArgs> {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: TArgs): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, ms);
  };
}

export type ThrottledFunction<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => TReturn | undefined;

export function throttle<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  ms: number
): ThrottledFunction<TArgs, TReturn> {
  let lastRun = 0;
  let result: TReturn | undefined;

  return function throttled(...args: TArgs): TReturn | undefined {
    const now = Date.now();
    if (now - lastRun >= ms) {
      result = fn(...args);
      lastRun = now;
    }
    return result;
  };
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const grouped: Record<K, T[]> = {} as Record<K, T[]>;

  array.forEach((item) => {
    const key = keyFn(item);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}

export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

export function min(array: number[]): number {
  return Math.min(...array);
}

export function max(array: number[]): number {
  return Math.max(...array);
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  return result;
}

export interface Memoized<T> {
  value: T;
  timestamp: number;
}

export function memoize<T>(
  fn: () => T,
  ttlMs: number = 60000
): () => T {
  let cached: Memoized<T> | null = null;

  return (): T => {
    const now = Date.now();
    if (cached && now - cached.timestamp < ttlMs) {
      return cached.value;
    }

    const value = fn();
    cached = { value, timestamp: now };
    return value;
  };
}

export function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const delayMs = options.delayMs ?? 1000;
  const backoff = options.backoff ?? false;

  let lastError: Error | undefined;

  async function attempt(attemptNumber: number): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attemptNumber < maxAttempts) {
        const delay = backoff ? delayMs * Math.pow(2, attemptNumber - 1) : delayMs;
        await sleep(delay);
        return attempt(attemptNumber + 1);
      }

      throw lastError;
    }
  }

  return attempt(1);
}
