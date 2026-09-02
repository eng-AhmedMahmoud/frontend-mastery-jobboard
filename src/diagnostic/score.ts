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
  throw new Error('Not implemented')
}
