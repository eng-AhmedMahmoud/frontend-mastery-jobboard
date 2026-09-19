import { describe, expect, it } from 'vitest'
import { visibleRange } from './visible-range'

const list = { viewportHeight: 600, rowHeight: 60, count: 600 }

describe('visibleRange', () => {
  it('renders the rows on screen plus the overscan, at the top of the list', () => {
    const range = visibleRange({ ...list, scrollTop: 0, overscan: 3 })

    expect(range.startIndex).toBe(0)
    expect(range.endIndex).toBe(12)
  })

  it('never starts before the first row', () => {
    const range = visibleRange({ ...list, scrollTop: 0, overscan: 10 })

    expect(range.startIndex).toBe(0)
  })

  it('never ends past the last row', () => {
    const range = visibleRange({ ...list, scrollTop: 600 * 60, overscan: 10 })

    expect(range.endIndex).toBe(599)
  })

  it('moves the window as the container scrolls', () => {
    const range = visibleRange({ ...list, scrollTop: 6000, overscan: 2 })

    // 6000 / 60 = row 100 at the top, ten rows visible, two of overscan on each side.
    expect(range.startIndex).toBe(98)
    expect(range.endIndex).toBe(111)
  })

  it('reports the offset that keeps the rendered rows where they belong', () => {
    const range = visibleRange({ ...list, scrollTop: 6000, overscan: 2 })

    expect(range.offsetY).toBe(range.startIndex * 60)
  })

  it('reports the full list height, so the scrollbar stays honest', () => {
    const range = visibleRange({ ...list, scrollTop: 0 })

    expect(range.totalHeight).toBe(600 * 60)
  })

  it('renders nothing when the list is empty', () => {
    const range = visibleRange({ ...list, count: 0, scrollTop: 0 })

    expect(range).toEqual({ startIndex: 0, endIndex: -1, offsetY: 0, totalHeight: 0 })
  })

  it('survives a row height of zero, which is what the first render hands you', () => {
    const range = visibleRange({ ...list, rowHeight: 0, scrollTop: 0 })

    expect(range.endIndex).toBe(-1)
  })

  it('treats a negative scrollTop — an elastic overscroll — as the top', () => {
    const range = visibleRange({ ...list, scrollTop: -220, overscan: 0 })

    expect(range.startIndex).toBe(0)
  })

  it('renders far fewer rows than the list holds — the whole point of the exercise', () => {
    const range = visibleRange({ ...list, scrollTop: 12_000, overscan: 3 })
    const rendered = range.endIndex - range.startIndex + 1

    expect(rendered).toBeLessThan(25)
  })
})
