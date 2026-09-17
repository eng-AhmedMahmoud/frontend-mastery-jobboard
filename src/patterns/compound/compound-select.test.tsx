/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CompoundSelect } from './compound-select'

describe('Compound Component Pattern', () => {
  it('toggles dropdown list when trigger button is clicked', () => {
    render(
      <CompoundSelect>
        <CompoundSelect.Trigger>Choose Category</CompoundSelect.Trigger>
        <CompoundSelect.List>
          <CompoundSelect.Option value="frontend">Frontend</CompoundSelect.Option>
          <CompoundSelect.Option value="backend">Backend</CompoundSelect.Option>
        </CompoundSelect.List>
      </CompoundSelect>
    )

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('selects option, triggers callback, and closes dropdown', () => {
    const handleChange = vi.fn()
    render(
      <CompoundSelect onChange={handleChange}>
        <CompoundSelect.Trigger>Choose Tier</CompoundSelect.Trigger>
        <CompoundSelect.List>
          <CompoundSelect.Option value="senior">Senior Staff</CompoundSelect.Option>
          <CompoundSelect.Option value="lead">Engineering Lead</CompoundSelect.Option>
        </CompoundSelect.List>
      </CompoundSelect>
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Engineering Lead'))

    expect(handleChange).toHaveBeenCalledWith('lead')
    expect(screen.getByRole('button')).toHaveTextContent('lead')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('throws error if a subcomponent is rendered outside of CompoundSelect', () => {
    // Suppress console error output for expected boundary assertion
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<CompoundSelect.Trigger>Orphan Trigger</CompoundSelect.Trigger>)
    }).toThrow('must be rendered within a <CompoundSelect> provider')

    spy.mockRestore()
  })
})
