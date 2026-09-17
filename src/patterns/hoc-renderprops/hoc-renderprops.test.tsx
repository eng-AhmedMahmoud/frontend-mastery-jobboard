/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { withMinimumRole, MouseHoverTracker } from './hoc-renderprops'

describe('HOC & Render Props Patterns', () => {
  function SecretAdminPanel({ label }: { label: string }) {
    return <div data-testid="admin-panel">{label}</div>
  }

  const ProtectedAdminPanel = withMinimumRole(SecretAdminPanel, ['admin'])

  it('HOC blocks unauthorized roles from seeing wrapped component', () => {
    render(<ProtectedAdminPanel label="Audit Logs" currentUserRole="candidate" />)
    expect(screen.getByTestId('unauthorized-message')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-panel')).toBeNull()
  })

  it('HOC permits allowed roles to render wrapped component', () => {
    render(<ProtectedAdminPanel label="Audit Logs" currentUserRole="admin" />)
    expect(screen.getByTestId('admin-panel')).toHaveTextContent('Audit Logs')
    expect(screen.queryByTestId('unauthorized-message')).toBeNull()
  })

  it('Render Props shares hover state dynamically', () => {
    render(
      <MouseHoverTracker
        render={({ isHovered }) => <span>{isHovered ? 'Active Cursor' : 'Idle Cursor'}</span>}
      />
    )

    expect(screen.getByText('Idle Cursor')).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByTestId('hover-container'))
    expect(screen.getByText('Active Cursor')).toBeInTheDocument()
    fireEvent.mouseLeave(screen.getByTestId('hover-container'))
    expect(screen.getByText('Idle Cursor')).toBeInTheDocument()
  })
})
