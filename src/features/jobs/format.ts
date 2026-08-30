import type { Job, SalaryRange } from '@/domain'

export const formatSalary = (salary: SalaryRange | null): string => {
  if (!salary) return 'Salary not disclosed'
  const compact = (value: number) =>
    value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
  return `${compact(salary.min)}–${compact(salary.max)} ${salary.currency} / ${salary.period === 'year' ? 'yr' : 'mo'}`
}

/** Deterministic relative time, measured from the newest posting in the data set. */
export const formatPostedAt = (job: Job, now: number): string => {
  const days = Math.floor((now - Date.parse(job.postedAt)) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}

export const WORK_MODE_LABEL = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
} as const

export const SENIORITY_LABEL = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
} as const

/** Two-letter fallback for an employer with no logo. */
export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
