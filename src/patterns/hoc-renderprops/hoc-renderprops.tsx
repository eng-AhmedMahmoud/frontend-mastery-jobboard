/**
 * HOC & Render Props Patterns
 * (https://javascriptpatterns.vercel.app/patterns/react-patterns/hoc-pattern)
 * (https://javascriptpatterns.vercel.app/patterns/react-patterns/render-props-pattern)
 */

import React, { useState, type ComponentType, type ReactNode } from 'react'

export interface WithRoleProps {
  currentUserRole: 'guest' | 'candidate' | 'recruiter' | 'admin'
}

/**
 * Higher Order Component: withMinimumRole
 * Wraps a component to enforce authorization checks.
 */
export function withMinimumRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: Array<'candidate' | 'recruiter' | 'admin'>
) {
  return function RoleGuardedComponent(props: P & WithRoleProps) {
    const { currentUserRole, ...restProps } = props
    if (!allowedRoles.includes(currentUserRole as 'candidate' | 'recruiter' | 'admin')) {
      return <div data-testid="unauthorized-message">Access Restricted: Insufficient Role.</div>
    }
    return <WrappedComponent {...(restProps as P)} />
  }
}

/**
 * Render Props Pattern: MouseHoverTracker
 * Shares stateful hover logic via a render function.
 */
export interface MouseHoverTrackerProps {
  render: (state: { isHovered: boolean }) => ReactNode
}

export function MouseHoverTracker({ render }: MouseHoverTrackerProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      data-testid="hover-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {render({ isHovered })}
    </div>
  )
}
