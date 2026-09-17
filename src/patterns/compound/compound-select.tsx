/**
 * Compound Component Pattern (https://javascriptpatterns.vercel.app/patterns/react-patterns/compound-pattern)
 *
 * Multiple components work together to have a shared state and handle logic together.
 * Subcomponents share implicit state via React Context without prop-drilling.
 */

import React, { createContext, useContext, useState, type ReactNode } from 'react'

interface CompoundSelectContextValue {
  isOpen: boolean
  toggle: () => void
  selectedOption: string | null
  select: (val: string) => void
}

const SelectContext = createContext<CompoundSelectContextValue | null>(null)

function useSelectContext(): CompoundSelectContextValue {
  const ctx = useContext(SelectContext)
  if (!ctx) {
    throw new Error('CompoundSelect subcomponents must be rendered within a <CompoundSelect> provider.')
  }
  return ctx
}

export interface CompoundSelectProps {
  children: ReactNode
  defaultValue?: string
  onChange?: (val: string) => void
}

export function CompoundSelect({ children, defaultValue, onChange }: CompoundSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(defaultValue ?? null)

  const toggle = () => setIsOpen((prev) => !prev)

  const select = (val: string) => {
    setSelectedOption(val)
    setIsOpen(false)
    onChange?.(val)
  }

  return (
    <SelectContext.Provider value={{ isOpen, toggle, selectedOption, select }}>
      <div className="compound-select-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

CompoundSelect.Trigger = function CompoundSelectTrigger({ children }: { children?: ReactNode }) {
  const { toggle, isOpen, selectedOption } = useSelectContext()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      className="select-trigger"
    >
      {selectedOption ?? children ?? 'Select an option'}
    </button>
  )
}

CompoundSelect.List = function CompoundSelectList({ children }: { children: ReactNode }) {
  const { isOpen } = useSelectContext()
  if (!isOpen) return null

  return (
    <ul role="listbox" className="select-dropdown" style={{ listStyle: 'none', margin: 0, padding: '4px' }}>
      {children}
    </ul>
  )
}

CompoundSelect.Option = function CompoundSelectOption({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) {
  const { select, selectedOption } = useSelectContext()
  const isSelected = selectedOption === value

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={() => select(value)}
      style={{ cursor: 'pointer', fontWeight: isSelected ? 'bold' : 'normal' }}
    >
      {children}
    </li>
  )
}
