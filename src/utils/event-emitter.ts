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
    // TODO 1: A Set per event gives you free de-duplication and O(1) removal.
    // TODO 2: Return an unsubscribe function. That's the modern API shape — it saves the caller from holding on to the exact function they passed in.
    throw new Error('Not implemented')
  }

  once<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): Unsubscribe {
    // TODO 3: `once` is `on` plus a wrapper that unsubscribes itself. Unsubscribe BEFORE calling through, so a listener that throws still doesn't fire twice.
    throw new Error('Not implemented')
  }

  off<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): void {
    // TODO 4: Delete the event key entirely once its set is empty, otherwise the map grows forever in a long-lived app.
    throw new Error('Not implemented')
  }

  emit<Name extends keyof Events>(event: Name, payload: Events[Name]): void {
    // TODO 5: Iterate over a COPY of the set. A listener that unsubscribes during emit would otherwise mutate the collection you're iterating — this is the bug interviewers probe for.
    throw new Error('Not implemented')
  }

  listenerCount(event: keyof Events): number {
    return 0
  }
}
