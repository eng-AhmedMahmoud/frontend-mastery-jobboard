import type { Job } from '@/domain'
import { JobCard } from './job-card'

interface Props {
  jobs: Job[]
  isLoading: boolean
  query: string
  selectedId: string | null
  appliedIds: Set<string>
  now: number
  onSelect: (jobId: string) => void
}

export function JobList({ jobs, isLoading, query, selectedId, appliedIds, now, onSelect }: Props) {
  return (
    <section className="results" aria-label="Job results">
      <div className="results-head">
        <h1>
          {isLoading ? 'Searching…' : `${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'}`}
          {query && !isLoading && <span className="results-query"> for “{query}”</span>}
        </h1>
        <div className="sort">Newest first</div>
      </div>

      <ul className="job-list">
        {isLoading &&
          Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="job-card skeleton" aria-hidden="true">
              <div className="sk sk-avatar" />
              <div className="sk-lines">
                <div className="sk sk-line lg" />
                <div className="sk sk-line md" />
                <div className="sk sk-line sm" />
              </div>
            </li>
          ))}

        {!isLoading && jobs.length === 0 && (
          <li className="empty">
            <strong>No roles match those filters.</strong>
            <span>Try removing a filter, or search for a skill like “TypeScript”.</span>
          </li>
        )}

        {!isLoading &&
          jobs.map((job) => (
            <li key={job.id}>
              <JobCard
                job={job}
                isSelected={job.id === selectedId}
                hasApplied={appliedIds.has(job.id)}
                now={now}
                onSelect={onSelect}
              />
            </li>
          ))}
      </ul>
    </section>
  )
}
