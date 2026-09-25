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
  throw new Error('Not implemented')
}
