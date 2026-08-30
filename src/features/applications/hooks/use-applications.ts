import { useCallback, useMemo, useState } from 'react'
import { submitApplication } from '../api/applications-api'

type ApplyState = 'idle' | 'pending' | 'done'

/**
 * Optimistic apply: the button flips the moment it is pressed and the server confirms
 * afterwards. Module 8 replaces this with a TanStack Query mutation — including the
 * rollback this version does not have yet.
 */
export function useApplications() {
  const [byJobId, setByJobId] = useState<Record<string, ApplyState>>({})

  const apply = useCallback((jobId: string) => {
    setByJobId((current) => ({ ...current, [jobId]: 'pending' }))
    submitApplication(jobId).then(() => {
      setByJobId((current) => ({ ...current, [jobId]: 'done' }))
    })
  }, [])

  const appliedIds = useMemo(() => new Set(Object.keys(byJobId)), [byJobId])
  const stateOf = useCallback((jobId: string | null): ApplyState =>
    (jobId && byJobId[jobId]) || 'idle', [byJobId])

  return { apply, appliedIds, stateOf }
}
