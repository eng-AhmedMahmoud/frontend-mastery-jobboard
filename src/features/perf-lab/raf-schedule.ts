// #note rafSchedule — throttle by frame instead of by clock.
// #note A scroll handler can fire many times between two frames. Anything it does to the
// #note page more than once per frame is thrown away, because only one frame gets painted.
// #note This is the frame-aligned answer to module 2, lesson 9: one call per frame, with
// #note the latest arguments, cancelled cleanly on teardown.

export interface Scheduled<T extends (...args: never[]) => void> {
  (...args: Parameters<T>): void
  /** Drop a frame that has been requested but not yet run. Call this on unmount. */
  cancel(): void
}

export interface RafSchedulerOptions {
  /** Injected so the tests can drive frames by hand. Defaults to the real thing. */
  requestFrame?: (callback: () => void) => number
  cancelFrame?: (handle: number) => void
}

export function rafSchedule<T extends (...args: never[]) => void>(
  fn: T,
  options: RafSchedulerOptions = {},
): Scheduled<T> {
  const requestFrame =
    options.requestFrame ?? ((callback: () => void) => requestAnimationFrame(callback))
  const cancelFrame = options.cancelFrame ?? ((handle: number) => cancelAnimationFrame(handle))

  // #hint 1 You need two pieces of state: the frame handle you asked for, and the call you are holding for it.
  // #hint 2 Request a frame only when one is not already pending. Requesting per call is the bug this function exists to remove.
  // #hint 3 Overwrite the held call on every call. The frame should run with the newest scroll position, not the oldest.
  // #hint 4 `fn.bind(this, ...args)` captures the receiver and the arguments in one value, which is tidier than keeping both by hand.
  // #hint 5 Clear the handle *before* invoking — a handler that schedules itself again must be able to.
  // #hint 6 `cancel()` has to clear both the handle and the held call, or a cancelled frame leaks its payload into the next one.
  // #region solution
  let frame: number | undefined
  let pendingCall: (() => void) | undefined

  const scheduled = function (this: unknown, ...args: Parameters<T>) {
    pendingCall = fn.bind(this as never, ...args)

    if (frame !== undefined) return

    frame = requestFrame(() => {
      frame = undefined

      const call = pendingCall
      pendingCall = undefined
      call?.()
    })
  } as Scheduled<T>

  scheduled.cancel = () => {
    if (frame !== undefined) cancelFrame(frame)
    frame = undefined
    pendingCall = undefined
  }

  return scheduled
  // #endregion
}
