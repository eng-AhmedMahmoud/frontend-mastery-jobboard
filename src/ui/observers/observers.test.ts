/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { observeIntersection, observeResize, observeMutations } from './observers'

describe('Web Platform Observers', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target">Target</div>'
  })

  it('connects and disconnects IntersectionObserver cleanly', () => {
    let capturedCallback: (entries: IntersectionObserverEntry[]) => void = () => {}
    const disconnectSpy = vi.fn()

    // Mock IntersectionObserver
    class MockIntersectionObserver {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        capturedCallback = cb
      }
      observe = vi.fn()
      disconnect = disconnectSpy
      unobserve = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    const target = document.getElementById('target')!
    const onIntersect = vi.fn()

    const cleanup = observeIntersection(target, onIntersect)

    // Simulate viewport intersection trigger
    capturedCallback([{ isIntersecting: true } as IntersectionObserverEntry])
    expect(onIntersect).toHaveBeenCalledWith(true, expect.anything())

    cleanup()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })

  it('connects and disconnects ResizeObserver cleanly', () => {
    let capturedCallback: (entries: ResizeObserverEntry[]) => void = () => {}
    const disconnectSpy = vi.fn()

    class MockResizeObserver {
      constructor(cb: (entries: ResizeObserverEntry[]) => void) {
        capturedCallback = cb
      }
      observe = vi.fn()
      disconnect = disconnectSpy
      unobserve = vi.fn()
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    const target = document.getElementById('target')!
    const onResize = vi.fn()

    const cleanup = observeResize(target, onResize)

    capturedCallback([
      { contentRect: { width: 320, height: 480 } } as unknown as ResizeObserverEntry,
    ])
    expect(onResize).toHaveBeenCalledWith(
      expect.objectContaining({ width: 320, height: 480 }),
      expect.anything()
    )

    cleanup()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})
