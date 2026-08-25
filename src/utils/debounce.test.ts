import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does not call the function immediately', () => {
    const spy = vi.fn()
    debounce(spy, 100)()
    expect(spy).not.toHaveBeenCalled()
  })

  it('calls the function once the wait has elapsed', () => {
    const spy = vi.fn()
    debounce(spy, 100)()
    vi.advanceTimersByTime(100)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('collapses a burst of calls into one', () => {
    const spy = vi.fn()
    const debounced = debounce(spy, 100)

    debounced()
    vi.advanceTimersByTime(40)
    debounced()
    vi.advanceTimersByTime(40)
    debounced()
    vi.advanceTimersByTime(100)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('calls through with the arguments of the most recent call', () => {
    const spy = vi.fn<(term: string) => void>()
    const debounced = debounce(spy, 100)

    debounced('seni')
    debounced('senio')
    debounced('senior')
    vi.advanceTimersByTime(100)

    expect(spy).toHaveBeenCalledWith('senior')
  })

  it('restarts the timer on every call', () => {
    const spy = vi.fn()
    const debounced = debounce(spy, 100)

    debounced()
    vi.advanceTimersByTime(90)
    debounced()
    vi.advanceTimersByTime(90)

    expect(spy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(10)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('cancel() drops a pending call', () => {
    const spy = vi.fn()
    const debounced = debounce(spy, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(500)

    expect(spy).not.toHaveBeenCalled()
  })

  it('flush() runs a pending call immediately, and only once', () => {
    const spy = vi.fn<(term: string) => void>()
    const debounced = debounce(spy, 100)

    debounced('remote')
    debounced.flush()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('remote')
    vi.advanceTimersByTime(500)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('flush() with nothing pending does nothing', () => {
    const spy = vi.fn()
    debounce(spy, 100).flush()
    expect(spy).not.toHaveBeenCalled()
  })

  it('forwards `this` to the original function', () => {
    const context = {
      value: 'cairo',
      read(this: { value: string }) {
        seen = this.value
      },
    }
    let seen = ''

    const debounced = debounce(context.read, 100)
    debounced.call(context)
    vi.advanceTimersByTime(100)

    expect(seen).toBe('cairo')
  })
})
