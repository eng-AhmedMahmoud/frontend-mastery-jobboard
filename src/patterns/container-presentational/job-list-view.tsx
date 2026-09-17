/**
 * Container / Presentational Pattern (https://javascriptpatterns.vercel.app/patterns/react-patterns/con-pres)
 *
 * Presentational Component:
 * - Pure UI renderer
 * - Zero side effects, data fetching, or async timers
 * - Fully testable with simple fixtures
 */

import React from 'react'

export interface JobItem {
  id: string
  title: string
  company: string
}

export interface JobListPresentationalProps {
  jobs: JobItem[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export function JobListPresentational({
  jobs,
  isLoading,
  error,
  onRefresh,
}: JobListPresentationalProps) {
  if (isLoading) {
    return <div data-testid="loading-indicator">Loading job opportunities...</div>
  }

  if (error) {
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={onRefresh}>
          Try Again
        </button>
      </div>
    )
  }

  if (jobs.length === 0) {
    return <div>No jobs found.</div>
  }

  return (
    <div className="job-listings">
      <ul data-testid="job-list">
        {jobs.map((job) => (
          <li key={job.id} data-testid={`job-${job.id}`}>
            <strong>{job.title}</strong> — {job.company}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  )
}
