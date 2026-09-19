// rafSchedule — throttle by frame instead of by clock.
// A scroll handler can fire many times between two frames. Anything it does to the
// page more than once per frame is thrown away, because only one frame gets painted.
// This is the frame-aligned answer to module 2, lesson 9: one call per frame, with
// the latest arguments, cancelled cleanly on teardown.

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

  throw new Error('Not implemented')
}
