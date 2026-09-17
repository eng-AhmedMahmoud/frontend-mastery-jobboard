/**
 * Provider Pattern (https://javascriptpatterns.vercel.app/patterns/react-patterns/provider-pattern)
 *
 * Make data available to multiple components without passing props through intermediate components.
 * Employs clean custom hook with boundary guard.
 */

import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

export interface JobFilterState {
  keyword: string
  tier: string | null
  remoteOnly: boolean
}

export interface ApplicationContextValue {
  filters: JobFilterState
  setKeyword: (keyword: string) => void
  setTier: (tier: string | null) => void
  toggleRemoteOnly: () => void
  resetFilters: () => void
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null)

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<JobFilterState>({
    keyword: '',
    tier: null,
    remoteOnly: false,
  })

  const setKeyword = (keyword: string) => setFilters((prev) => ({ ...prev, keyword }))
  const setTier = (tier: string | null) => setFilters((prev) => ({ ...prev, tier }))
  const toggleRemoteOnly = () => setFilters((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly }))
  const resetFilters = () => setFilters({ keyword: '', tier: null, remoteOnly: false })

  const value = useMemo<ApplicationContextValue>(
    () => ({
      filters,
      setKeyword,
      setTier,
      toggleRemoteOnly,
      resetFilters,
    }),
    [filters]
  )

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

export function useApplicationFilters(): ApplicationContextValue {
  const ctx = useContext(ApplicationContext)
  if (!ctx) {
    throw new Error('useApplicationFilters must be used within an <ApplicationProvider>')
  }
  return ctx
}
