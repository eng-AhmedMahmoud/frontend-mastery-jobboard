// #note promiseAll — reimplement Promise.all. The classic "do you actually understand promises"
// #note question. Order of results must match input order even though they settle out of order.

export function promiseAll<T extends readonly unknown[]>(
  values: readonly [...{ [K in keyof T]: T[K] | Promise<T[K]> }],
): Promise<T> {
  // #hint 1 Results go into a pre-sized array by index. Pushing as they resolve returns them in completion order, which is the wrong answer.
  // #hint 2 Count settled promises rather than checking `results.length` — a slot holding `undefined` is indistinguishable from an empty one.
  // #hint 3 An empty input array resolves immediately. Handle it before you start iterating.
  // #hint 4 Non-promise values are allowed. `Promise.resolve(value)` normalises both cases in one line.
  // #hint 5 The first rejection rejects the whole thing. Later settlements are ignored — a promise can only settle once, so you don't need a guard flag.
  // #region solution
  return new Promise<T>((resolve, reject) => {
    const results = new Array(values.length) as unknown as { -readonly [K in keyof T]: T[K] }
    let settled = 0

    if (values.length === 0) {
      resolve(results as unknown as T)
      return
    }

    values.forEach((value, index) => {
      Promise.resolve(value).then((resolved) => {
        results[index as keyof T] = resolved as T[keyof T]
        settled += 1
        if (settled === values.length) resolve(results as unknown as T)
      }, reject)
    })
  })
  // #endregion
}
