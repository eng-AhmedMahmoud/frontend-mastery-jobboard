// #note throttle — runs at most once per `wait` ms, no matter how often it's called.
// #note Debounce waits for quiet; throttle guarantees a steady rate. On the job board this is
// #note the infinite-scroll handler: fire while the user keeps scrolling, but bounded.

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
  // #hint 1 Decide the edges before you write anything: leading fires immediately, trailing fires once at the end of the window. Most bugs here are really unstated assumptions.
  // #hint 2 Track the timestamp of the last invocation. A call is allowed when `now - last >= wait`.
  // #hint 3 If a call arrives mid-window and `trailing` is on, store its arguments and schedule one run for when the window closes — don't schedule one per call.
  // #hint 4 With `leading: false`, the first call must not run immediately — that's the case that breaks most implementations.
  // #region solution
  const leading = options.leading ?? true
  const trailing = options.trailing ?? true

  let lastInvokedAt = 0
  let timeout: ReturnType<typeof setTimeout> | undefined
  let pendingArgs: Parameters<T> | undefined
  let pendingThis: unknown

  const invoke = (context: unknown, args: Parameters<T>) => {
    lastInvokedAt = Date.now()
    fn.apply(context, args)
  }

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()

    if (lastInvokedAt === 0 && !leading) lastInvokedAt = now

    const remaining = wait - (now - lastInvokedAt)

    if (remaining <= 0) {
      if (timeout !== undefined) {
        clearTimeout(timeout)
        timeout = undefined
      }
      invoke(this, args)
      return
    }

    if (!trailing) return

    pendingArgs = args
    pendingThis = this

    timeout ??= setTimeout(() => {
      timeout = undefined
      if (!pendingArgs) return
      const queuedArgs = pendingArgs
      const queuedThis = pendingThis
      pendingArgs = undefined
      pendingThis = undefined
      invoke(queuedThis, queuedArgs)
    }, remaining)
  } as Throttled<T>

  throttled.cancel = () => {
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = undefined
    pendingArgs = undefined
    pendingThis = undefined
    lastInvokedAt = 0
  }

  return throttled
  // #endregion
}
