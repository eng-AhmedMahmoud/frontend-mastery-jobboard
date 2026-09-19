import { describe, expect, it, vi } from 'vitest'
import { batchLayout } from './batch-layout'

/**
 * A stand-in for an element that has to run layout before it can answer a geometry
 * question. Every write marks it dirty; every read on a dirty card counts one forced
 * layout — the same bargain the real browser makes.
 */
function fakeCards(count: number) {
  let forcedLayouts = 0
  let dirty = false
  const order: string[] = []

  const cards = Array.from({ length: count }, (_, index) => ({
    index,
    width: 100 + index,
    get offsetWidth() {
      order.push(`read:${index}`)
      if (dirty) {
        forcedLayouts++
        dirty = false
      }
      return this.width
    },
    setWidth(value: number) {
      order.push(`write:${index}`)
      this.width = value
      dirty = true
    },
  }))

  return {
    cards,
    order,
    get forcedLayouts() {
      return forcedLayouts
    },
  }
}

describe('batchLayout', () => {
  it('runs every read before the first write', () => {
    const { cards, order } = fakeCards(3)

    batchLayout({
      items: cards,
      measure: (card) => card.offsetWidth,
      apply: (card, width) => card.setWidth(width + 10),
    })

    expect(order).toEqual([
      'read:0',
      'read:1',
      'read:2',
      'write:0',
      'write:1',
      'write:2',
    ])
  })

  it('forces no layout at all — the read/write loop forces one per card', () => {
    const batched = fakeCards(60)
    batchLayout({
      items: batched.cards,
      measure: (card) => card.offsetWidth,
      apply: (card, width) => card.setWidth(width + 10),
    })

    const naive = fakeCards(60)
    naive.cards.forEach((card) => card.setWidth(card.offsetWidth + 10))

    expect(batched.forcedLayouts).toBe(0)
    expect(naive.forcedLayouts).toBeGreaterThan(50)
  })

  it('writes the value that was measured, not one the writes have already changed', () => {
    const { cards } = fakeCards(3)

    batchLayout({
      items: cards,
      measure: (card) => card.offsetWidth,
      apply: (card, width) => card.setWidth(width * 2),
    })

    expect(cards.map((card) => card.width)).toEqual([200, 202, 204])
  })

  it('returns the measurements it took', () => {
    const { cards } = fakeCards(3)

    const widths = batchLayout({
      items: cards,
      measure: (card) => card.offsetWidth,
      apply: () => {},
    })

    expect(widths).toEqual([100, 101, 102])
  })

  it('passes the index to both phases', () => {
    const measure = vi.fn(() => 0)
    const apply = vi.fn()

    batchLayout({ items: ['a', 'b'], measure, apply })

    expect(measure).toHaveBeenNthCalledWith(1, 'a', 0)
    expect(measure).toHaveBeenNthCalledWith(2, 'b', 1)
    expect(apply).toHaveBeenNthCalledWith(1, 'a', 0, 0)
    expect(apply).toHaveBeenNthCalledWith(2, 'b', 0, 1)
  })

  it('does nothing, and throws nothing, on an empty list', () => {
    const apply = vi.fn()

    expect(batchLayout({ items: [], measure: () => 0, apply })).toEqual([])
    expect(apply).not.toHaveBeenCalled()
  })
})
