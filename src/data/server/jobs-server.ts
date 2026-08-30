import type { Job, JobFilters } from '@/domain'
import { JOBS } from '@/data/fixtures/jobs'
import { employerOf } from '@/data/fixtures/employers'
import { latency, wait } from './latency'

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

/** Rough EGP-equivalent monthly figure, so one slider can compare five currencies. */
const monthlyEgpEquivalent = (job: Job) => {
  if (!job.salary) return null
  const monthly = job.salary.period === 'year' ? job.salary.max / 12 : job.salary.max
  return job.salary.currency === 'EGP' ? monthly : monthly * 30
}

export async function searchJobs(filters: JobFilters, signal?: AbortSignal): Promise<Job[]> {
  await wait(latency(), signal)

  return JOBS.filter((job) => {
    if (!matches(job, filters.query)) return false
    if (filters.workMode.length && !filters.workMode.includes(job.workMode)) return false
    if (filters.seniority.length && !filters.seniority.includes(job.seniority)) return false
    if (filters.minSalary !== null) {
      const normalised = monthlyEgpEquivalent(job)
      if (normalised === null || normalised < filters.minSalary) return false
    }
    return true
  }).sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
}

export async function suggestJobs(query: string, signal: AbortSignal) {
  await wait(latency(), signal)
  return JOBS.filter((job) => matches(job, query))
    .slice(0, 6)
    .map((job) => ({ id: job.id, title: job.title, employerName: employerOf(job).name }))
}
