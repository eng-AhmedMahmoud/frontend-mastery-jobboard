import { useEffect, useRef, useState } from 'react'
import type { Job, JobFilters } from '@/domain'
import { fetchJobs } from '../api/jobs-api'

export const EMPTY_FILTERS: JobFilters = {
  query: '',
  workMode: [],
  seniority: [],
  minSalary: null,
}

/**
 * Owns the search: the typed term settles into the filters on a quiet period, every
 * filter change refetches, and a stale response can never overwrite a newer one.
 *
 * The sequence number and the AbortController do different jobs — the controller stops
 * the wasted network, the sequence number keeps the UI correct when a response the
 * controller did not catch lands late. Module 8 replaces both with TanStack Query.
 */
export function useJobSearch(searchTerm: string, settleMs = 250) {
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const requestSeq = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.query === searchTerm ? current : { ...current, query: searchTerm },
      )
    }, settleMs)
    return () => clearTimeout(timer)
  }, [searchTerm, settleMs])

  useEffect(() => {
    const seq = ++requestSeq.current
    const controller = new AbortController()
    // Fetching in an effect and flipping a loading flag is exactly the pattern React
    // tells you to hand to a library — and in module 8 we do, with TanStack Query.
    // Until then this is the honest hand-rolled version, kept so the student sees what
    // the library is actually doing for them.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)

    fetchJobs(filters, controller.signal)
      .then((results) => {
        if (seq !== requestSeq.current) return
        setJobs(results)
        setIsLoading(false)
      })
      .catch(() => {
        /* aborted — a newer request is already in flight */
      })

    return () => controller.abort()
  }, [filters])

  const activeFilterCount =
    filters.workMode.length + filters.seniority.length + (filters.minSalary === null ? 0 : 1)

  return { jobs, isLoading, filters, setFilters, activeFilterCount }
}
