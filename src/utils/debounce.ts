// debounce — delays the call until `wait` ms have passed with no further calls.
// On the job board this drives the search box: type "seni", "senio", "senior" and only
// the last one hits the network. Asked in interviews more than any other utility.

export interface Debounced<T extends (...args: never[]) => void> {
  (...args: Parameters<T>): void
  /** Drop a pending call. */
  cancel(): void
  /** Run a pending call right now, if there is one. */
  flush(): void
}

export function debounce<T extends (...args: never[]) => void>(fn: T, wait: number): Debounced<T> {
  // TODO 1: The timer id has to live in the closure, not inside the returned function — that's what lets one call cancel the previous one.
  // TODO 2: Keep the latest arguments too. When the timer finally fires it must use the newest call's arguments, not the first.
  // TODO 3: `cancel` clears the timer and forgets the pending arguments. `flush` runs them immediately instead.
  // TODO 4: Interviewers usually follow up with "what about `this`?" — use a normal function, not an arrow, and forward `this` through `apply`.
  throw new Error('Not implemented')
}
