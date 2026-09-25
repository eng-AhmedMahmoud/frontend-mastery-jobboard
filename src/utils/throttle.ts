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
  // TODO 1: Decide the edges before you write anything: leading fires immediately, trailing fires once at the end of the window. Most bugs here are really unstated assumptions.
  // TODO 2: Track the timestamp of the last invocation. A call is allowed when `now - last >= wait`.
  // TODO 3: If a call arrives mid-window and `trailing` is on, store its arguments and schedule one run for when the window closes — don't schedule one per call.
  // TODO 4: With `leading: false`, the first call must not run immediately — that's the case that breaks most implementations.
  throw new Error('Not implemented')
}
