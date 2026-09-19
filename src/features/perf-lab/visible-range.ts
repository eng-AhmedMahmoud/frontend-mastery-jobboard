// visibleRange — the cheapest optimisation there is: stop doing the work.
// Rasmi's results list holds 600 job cards. Roughly twelve of them are on screen.
// This function answers "which twelve, and how far down the page do they start?"
// It is pure arithmetic — no DOM, no React — which is exactly why it is testable.

export interface VisibleRangeInput {
  /** How far the scroll container has been scrolled, in pixels. */
  scrollTop: number
  /** The height of the scroll container itself, in pixels. */
  viewportHeight: number
  /** Every row is the same height in this stage. Variable heights are module 7. */
  rowHeight: number
  /** How many rows exist in total. */
  count: number
  /** Extra rows rendered above and below the viewport, so a fast scroll never shows a gap. */
  overscan?: number
}

export interface VisibleRange {
  /** First row to render, inclusive. */
  startIndex: number
  /** Last row to render, inclusive. `-1` when there is nothing to render. */
  endIndex: number
  /** Pixels to push the rendered rows down by, so the scrollbar stays honest. */
  offsetY: number
  /** Height of the full list, rendered or not — this is what gives the scrollbar its size. */
  totalHeight: number
}

export function visibleRange({
  scrollTop,
  viewportHeight,
  rowHeight,
  count,
  overscan = 3,
}: VisibleRangeInput): VisibleRange {
  // TODO 1: Start with the maths on paper: the first visible row is `scrollTop / rowHeight`, floored. The last is `(scrollTop + viewportHeight) / rowHeight`, ceiled.
  // TODO 2: Then apply the overscan, and only then clamp. Clamping before the overscan lets the range walk off the ends of the list.
  // TODO 3: `endIndex` is inclusive, so an empty list must produce `-1` — not `0`, which would render a row that does not exist.
  // TODO 4: `offsetY` is `startIndex * rowHeight`. It is what keeps row 400 drawn where row 400 belongs instead of at the top of the container.
  // TODO 5: Guard the degenerate inputs the browser will genuinely hand you: `count` of 0 during the first render, and a `rowHeight` of 0 before layout has run.
  throw new Error('Not implemented')
}
