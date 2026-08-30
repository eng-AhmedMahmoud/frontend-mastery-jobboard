import type { ReactNode } from 'react'

interface Props {
  /** The search box lives in the top bar but belongs to the search feature. */
  search: ReactNode
  children: ReactNode
}

/** Page chrome only: the brand, the top bar and the three-column frame. */
export function AppShell({ search, children }: Props) {
  return (
    <div className="shell">
      <div className="glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Rasmi</span>
          <span className="brand-tag">frontend jobs</span>
        </div>

        <div className="topbar-search">{search}</div>

        <nav className="topbar-actions">
          <button type="button" className="ghost-button">Saved</button>
          <button type="button" className="primary-button">Post a job</button>
        </nav>
      </header>

      <main className="layout">{children}</main>
    </div>
  )
}
