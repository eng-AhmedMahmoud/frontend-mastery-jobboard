/**
 * DOM API & Layout Optimization Lab
 *
 * Demonstrates:
 * 1. Single-pass Map indexing O(1) vs repetitive querySelectorAll O(N^2)
 * 2. Layout Thrashing (interleaved read/write) vs FastDOM / Batched read/write
 * 3. DocumentFragment batch insertion vs iterative appendChild
 */

export interface ElementRecord {
  id: string
  height: number
}

/**
 * Creates an in-memory O(1) hashmap indexing elements by data-id.
 * Replaces O(N) querySelector iterations with O(1) direct pointer lookups.
 */
export function buildElementIndex(container: HTMLElement): Map<string, HTMLElement> {
  const index = new Map<string, HTMLElement>()
  const elements = container.querySelectorAll<HTMLElement>('[data-id]')
  for (const el of elements) {
    const id = el.getAttribute('data-id')
    if (id) {
      index.set(id, el)
    }
  }
  return index
}

/**
 * Batched layout updates: reads all layout measurements in Phase 1,
 * then writes all mutations in Phase 2.
 * Prevents synchronous layout thrashing (forced synchronous layout).
 */
export function batchResizeElements(
  elements: HTMLElement[],
  multiplier: number
): { reads: number; writes: number } {
  // Phase 1: Pure Reads (Browser computes layout once for all reads)
  const measurements: number[] = []
  for (const el of elements) {
    measurements.push(el.offsetHeight)
  }

  // Phase 2: Pure Writes (Browser queues mutations without thrashing)
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    const m = measurements[i]
    if (el !== undefined && m !== undefined) {
      el.style.height = `${m * multiplier}px`
    }
  }

  return { reads: elements.length, writes: elements.length }
}

/**
 * Batched insertion using DocumentFragment.
 * Only 1 DOM tree reflow occurs upon appending the fragment.
 */
export function appendBatchedItems(
  container: HTMLElement,
  items: Array<{ id: string; text: string }>
): DocumentFragment {
  const fragment = document.createDocumentFragment()

  for (const item of items) {
    const div = document.createElement('div')
    div.setAttribute('data-id', item.id)
    div.textContent = item.text
    fragment.appendChild(div)
  }

  container.appendChild(fragment)
  return fragment
}
