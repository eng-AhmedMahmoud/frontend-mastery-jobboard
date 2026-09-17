/**
 * Container / Presentational Pattern
 *
 * Container Component:
 * - Handles data fetching, state management, and lifecycle hooks
 * - Passes pure data and handlers to the presentational view
 */

import React, { useState, useEffect, useCallback } from 'react'
import { JobListPresentational, type JobItem } from './job-list-view'

export interface JobListContainerProps {
  fetcher: () => Promise<JobItem[]>
}

export function JobListContainer({ fetcher }: JobListContainerProps) {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetcher()
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <JobListPresentational
      jobs={jobs}
      isLoading={isLoading}
      error={error}
      onRefresh={loadData}
    />
  )
}
