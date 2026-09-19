// batchLayout — every read first, then every write.
// Reading geometry (offsetWidth, getBoundingClientRect, getComputedStyle) after a write
// forces the browser to run layout there and then, so it can answer accurately. Do that
// inside a loop over 600 cards and you have asked for 600 layouts instead of one.
// This is module 2, lesson 7, as a function you can actually unit-test.

export interface BatchLayoutInput<Item, Measurement> {
  items: readonly Item[]
  /** Reads geometry. Runs for every item before any write happens. */
  measure: (item: Item, index: number) => Measurement
  /** Writes style. Runs for every item after every read has finished. */
  apply: (item: Item, measurement: Measurement, index: number) => void
}

export function batchLayout<Item, Measurement>({
  items,
  measure,
  apply,
}: BatchLayoutInput<Item, Measurement>): Measurement[] {
  throw new Error('Not implemented')
}
