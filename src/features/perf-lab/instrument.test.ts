import { describe, expect, it, vi } from 'vitest'
import { isLongTask, LONG_TASK_MS, measure } from './instrument'

/** A clock that moves only when a test says so, plus a log of the User Timing calls. */
function fakeClock(steps: number[]) {
  const timeline = [...steps]
  const calls: string[] = []
  let last = timeline[0] ?? 0

  return {
    calls,
    perf: {
      now: () => {
        last = timeline.shift() ?? last
        return last
      },
      mark: (name: string) => calls.push(`mark:${name}`),
      measure: (name: string, start: string, end: string) =>
        calls.push(`measure:${name}:${start}:${end}`),
    },
  }
}

describe('measure', () => {
  it('returns what the callback returned', () => {
    const { perf } = fakeClock([0, 5])

    expect(measure('render', () => 42, perf).result).toBe(42)
  })

  it('reports the elapsed time on the same clock DevTools uses', () => {
    const { perf } = fakeClock([1_000, 1_083.5])

    expect(measure('render', () => null, perf).duration).toBeCloseTo(83.5)
  })

  it('leaves a named band in the Performance panel', () => {
    const { perf, calls } = fakeClock([0, 10])

    measure('filter-jobs', () => null, perf)

    expect(calls).toEqual([
      'mark:filter-jobs:start',
      'mark:filter-jobs:end',
      'measure:filter-jobs:filter-jobs:start:filter-jobs:end',
    ])
  })

  it('still records the timing when the callback throws', () => {
    const { perf, calls } = fakeClock([0, 120])

    expect(() =>
      measure('explode', () => {
        throw new Error('boom')
      }, perf),
    ).toThrow('boom')

    expect(calls).toContain('measure:explode:explode:start:explode:end')
  })

  it('works on a clock with no User Timing API at all', () => {
    let now = 0
    const bare = { now: () => (now += 16) }

    expect(() => measure('bare', () => null, bare)).not.toThrow()
  })

  it('measures in call order when nested', () => {
    const { perf, calls } = fakeClock([0, 1, 2, 3])

    measure('outer', () => measure('inner', () => null, perf), perf)

    expect(calls[0]).toBe('mark:outer:start')
    expect(calls.at(-1)).toBe('measure:outer:outer:start:outer:end')
  })

  it('calls the callback exactly once', () => {
    const { perf } = fakeClock([0, 1])
    const spy = vi.fn()

    measure('once', spy, perf)

    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('isLongTask', () => {
  it('is false for work that fits inside a frame', () => {
    expect(isLongTask(12)).toBe(false)
  })

  it('is true at the 50ms threshold', () => {
    expect(isLongTask(LONG_TASK_MS)).toBe(true)
  })

  it('is true for the 80ms handler that drops three frames', () => {
    expect(isLongTask(80)).toBe(true)
  })
})
