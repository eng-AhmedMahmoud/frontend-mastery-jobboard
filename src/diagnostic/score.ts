// Module 1's exercise. Twelve marks in, one address out.
// #note
// In lesson 5 you answered twelve diagnostic questions and marked yourself. This is the
// function that turns those twelve marks into the module you should open first — so the
// first thing you implement in this program computes your own route through it.
// #note
// It is deliberately small. The point is not the difficulty; it is that you have run the
// red → implement → diff loop once before module 3 asks you to do it under load.

/** How a run of twelve marks reads as a band. The wording matches the score slide in lesson 5. */
export type DiagnosticBand = 'starting-fresh' | 'common' | 'mid-shaped' | 'senior-shaped'

export interface DiagnosticResult {
  /** How many of the twelve you got substantially right. Scoring is binary and generous. */
  score: number
  band: DiagnosticBand
  /** The module to open next. Not always the module after this one. */
  startModule: number
  /** Where to spend the most time, in order. */
  focusModules: number[]
}

/** The diagnostic is always twelve questions — six in part 1, six in part 2. */
export const TOTAL_QUESTIONS = 12

/**
 * Turn a self-marked diagnostic into an address.
 *
 * @param marks one entry per question, `true` if you got the mechanism right.
 * @throws RangeError if the run is not exactly {@link TOTAL_QUESTIONS} long.
 */
export function scoreDiagnostic(marks: boolean[]): DiagnosticResult {
  // TODO 1: Validate first. A run that is not exactly TOTAL_QUESTIONS long is a bug in the caller, not a low score — throw a RangeError and say both numbers in the message.
  // TODO 2: The score is just how many entries are true. `filter` then `length` is fine; so is a reduce. Do not try to be clever.
  // TODO 3: There are four bands: 0–3, 4–6, 7–9, 10–12. Write them as ordered upper bounds and return on the first one the score fits, rather than as a chain of && comparisons.
  // TODO 4: Each band carries its own startModule and focusModules. Keep that data in one table next to the bands, not spread through four if-branches — you will thank yourself when the bands move.
  // TODO 5: Return a fresh array for focusModules on every call. Handing out a reference to a shared constant lets a caller mutate the next caller's result.
  throw new Error('Not implemented')
}
