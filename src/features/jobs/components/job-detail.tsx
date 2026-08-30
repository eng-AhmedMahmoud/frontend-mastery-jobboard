import type { Job } from '@/domain'
import { employerOf } from '@/data/fixtures/employers'
import { SENIORITY_LABEL, WORK_MODE_LABEL, formatPostedAt, formatSalary, initials } from '../format'

interface Props {
  job: Job | null
  now: number
  applyState: 'idle' | 'pending' | 'done'
  onApply: (jobId: string) => void
}

export function JobDetail({ job, now, applyState, onApply }: Props) {
  if (!job) {
    return (
      <aside className="detail" aria-label="Job details">
        <div className="detail-card empty-detail">Select a role to see the details.</div>
      </aside>
    )
  }

  const employer = employerOf(job)

  return (
    <aside className="detail" aria-label="Job details">
      <div className="detail-card">
        <div className="detail-head">
          <span className="logo lg" aria-hidden="true">{initials(employer.name)}</span>
          <div>
            <h2>{job.title}</h2>
            <p className="detail-employer">
              {employer.name} · {job.location}
            </p>
          </div>
        </div>

        <dl className="detail-grid">
          <div>
            <dt>Salary</dt>
            <dd>{formatSalary(job.salary)}</dd>
          </div>
          <div>
            <dt>Work mode</dt>
            <dd>{WORK_MODE_LABEL[job.workMode]}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>{SENIORITY_LABEL[job.seniority]}</dd>
          </div>
          <div>
            <dt>Applicants</dt>
            <dd>{job.applicantCount}</dd>
          </div>
        </dl>

        <div className="detail-section">
          <h3>Stack</h3>
          <div className="chips">
            {job.skills.map((skill) => (
              <span key={skill} className="chip">{skill}</span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h3>About the role</h3>
          <p>
            You'll own the interfaces {employer.name} ships to production — architecture,
            accessibility and performance included. Expect to defend your rendering choices, hold a
            Web Vitals budget, and review other engineers' components.
          </p>
        </div>

        <button
          type="button"
          className={`apply-button${applyState === 'done' ? ' is-done' : ''}`}
          onClick={() => onApply(job.id)}
          disabled={applyState !== 'idle'}
        >
          {applyState === 'done'
            ? 'Application sent ✓'
            : applyState === 'pending'
              ? 'Sending…'
              : 'Apply now'}
        </button>
        <p className="detail-foot">
          Posted {formatPostedAt(job, now).toLowerCase()} · Usually replies within a week
        </p>
      </div>
    </aside>
  )
}
