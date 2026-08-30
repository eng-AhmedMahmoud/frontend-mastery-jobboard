import type { Job } from '@/domain'
import { employerOf } from '@/data/fixtures/employers'
import { SENIORITY_LABEL, WORK_MODE_LABEL, formatPostedAt, formatSalary, initials } from '../format'

interface Props {
  job: Job
  isSelected: boolean
  hasApplied: boolean
  now: number
  onSelect: (jobId: string) => void
}

export function JobCard({ job, isSelected, hasApplied, now, onSelect }: Props) {
  const employer = employerOf(job)
  return (
    <button
      type="button"
      className={`job-card${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(job.id)}
      aria-current={isSelected}
    >
      <span className="logo" aria-hidden="true">{initials(employer.name)}</span>
      <span className="job-main">
        <span className="job-title">{job.title}</span>
        <span className="job-employer">
          {employer.name} · {job.location}
        </span>
        <span className="chips">
          <span className="chip">{WORK_MODE_LABEL[job.workMode]}</span>
          <span className="chip">{SENIORITY_LABEL[job.seniority]}</span>
          {job.skills.slice(0, 2).map((skill) => (
            <span key={skill} className="chip subtle">{skill}</span>
          ))}
        </span>
      </span>
      <span className="job-meta">
        <span className="salary">{formatSalary(job.salary)}</span>
        <span className="posted">{formatPostedAt(job, now)}</span>
        {hasApplied && <span className="applied-tag">Applied</span>}
      </span>
    </button>
  )
}
