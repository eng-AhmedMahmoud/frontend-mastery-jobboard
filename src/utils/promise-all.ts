// promiseAll — reimplement Promise.all. The classic "do you actually understand promises"
// question. Order of results must match input order even though they settle out of order.

export function promiseAll<T extends readonly unknown[]>(
  values: readonly [...{ [K in keyof T]: T[K] | Promise<T[K]> }],
): Promise<T> {
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
}
