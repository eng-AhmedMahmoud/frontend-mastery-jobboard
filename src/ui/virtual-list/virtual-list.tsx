/**
 * Virtual List from Scratch (No libraries)
 *
 * Implements:
 * 1. Windowing: computes visible slice based on scrollTop
 * 2. Spacer height: preserves native scrollbar physics
 * 3. GPU translation: positions items using transform: translateY(...)
 * 4. Fixed memory DOM footprint: renders only ~10-15 DOM nodes regardless of 100k items.
 */

import React, { useState, type UIEvent, type ReactNode } from 'react'

export interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  viewportHeight: number
  buffer?: number
  renderItem: (item: T, index: number) => ReactNode
}

export function VirtualList<T>({
  items,
  itemHeight,
  viewportHeight,
  buffer = 2,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer
  )

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      data-testid="virtual-viewport"
      onScroll={handleScroll}
      style={{
        height: `${viewportHeight}px`,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Spacer to give full scroll height */}
      <div
        data-testid="virtual-spacer"
        style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}
      >
        {visibleItems.map((item, i) => {
          const actualIndex = startIndex + i
          return (
            <div
              key={actualIndex}
              data-testid={`virtual-row-${actualIndex}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: `${itemHeight}px`,
                transform: `translateY(${actualIndex * itemHeight}px)`,
                willChange: 'transform',
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
