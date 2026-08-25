import { useEffect, useMemo, useRef, useState } from 'react'
import type { Job, JobFilters, SeniorityLevel, WorkMode } from '@/domain/types'
import { SearchAutocomplete, type JobSuggestion } from '@/components/autocomplete/search-autocomplete'
import { fetchJobs, fetchSuggestions, submitApplication } from '@/api/jobs-api'
import { employerOf } from '@/data/jobs'
import { SENIORITY_LABEL, WORK_MODE_LABEL, formatPostedAt, formatSalary } from './format'

const WORK_MODES: WorkMode[] = ['remote', 'hybrid', 'onsite']
const SENIORITIES: SeniorityLevel[] = ['junior', 'mid', 'senior', 'staff']

const EMPTY_FILTERS: JobFilters = { query: '', workMode: [], seniority: [], minSalary: null }

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [applied, setApplied] = useState<Record<string, 'pending' | 'done'>>({})

  const now = useMemo(() => Date.parse('2026-08-25T09:00:00.000Z'), [])
  const requestSeq = useRef(0)

  // The typed term drives the list too, but on a quiet period — not per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.query === searchTerm ? current : { ...current, query: searchTerm }))
    }, 250)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const seq = ++requestSeq.current
    const controller = new AbortController()
    setIsLoading(true)

    fetchJobs(filters, controller.signal)
      .then((results) => {
        if (seq !== requestSeq.current) return
        setJobs(results)
        setIsLoading(false)
        setSelectedId((current) => (results.some((job) => job.id === current) ? current : (results[0]?.id ?? null)))
      })
      .catch(() => {
        /* aborted — a newer request is already in flight */
      })

    return () => controller.abort()
  }, [filters])

  const selected = jobs.find((job) => job.id === selectedId) ?? null
  const activeFilterCount =
    filters.workMode.length + filters.seniority.length + (filters.minSalary === null ? 0 : 1)

  const apply = (jobId: string) => {
    setApplied((current) => ({ ...current, [jobId]: 'pending' })) // optimistic
    submitApplication(jobId).then(() => {
      setApplied((current) => ({ ...current, [jobId]: 'done' }))
    })
  }

  const handleSuggestionSelect = (suggestion: JobSuggestion) => {
    setSearchTerm(suggestion.title)
    setFilters((current) => ({ ...current, query: suggestion.title }))
    setSelectedId(suggestion.id)
  }

  return (
    <div className="shell">
      <div className="glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Rasmi</span>
          <span className="brand-tag">frontend jobs</span>
        </div>

        <div className="topbar-search">
          <SearchAutocomplete
            label="Search jobs"
            placeholder="Search roles, companies or skills…"
            onQueryChange={setSearchTerm}
            fetchSuggestions={fetchSuggestions}
            onSelect={handleSuggestionSelect}
            debounceMs={220}
            minQueryLength={2}
          />
        </div>

        <nav className="topbar-actions">
          <button type="button" className="ghost-button">Saved</button>
          <button type="button" className="primary-button">Post a job</button>
        </nav>
      </header>

      <main className="layout">
        <aside className="filters" aria-label="Filters">
          <div className="filters-head">
            <h2>Filters</h2>
            {activeFilterCount > 0 && (
              <button type="button" className="link-button" onClick={() => setFilters((current) => ({ ...EMPTY_FILTERS, query: current.query }))}>
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <fieldset className="filter-group">
            <legend>Work mode</legend>
            {WORK_MODES.map((mode) => (
              <label key={mode} className="check">
                <input
                  type="checkbox"
                  checked={filters.workMode.includes(mode)}
                  onChange={() => setFilters((current) => ({ ...current, workMode: toggle(current.workMode, mode) }))}
                />
                <span>{WORK_MODE_LABEL[mode]}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="filter-group">
            <legend>Seniority</legend>
            {SENIORITIES.map((level) => (
              <label key={level} className="check">
                <input
                  type="checkbox"
                  checked={filters.seniority.includes(level)}
                  onChange={() => setFilters((current) => ({ ...current, seniority: toggle(current.seniority, level) }))}
                />
                <span>{SENIORITY_LABEL[level]}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="filter-group">
            <legend>Minimum salary</legend>
            <input
              type="range"
              min={0}
              max={100000}
              step={5000}
              value={filters.minSalary ?? 0}
              onChange={(event) => {
                const value = Number(event.target.value)
                setFilters((current) => ({ ...current, minSalary: value === 0 ? null : value }))
              }}
            />
            <output className="range-value">
              {filters.minSalary === null ? 'Any' : `${filters.minSalary / 1000}k EGP-equivalent / mo`}
            </output>
          </fieldset>
        </aside>

        <section className="results" aria-label="Job results">
          <div className="results-head">
            <h1>
              {isLoading ? 'Searching…' : `${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'}`}
              {filters.query && !isLoading && <span className="results-query"> for “{filters.query}”</span>}
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
              jobs.map((job) => {
                const employer = employerOf(job)
                const isSelected = job.id === selectedId
                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      className={`job-card${isSelected ? ' is-selected' : ''}`}
                      onClick={() => setSelectedId(job.id)}
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
                        {applied[job.id] && <span className="applied-tag">Applied</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
        </section>

        <aside className="detail" aria-label="Job details">
          {selected ? (
            <div className="detail-card">
              <div className="detail-head">
                <span className="logo lg" aria-hidden="true">{initials(employerOf(selected).name)}</span>
                <div>
                  <h2>{selected.title}</h2>
                  <p className="detail-employer">
                    {employerOf(selected).name} · {selected.location}
                  </p>
                </div>
              </div>

              <dl className="detail-grid">
                <div>
                  <dt>Salary</dt>
                  <dd>{formatSalary(selected.salary)}</dd>
                </div>
                <div>
                  <dt>Work mode</dt>
                  <dd>{WORK_MODE_LABEL[selected.workMode]}</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>{SENIORITY_LABEL[selected.seniority]}</dd>
                </div>
                <div>
                  <dt>Applicants</dt>
                  <dd>{selected.applicantCount}</dd>
                </div>
              </dl>

              <div className="detail-section">
                <h3>Stack</h3>
                <div className="chips">
                  {selected.skills.map((skill) => (
                    <span key={skill} className="chip">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>About the role</h3>
                <p>
                  You'll own the interfaces {employerOf(selected).name} ships to production — architecture,
                  accessibility and performance included. Expect to defend your rendering choices, hold a
                  Web Vitals budget, and review other engineers' components.
                </p>
              </div>

              <button
                type="button"
                className={`apply-button${applied[selected.id] === 'done' ? ' is-done' : ''}`}
                onClick={() => apply(selected.id)}
                disabled={Boolean(applied[selected.id])}
              >
                {applied[selected.id] === 'done'
                  ? 'Application sent ✓'
                  : applied[selected.id] === 'pending'
                    ? 'Sending…'
                    : 'Apply now'}
              </button>
              <p className="detail-foot">Posted {formatPostedAt(selected, now).toLowerCase()} · Usually replies within a week</p>
            </div>
          ) : (
            <div className="detail-card empty-detail">Select a role to see the details.</div>
          )}
        </aside>
      </main>
    </div>
  )
}
