import type { Job, JobFilters } from '@/domain/types'
import type { JobSuggestion } from '@/components/autocomplete/search-autocomplete'
import { JOBS, employerOf } from '@/data/jobs'

/**
 * A fake API with real API behaviour: latency that varies, cancellation, and
 * responses that can arrive out of order. The UI has to survive all three.
 */

const latency = () => 180 + Math.random() * 420

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

const matches = (job: Job, query: string) => {
  const term = query.trim().toLowerCase()
  if (!term) return true
  return (
    job.title.toLowerCase().includes(term) ||
    employerOf(job).name.toLowerCase().includes(term) ||
    job.skills.some((skill) => skill.toLowerCase().includes(term)) ||
    job.location.toLowerCase().includes(term)
  )
}

export async function fetchSuggestions(query: string, signal: AbortSignal): Promise<JobSuggestion[]> {
  await wait(latency(), signal)
  return JOBS.filter((job) => matches(job, query))
    .slice(0, 6)
    .map((job) => ({ id: job.id, title: job.title, employerName: employerOf(job).name }))
}

export async function fetchJobs(filters: JobFilters, signal?: AbortSignal): Promise<Job[]> {
  await wait(latency(), signal)

  return JOBS.filter((job) => {
    if (!matches(job, filters.query)) return false
    if (filters.workMode.length && !filters.workMode.includes(job.workMode)) return false
    if (filters.seniority.length && !filters.seniority.includes(job.seniority)) return false
    if (filters.minSalary !== null) {
      if (!job.salary) return false
      const monthly = job.salary.period === 'year' ? job.salary.max / 12 : job.salary.max
      const normalised = job.salary.currency === 'EGP' ? monthly : monthly * 30 // rough EGP-equivalent
      if (normalised < filters.minSalary) return false
    }
    return true
  }).sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
}

export async function submitApplication(jobId: string): Promise<{ jobId: string }> {
  await wait(700)
  return { jobId }
}
