import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls through immediately on the leading edge', () => {
    const spy = vi.fn()
    throttle(spy, 100)()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('ignores extra calls inside the same window, apart from the trailing one', () => {
    const spy = vi.fn()
    const throttled = throttle(spy, 100)

    throttled()
    throttled()
    throttled()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('fires a trailing call with the latest arguments', () => {
    const spy = vi.fn<(offset: number) => void>()
    const throttled = throttle(spy, 100)

    throttled(0)
    throttled(120)
    throttled(240)
    vi.advanceTimersByTime(100)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(240)
  })

  it('allows one call per window over time', () => {
    const spy = vi.fn()
    const throttled = throttle(spy, 100, { trailing: false })

    throttled()
    vi.advanceTimersByTime(100)
    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with leading: false, skips the first call and waits for the trailing one', () => {
    const spy = vi.fn()
    const throttled = throttle(spy, 100, { leading: false })

    throttled()
    expect(spy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('with trailing: false, never fires after the window closes', () => {
    const spy = vi.fn()
    const throttled = throttle(spy, 100, { trailing: false })

    throttled()
    throttled()
    vi.advanceTimersByTime(500)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('cancel() drops a pending trailing call', () => {
    const spy = vi.fn()
    const throttled = throttle(spy, 100)

    throttled()
    throttled()
    throttled.cancel()
    vi.advanceTimersByTime(500)

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
