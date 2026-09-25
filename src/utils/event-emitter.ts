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
    throw new Error('Not implemented')
  }

  once<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): Unsubscribe {
    throw new Error('Not implemented')
  }

  off<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): void {
    throw new Error('Not implemented')
  }

  emit<Name extends keyof Events>(event: Name, payload: Events[Name]): void {
    throw new Error('Not implemented')
  }

  listenerCount(event: keyof Events): number {
    return 0
  }
}
