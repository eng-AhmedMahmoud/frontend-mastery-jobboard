// #note measure — the "prove it" half of the exercise.
// #note "It feels faster" is not a deliverable. A number before and a number after is.
// #note This writes a real User Timing entry, so the run shows up as a labelled band in the
// #note Performance panel next to the layout and paint work it caused.

export interface PerformanceLike {
  now(): number
  mark?(name: string): unknown
  measure?(name: string, start: string, end: string): unknown
}

export interface Measured<T> {
  result: T
  /** Milliseconds the callback took, measured on the same clock DevTools uses. */
  duration: number
}

/** Anything over this is a long task: the frame it landed in was dropped. */
export const LONG_TASK_MS = 50

export function measure<T>(
  label: string,
  fn: () => T,
  perf: PerformanceLike = performance,
): Measured<T> {
  // #hint 1 Take `now()` before and after, and subtract. That is the number you report, and it is the one that survives when the User Timing API is missing.
  // #hint 2 Wrap the call in try/finally. A callback that throws must still leave a timing behind, or the slowest run in your session is the one you never see.
  // #hint 3 Mark the start, mark the end, then `measure` between them — that is what puts a named band in the Performance panel.
  // #hint 4 Guard `mark` and `measure` with a check. They are optional here so the tests can hand you a clock with nothing else on it.
  // #region solution
  const startMark = `${label}:start`
  const endMark = `${label}:end`

  perf.mark?.(startMark)
  const startedAt = perf.now()

  try {
    return { result: fn(), duration: perf.now() - startedAt }
  } finally {
    perf.mark?.(endMark)
    perf.measure?.(label, startMark, endMark)
  }
  // #endregion
}

export function isLongTask(duration: number): boolean {
  // #region solution
  return duration >= LONG_TASK_MS
  // #endregion
}
