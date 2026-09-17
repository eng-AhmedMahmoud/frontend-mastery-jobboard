import { describe, it, expect, vi } from 'vitest'
import { Observable } from './observer'

describe('Observer Pattern', () => {
  it('notifies all registered subscribers on event', () => {
    const observable = new Observable<string>()
    const sub1 = vi.fn()
    const sub2 = vi.fn()

    observable.subscribe(sub1)
    observable.subscribe(sub2)

    observable.notify('new-job-posted')

    expect(sub1).toHaveBeenCalledTimes(1)
    expect(sub1).toHaveBeenCalledWith('new-job-posted')
    expect(sub2).toHaveBeenCalledTimes(1)
    expect(sub2).toHaveBeenCalledWith('new-job-posted')
  })

  it('unsubscribes cleanly using returned cleanup closure', () => {
    const observable = new Observable<number>()
    const sub = vi.fn()

    const unsubscribe = observable.subscribe(sub)
    expect(observable.subscriberCount).toBe(1)

    observable.notify(100)
    expect(sub).toHaveBeenCalledWith(100)

    unsubscribe()
    expect(observable.subscriberCount).toBe(0)

    observable.notify(200)
    expect(sub).toHaveBeenCalledTimes(1) // not called again
  })

  it('handles multiple subscriber removals without race condition errors', () => {
    const observable = new Observable<void>()
    const listenerA = vi.fn()
    const listenerB = vi.fn()

    const unsubA = observable.subscribe(listenerA)
    const unsubB = observable.subscribe(listenerB)

    unsubA()
    unsubB()

    observable.notify()
    expect(listenerA).not.toHaveBeenCalled()
    expect(listenerB).not.toHaveBeenCalled()
  })
})
