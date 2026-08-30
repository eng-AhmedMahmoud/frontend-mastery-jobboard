import type { Job, JobFilters } from '@/domain'
import { searchJobs } from '@/data/server/jobs-server'

/** The client side of the jobs endpoint. Becomes a real fetch + TanStack Query in module 8. */
export const fetchJobs = (filters: JobFilters, signal?: AbortSignal): Promise<Job[]> =>
  searchJobs(filters, signal)
