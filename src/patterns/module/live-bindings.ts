/**
 * Module Pattern & ESM Live Bindings (https://javascriptpatterns.vercel.app/patterns/design-patterns/module-pattern)
 *
 * Demonstrates encapsulation (private module state) and ESM live bindings.
 * In ESM, imported variables are live read-only pointers to the exported bindings,
 * not static value copies like CommonJS require().
 */

let activeConnectionCount = 0

export function getConnectionCount(): number {
  return activeConnectionCount
}

export function openConnection(): number {
  activeConnectionCount += 1
  return activeConnectionCount
}

export function closeConnection(): number {
  if (activeConnectionCount > 0) {
    activeConnectionCount -= 1
  }
  return activeConnectionCount
}

export function resetConnections(): void {
  activeConnectionCount = 0
}
