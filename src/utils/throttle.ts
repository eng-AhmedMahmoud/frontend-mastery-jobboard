// throttle — runs at most once per `wait` ms, no matter how often it's called.
// Debounce waits for quiet; throttle guarantees a steady rate. On the job board this is
// the infinite-scroll handler: fire while the user keeps scrolling, but bounded.

export interface Throttled<T extends (...args: never[]) => void> {
  (...args: Parameters<T>): void
  cancel(): void
}

export interface ThrottleOptions {
  /** Run on the first call of a window. Default: true. */
  leading?: boolean
  /** Run once more at the end of a window if calls came in during it. Default: true. */
  trailing?: boolean
}

export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {},
): Throttled<T> {
  throw new Error('Not implemented')
}
