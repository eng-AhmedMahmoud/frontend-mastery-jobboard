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
}
