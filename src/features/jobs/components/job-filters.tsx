import type { JobFilters as Filters, SeniorityLevel, WorkMode } from '@/domain'
import { EMPTY_FILTERS } from '../hooks/use-job-search'
import { SENIORITY_LABEL, WORK_MODE_LABEL } from '../format'

const WORK_MODES: WorkMode[] = ['remote', 'hybrid', 'onsite']
const SENIORITIES: SeniorityLevel[] = ['junior', 'mid', 'senior', 'staff']

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

interface Props {
  filters: Filters
  activeFilterCount: number
  onChange: (update: (current: Filters) => Filters) => void
}

export function JobFilters({ filters, activeFilterCount, onChange }: Props) {
  return (
    <aside className="filters" aria-label="Filters">
      <div className="filters-head">
        <h2>Filters</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            className="link-button"
            onClick={() => onChange((current) => ({ ...EMPTY_FILTERS, query: current.query }))}
          >
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
              onChange={() =>
                onChange((current) => ({ ...current, workMode: toggle(current.workMode, mode) }))
              }
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
              onChange={() =>
                onChange((current) => ({ ...current, seniority: toggle(current.seniority, level) }))
              }
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
            onChange((current) => ({ ...current, minSalary: value === 0 ? null : value }))
          }}
        />
        <output className="range-value">
          {filters.minSalary === null ? 'Any' : `${filters.minSalary / 1000}k EGP-equivalent / mo`}
        </output>
      </fieldset>
    </aside>
  )
}
