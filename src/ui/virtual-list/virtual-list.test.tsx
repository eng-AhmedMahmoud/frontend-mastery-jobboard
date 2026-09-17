/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VirtualList } from './virtual-list'

describe('Virtual List from Scratch', () => {
  const thousandJobs = Array.from({ length: 1000 }, (_, i) => ({
    id: `job-${i}`,
    title: `Job Title #${i}`,
  }))

  it('renders only the visible slice plus buffer, not the whole dataset', () => {
    render(
      <VirtualList
        items={thousandJobs}
        itemHeight={50}
        viewportHeight={200}
        buffer={2}
        renderItem={(job) => <span>{job.title}</span>}
      />
    )

    const spacer = screen.getByTestId('virtual-spacer')
    expect(spacer.style.height).toBe('50000px')

    // At scrollTop = 0, visible count = 200/50 = 4 rows. With buffer 2 on bottom: ~6 rows.
    expect(screen.getByTestId('virtual-row-0')).toBeInTheDocument()
    expect(screen.getByTestId('virtual-row-5')).toBeInTheDocument()
    expect(screen.queryByTestId('virtual-row-50')).toBeNull()
    expect(screen.queryByTestId('virtual-row-999')).toBeNull()
  })

  it('updates rendered window on scroll', () => {
    render(
      <VirtualList
        items={thousandJobs}
        itemHeight={50}
        viewportHeight={200}
        buffer={1}
        renderItem={(job) => <span>{job.title}</span>}
      />
    )

    const viewport = screen.getByTestId('virtual-viewport')
    // Scroll down to 1000px (row index 20)
    fireEvent.scroll(viewport, { target: { scrollTop: 1000 } })

    // Row 0 should be recycled/unmounted from the DOM
    expect(screen.queryByTestId('virtual-row-0')).toBeNull()
    // Row 20 should now be rendered
    expect(screen.getByTestId('virtual-row-20')).toBeInTheDocument()
    expect(screen.getByTestId('virtual-row-20').style.transform).toBe('translateY(1000px)')
  })
})
