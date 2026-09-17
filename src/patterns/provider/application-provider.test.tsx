/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApplicationProvider, useApplicationFilters } from './application-provider'

describe('Provider Pattern', () => {
  function FilterDisplay() {
    const { filters, setKeyword, toggleRemoteOnly } = useApplicationFilters()
    return (
      <div>
        <span data-testid="keyword-val">{filters.keyword}</span>
        <span data-testid="remote-val">{filters.remoteOnly ? 'yes' : 'no'}</span>
        <button type="button" onClick={() => setKeyword('TypeScript')}>
          Set Keyword
        </button>
        <button type="button" onClick={toggleRemoteOnly}>
          Toggle Remote
        </button>
      </div>
    )
  }

  it('provides state to descendants and updates consumers on change', () => {
    render(
      <ApplicationProvider>
        <FilterDisplay />
      </ApplicationProvider>
    )

    expect(screen.getByTestId('keyword-val')).toHaveTextContent('')
    expect(screen.getByTestId('remote-val')).toHaveTextContent('no')

    fireEvent.click(screen.getByText('Set Keyword'))
    expect(screen.getByTestId('keyword-val')).toHaveTextContent('TypeScript')

    fireEvent.click(screen.getByText('Toggle Remote'))
    expect(screen.getByTestId('remote-val')).toHaveTextContent('yes')
  })

  it('throws error when hook is called outside Provider tree', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<FilterDisplay />)
    }).toThrow('useApplicationFilters must be used within an <ApplicationProvider>')

    spy.mockRestore()
  })
})
