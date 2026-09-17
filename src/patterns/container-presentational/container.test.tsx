/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { JobListContainer } from './job-list-container'
import type { JobItem } from './job-list-view'

describe('Container / Presentational Pattern', () => {
  const mockJobs: JobItem[] = [
    { id: '1', title: 'Senior Frontend Engineer', company: 'Catalyst AI' },
    { id: '2', title: 'UI Systems Lead', company: 'Stripe' },
  ]

  it('renders loading state initially, then switches to loaded items', async () => {
    const fetcher = vi.fn().mockResolvedValue(mockJobs)
    render(<JobListContainer fetcher={fetcher} />)

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('job-1')).toHaveTextContent('Senior Frontend Engineer')
    })
    expect(screen.getByTestId('job-2')).toHaveTextContent('Stripe')
    expect(screen.queryByTestId('loading-indicator')).toBeNull()
  })

  it('surfaces errors through the presentational alert component', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network offline'))
    render(<JobListContainer fetcher={fetcher} />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network offline')
    })
  })
})
