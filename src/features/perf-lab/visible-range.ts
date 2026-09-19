// #note visibleRange — the cheapest optimisation there is: stop doing the work.
// #note Rasmi's results list holds 600 job cards. Roughly twelve of them are on screen.
// #note This function answers "which twelve, and how far down the page do they start?"
// #note It is pure arithmetic — no DOM, no React — which is exactly why it is testable.

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
  // #hint 1 Start with the maths on paper: the first visible row is `scrollTop / rowHeight`, floored. The last is `(scrollTop + viewportHeight) / rowHeight`, ceiled.
  // #hint 2 Then apply the overscan, and only then clamp. Clamping before the overscan lets the range walk off the ends of the list.
  // #hint 3 `endIndex` is inclusive, so an empty list must produce `-1` — not `0`, which would render a row that does not exist.
  // #hint 4 `offsetY` is `startIndex * rowHeight`. It is what keeps row 400 drawn where row 400 belongs instead of at the top of the container.
  // #hint 5 Guard the degenerate inputs the browser will genuinely hand you: `count` of 0 during the first render, and a `rowHeight` of 0 before layout has run.
  // #region solution
  if (count <= 0 || rowHeight <= 0) {
    return { startIndex: 0, endIndex: -1, offsetY: 0, totalHeight: 0 }
  }

  const totalHeight = count * rowHeight
  const safeScrollTop = Math.max(0, scrollTop)

  const firstVisible = Math.floor(safeScrollTop / rowHeight)
  const lastVisible = Math.ceil((safeScrollTop + Math.max(0, viewportHeight)) / rowHeight) - 1

  const startIndex = Math.max(0, firstVisible - overscan)
  const endIndex = Math.min(count - 1, Math.max(firstVisible, lastVisible) + overscan)

  return {
    startIndex,
    endIndex,
    offsetY: startIndex * rowHeight,
    totalHeight,
  }
  // #endregion
}
