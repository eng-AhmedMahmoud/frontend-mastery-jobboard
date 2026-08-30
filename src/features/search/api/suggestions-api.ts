import { suggestJobs } from '@/data/server/jobs-server'
import type { JobSuggestion } from '../components/search-autocomplete'

/** The client side of the search endpoint. Swapped for a real fetch in module 9. */
export const fetchSuggestions = (query: string, signal: AbortSignal): Promise<JobSuggestion[]> =>
  suggestJobs(query, signal)
