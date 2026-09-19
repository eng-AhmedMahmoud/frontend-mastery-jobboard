import { describe, expect, it, vi } from 'vitest'
import { rafSchedule } from './raf-schedule'

/** A hand-cranked frame loop, so a test can decide exactly when a frame happens. */
function fakeFrames() {
  const queue = new Map<number, () => void>()
  let nextHandle = 1

  return {
    requestFrame: (callback: () => void) => {
      const handle = nextHandle++
      queue.set(handle, callback)
      return handle
    },
    cancelFrame: (handle: number) => {
      queue.delete(handle)
    },
    /** Run every callback queued for the next frame. */
    tick() {
      const due = [...queue.values()]
      queue.clear()
      due.forEach((callback) => callback())
    },
    get pending() {
      return queue.size
    },
  }
}

describe('rafSchedule', () => {
  it('does not run the handler until a frame arrives', () => {
    const frames = fakeFrames()
    const spy = vi.fn()

    rafSchedule(spy, frames)()

    expect(spy).not.toHaveBeenCalled()
    frames.tick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('collapses many calls in one frame into a single run', () => {
    const frames = fakeFrames()
    const spy = vi.fn()
    const onScroll = rafSchedule(spy, frames)

    for (let i = 0; i < 50; i++) onScroll()
    frames.tick()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('requests one frame, not one per call', () => {
    const frames = fakeFrames()
    const onScroll = rafSchedule(vi.fn(), frames)

    onScroll()
    onScroll()
    onScroll()

    expect(frames.pending).toBe(1)
  })

  it('runs with the newest arguments, not the oldest', () => {
    const frames = fakeFrames()
    const spy = vi.fn<(scrollTop: number) => void>()
    const onScroll = rafSchedule(spy, frames)

    onScroll(0)
    onScroll(400)
    onScroll(1200)
    frames.tick()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1200)
  })

  it('schedules again on the next frame', () => {
    const frames = fakeFrames()
    const spy = vi.fn()
    const onScroll = rafSchedule(spy, frames)

    onScroll()
    frames.tick()
    onScroll()
    frames.tick()

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('lets the handler schedule itself from inside the frame', () => {
    const frames = fakeFrames()
    let runs = 0
    const onScroll = rafSchedule(() => {
      runs++
      if (runs < 3) onScroll()
    }, frames)

    onScroll()
    frames.tick()
    frames.tick()
    frames.tick()

    expect(runs).toBe(3)
  })

  it('keeps the receiver of a method call', () => {
    const frames = fakeFrames()
    const list = {
      top: 0,
      handle(this: { top: number }, value: number) {
        this.top = value
      },
    }
    const onScroll = rafSchedule(list.handle, frames)

    onScroll.call(list, 320)
    frames.tick()

    expect(list.top).toBe(320)
  })

  it('cancel() drops a frame that has been requested but not run', () => {
    const frames = fakeFrames()
    const spy = vi.fn()
    const onScroll = rafSchedule(spy, frames)

    onScroll()
    onScroll.cancel()
    frames.tick()

    expect(spy).not.toHaveBeenCalled()
    expect(frames.pending).toBe(0)
  })

  it('cancel() does not leak the pending arguments into a later frame', () => {
    const frames = fakeFrames()
    const spy = vi.fn<(scrollTop: number) => void>()
    const onScroll = rafSchedule(spy, frames)

    onScroll(900)
    onScroll.cancel()
    onScroll(10)
    frames.tick()

    expect(spy).toHaveBeenCalledWith(10)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
