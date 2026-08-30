import { useMemo, useState } from 'react'
import { JobDetail, JobFilters, JobList, useJobSearch } from '@/features/jobs'
import { SearchAutocomplete, fetchSuggestions, type JobSuggestion } from '@/features/search'
import { useApplications } from '@/features/applications'
import { AppShell } from './layout/app-shell'

/**
 * The composition root. It owns no business logic — it wires the features together and
 * holds only the state that genuinely spans them: what is typed, and what is selected.
 *
 * Everything else lives behind a feature's front door. When module 8 introduces the
 * router, the selection moves into the URL and this file gets smaller, not larger.
 */
export function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { jobs, isLoading, filters, setFilters, activeFilterCount } = useJobSearch(searchTerm)
  const { apply, appliedIds, stateOf } = useApplications()

  // Fixed clock, so "3 days ago" is the same in a screenshot, a test and a recording.
  const now = useMemo(() => Date.parse('2026-08-25T09:00:00.000Z'), [])

  // The selection is derived, not synchronised. `selectedId` is only ever an override:
  // if the row the user picked survived the refetch it wins, otherwise the first result
  // does. No effect, no cascading render, nothing to keep in step.
  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0] ?? null

  const handleSuggestionSelect = (suggestion: JobSuggestion) => {
    setSearchTerm(suggestion.title)
    setFilters((current) => ({ ...current, query: suggestion.title }))
    setSelectedId(suggestion.id)
  }

  return (
    <AppShell
      search={
        <SearchAutocomplete
          label="Search jobs"
          placeholder="Search roles, companies or skills…"
          onQueryChange={setSearchTerm}
          fetchSuggestions={fetchSuggestions}
          onSelect={handleSuggestionSelect}
          debounceMs={220}
          minQueryLength={2}
        />
      }
    >
      <JobFilters filters={filters} activeFilterCount={activeFilterCount} onChange={setFilters} />
      <JobList
        jobs={jobs}
        isLoading={isLoading}
        query={filters.query}
        selectedId={selected?.id ?? null}
        appliedIds={appliedIds}
        now={now}
        onSelect={setSelectedId}
      />
      <JobDetail job={selected} now={now} applyState={stateOf(selected?.id ?? null)} onApply={apply} />
    </AppShell>
  )
}
