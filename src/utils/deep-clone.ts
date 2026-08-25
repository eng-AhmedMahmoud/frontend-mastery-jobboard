// #note deepClone — a structural copy where nothing is shared with the original.
// #note The interview value is in the cases people forget: Date, Map, Set, arrays, and
// #note circular references. On the job board it backs "reset filters to their last saved state".

export function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  // #hint 1 Primitives (and functions) have nothing to clone — return them as they are. `typeof null === 'object'`, so check for null first.
  // #hint 2 Handle Date, Map and Set explicitly. A generic object copy turns a Date into `{}` — this is the detail interviewers look for.
  // #hint 3 Cycles: keep a WeakMap of original → copy. Before you recurse, check it; right after you create the copy, record it. Record it BEFORE copying children or you'll still overflow the stack.
  // #hint 4 Arrays are objects, but `{...arr}` gives you an object with numeric keys. Branch on `Array.isArray` first.
  // #region solution
  if (value === null || typeof value !== 'object') return value

  const source = value as unknown as object
  if (seen.has(source)) return seen.get(source) as T

  if (value instanceof Date) return new Date(value.getTime()) as unknown as T

  if (value instanceof Map) {
    const copy = new Map()
    seen.set(source, copy)
    for (const [key, entry] of value) copy.set(deepClone(key, seen), deepClone(entry, seen))
    return copy as unknown as T
  }

  if (value instanceof Set) {
    const copy = new Set()
    seen.set(source, copy)
    for (const entry of value) copy.add(deepClone(entry, seen))
    return copy as unknown as T
  }

  if (Array.isArray(value)) {
    const copy: unknown[] = []
    seen.set(source, copy)
    for (const entry of value) copy.push(deepClone(entry, seen))
    return copy as unknown as T
  }

  const copy: Record<string, unknown> = Object.create(Object.getPrototypeOf(value) as object | null)
  seen.set(source, copy)
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = deepClone(entry, seen)
  }
  return copy as T
  // #endregion
}
