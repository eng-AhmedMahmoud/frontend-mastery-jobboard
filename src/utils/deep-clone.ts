// deepClone — a structural copy where nothing is shared with the original.
// The interview value is in the cases people forget: Date, Map, Set, arrays, and
// circular references. On the job board it backs "reset filters to their last saved state".

export function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  throw new Error('Not implemented')
}
