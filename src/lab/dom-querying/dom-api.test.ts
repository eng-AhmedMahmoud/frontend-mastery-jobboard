/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { buildElementIndex, batchResizeElements, appendBatchedItems } from './dom-api'

describe('DOM API & Layout Optimization Lab', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('builds an O(1) element index from data-id attributes', () => {
    container.innerHTML = `
      <div data-id="job-1">Job 1</div>
      <div data-id="job-2">Job 2</div>
      <div data-id="job-3">Job 3</div>
    `

    const index = buildElementIndex(container)
    expect(index.size).toBe(3)
    expect(index.get('job-2')?.textContent).toBe('Job 2')
    expect(index.get('job-999')).toBeUndefined()
  })

  it('batches reads and writes without interleaved thrashing', () => {
    const items: HTMLElement[] = []
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div')
      Object.defineProperty(el, 'offsetHeight', { value: 100 + i * 10, configurable: true })
      container.appendChild(el)
      items.push(el)
    }

    const { reads, writes } = batchResizeElements(items, 2)
    expect(reads).toBe(5)
    expect(writes).toBe(5)
    expect(items[0]!.style.height).toBe('200px')
    expect(items[4]!.style.height).toBe('280px')
  })

  it('batches DOM insertions in a single DocumentFragment append', () => {
    const records = [
      { id: '101', text: 'Senior Frontend' },
      { id: '102', text: 'Staff Architect' },
      { id: '103', text: 'Engineering Manager' },
    ]

    appendBatchedItems(container, records)
    expect(container.children).toHaveLength(3)
    expect(container.querySelector('[data-id="102"]')?.textContent).toBe('Staff Architect')
  })
})
