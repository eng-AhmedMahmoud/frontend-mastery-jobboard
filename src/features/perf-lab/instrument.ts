// measure — the "prove it" half of the exercise.
// "It feels faster" is not a deliverable. A number before and a number after is.
// This writes a real User Timing entry, so the run shows up as a labelled band in the
// Performance panel next to the layout and paint work it caused.

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
  // TODO 1: Take `now()` before and after, and subtract. That is the number you report, and it is the one that survives when the User Timing API is missing.
  // TODO 2: Wrap the call in try/finally. A callback that throws must still leave a timing behind, or the slowest run in your session is the one you never see.
  // TODO 3: Mark the start, mark the end, then `measure` between them — that is what puts a named band in the Performance panel.
  // TODO 4: Guard `mark` and `measure` with a check. They are optional here so the tests can hand you a clock with nothing else on it.
  throw new Error('Not implemented')
}

export function isLongTask(duration: number): boolean {
  throw new Error('Not implemented')
}
