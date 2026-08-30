// deepClone — a structural copy where nothing is shared with the original.
// The interview value is in the cases people forget: Date, Map, Set, arrays, and
// circular references. On the job board it backs "reset filters to their last saved state".

export function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
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
}
