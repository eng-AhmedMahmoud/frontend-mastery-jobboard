// #note EventEmitter — subscribe, unsubscribe, emit. The pattern under every toast system,
// #note websocket client and pub/sub layer you'll write. Module 7's toasts use this one.
// #note The listener store is given to you; the four methods are yours.

export type Listener<Payload> = (payload: Payload) => void

export interface Unsubscribe {
  (): void
}

export class EventEmitter<Events extends Record<string, unknown>> {
  /** event name → the listeners registered for it */
  #listeners = new Map<keyof Events, Set<Listener<never>>>()

  on<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): Unsubscribe {
    // #hint 1 A Set per event gives you free de-duplication and O(1) removal.
    // #hint 2 Return an unsubscribe function. That's the modern API shape — it saves the caller from holding on to the exact function they passed in.
    // #region solution
    const existing = this.#listeners.get(event) ?? new Set<Listener<never>>()
    existing.add(listener as Listener<never>)
    this.#listeners.set(event, existing)
    return () => this.off(event, listener)
    // #endregion
  }

  once<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): Unsubscribe {
    // #hint 3 `once` is `on` plus a wrapper that unsubscribes itself. Unsubscribe BEFORE calling through, so a listener that throws still doesn't fire twice.
    // #region solution
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe()
      listener(payload)
    })
    return unsubscribe
    // #endregion
  }

  off<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): void {
    // #hint 4 Delete the event key entirely once its set is empty, otherwise the map grows forever in a long-lived app.
    // #region solution
    const existing = this.#listeners.get(event)
    if (!existing) return
    existing.delete(listener as Listener<never>)
    if (existing.size === 0) this.#listeners.delete(event)
    // #endregion
  }

  emit<Name extends keyof Events>(event: Name, payload: Events[Name]): void {
    // #hint 5 Iterate over a COPY of the set. A listener that unsubscribes during emit would otherwise mutate the collection you're iterating — this is the bug interviewers probe for.
    // #region solution
    const existing = this.#listeners.get(event)
    if (!existing) return
    for (const listener of [...existing]) (listener as Listener<Events[Name]>)(payload)
    // #endregion
  }

  listenerCount(event: keyof Events): number {
    // #placeholder return 0
    // #region solution
    return this.#listeners.get(event)?.size ?? 0
    // #endregion
  }
}
