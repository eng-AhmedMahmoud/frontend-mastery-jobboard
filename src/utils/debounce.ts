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
  let timeout: ReturnType<typeof setTimeout> | undefined
  let pendingArgs: Parameters<T> | undefined
  let pendingThis: unknown

  const invoke = () => {
    timeout = undefined
    if (!pendingArgs) return
    const args = pendingArgs
    const context = pendingThis
    pendingArgs = undefined
    pendingThis = undefined
    fn.apply(context, args)
  }

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    pendingArgs = args
    pendingThis = this
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = setTimeout(invoke, wait)
  } as Debounced<T>

  debounced.cancel = () => {
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = undefined
    pendingArgs = undefined
    pendingThis = undefined
  }

  debounced.flush = () => {
    if (timeout === undefined) return
    clearTimeout(timeout)
    invoke()
  }

  return debounced
}
