/**
 * Jobs — the listings feed and the job detail panel.
 *
 * The front door of the feature: the composition root imports from here, never from a
 * file inside. Modules 5 and 8 own it.
 */
export { JobFilters } from './components/job-filters'
export { JobList } from './components/job-list'
export { JobDetail } from './components/job-detail'
export { useJobSearch, EMPTY_FILTERS } from './hooks/use-job-search'
export { fetchJobs } from './api/jobs-api'
