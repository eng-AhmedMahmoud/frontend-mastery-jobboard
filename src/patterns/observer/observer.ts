/**
 * Observer Pattern (https://javascriptpatterns.vercel.app/patterns/design-patterns/observer-pattern)
 *
 * Use an observable object to notify subscribers when an event occurs.
 * Implements clean subscribe, unsubscribe, and typed event dispatching.
 */

export type Listener<T> = (data: T) => void

export class Observable<T = unknown> {
  private observers = new Set<Listener<T>>()

  subscribe(listener: Listener<T>): () => void {
    this.observers.add(listener)
    // Return unsubscribe cleanup function
    return () => {
      this.observers.delete(listener)
    }
  }

  notify(data: T): void {
    for (const observer of this.observers) {
      observer(data)
    }
  }

  get subscriberCount(): number {
    return this.observers.size
  }

  clear(): void {
    this.observers.clear()
  }
}
