// EventEmitter — subscribe, unsubscribe, emit. The pattern under every toast system,
// websocket client and pub/sub layer you'll write. Module 7's toasts use this one.
// The listener store is given to you; the four methods are yours.

export type Listener<Payload> = (payload: Payload) => void

export interface Unsubscribe {
  (): void
}

export class EventEmitter<Events extends Record<string, unknown>> {
  /** event name → the listeners registered for it */
  #listeners = new Map<keyof Events, Set<Listener<never>>>()

  on<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): Unsubscribe {
    const existing = this.#listeners.get(event) ?? new Set<Listener<never>>()
    existing.add(listener as Listener<never>)
    this.#listeners.set(event, existing)
    return () => this.off(event, listener)
  }

  once<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): Unsubscribe {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe()
      listener(payload)
    })
    return unsubscribe
  }

  off<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): void {
    const existing = this.#listeners.get(event)
    if (!existing) return
    existing.delete(listener as Listener<never>)
    if (existing.size === 0) this.#listeners.delete(event)
  }

  emit<Name extends keyof Events>(event: Name, payload: Events[Name]): void {
    const existing = this.#listeners.get(event)
    if (!existing) return
    for (const listener of [...existing]) (listener as Listener<Events[Name]>)(payload)
  }

  listenerCount(event: keyof Events): number {
    return this.#listeners.get(event)?.size ?? 0
  }
}
