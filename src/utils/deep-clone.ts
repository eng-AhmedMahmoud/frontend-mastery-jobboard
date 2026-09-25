// deepClone — a structural copy where nothing is shared with the original.
// The interview value is in the cases people forget: Date, Map, Set, arrays, and
// circular references. On the job board it backs "reset filters to their last saved state".

export function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  // TODO 1: Primitives (and functions) have nothing to clone — return them as they are. `typeof null === 'object'`, so check for null first.
  // TODO 2: Handle Date, Map and Set explicitly. A generic object copy turns a Date into `{}` — this is the detail interviewers look for.
  // TODO 3: Cycles: keep a WeakMap of original → copy. Before you recurse, check it; right after you create the copy, record it. Record it BEFORE copying children or you'll still overflow the stack.
  // TODO 4: Arrays are objects, but `{...arr}` gives you an object with numeric keys. Branch on `Array.isArray` first.
  throw new Error('Not implemented')
}
