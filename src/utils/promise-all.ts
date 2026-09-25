// promiseAll — reimplement Promise.all. The classic "do you actually understand promises"
// question. Order of results must match input order even though they settle out of order.

export function promiseAll<T extends readonly unknown[]>(
  values: readonly [...{ [K in keyof T]: T[K] | Promise<T[K]> }],
): Promise<T> {
  // TODO 1: Results go into a pre-sized array by index. Pushing as they resolve returns them in completion order, which is the wrong answer.
  // TODO 2: Count settled promises rather than checking `results.length` — a slot holding `undefined` is indistinguishable from an empty one.
  // TODO 3: An empty input array resolves immediately. Handle it before you start iterating.
  // TODO 4: Non-promise values are allowed. `Promise.resolve(value)` normalises both cases in one line.
  // TODO 5: The first rejection rejects the whole thing. Later settlements are ignored — a promise can only settle once, so you don't need a guard flag.
  throw new Error('Not implemented')
}
