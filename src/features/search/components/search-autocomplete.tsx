// SearchAutocomplete — the job board's search box, and the single most-asked
// "build this live, no libraries" interview question.
// 
// Five things are being tested at once, and most candidates only get three:
//   1. debounce           — don't fetch on every keystroke
//   2. race conditions    — an older request must never overwrite a newer one
//   3. keyboard access    — arrows, Enter, Escape, and wrapping at the ends
//   4. ARIA combobox      — the roles and attributes screen readers rely on
//   5. state honesty      — loading, empty and error are different things
// 
// You already wrote the debounce in module-3/utils. Reuse it — don't rewrite it.

import { useEffect, useId, useRef, useState } from 'react'
import { debounce } from '@/utils/debounce'

export interface JobSuggestion {
  id: string
  title: string
  employerName: string
}

export interface SearchAutocompleteProps {
  /** Visible label. Never ship a search box labelled only by a placeholder. */
  label: string
  /** Called with the term and an AbortSignal. Rejects with an AbortError when superseded. */
  fetchSuggestions: (query: string, signal: AbortSignal) => Promise<JobSuggestion[]>
  onSelect: (suggestion: JobSuggestion) => void
  /** Fires on every keystroke with the raw input value. */
  onQueryChange?: (query: string) => void
  /** Hint text. Never a substitute for the label — always in addition to it. */
  placeholder?: string
  /** Quiet period before a request goes out. */
  debounceMs?: number
  /** Below this many characters, don't search at all. */
  minQueryLength?: number
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

export function SearchAutocomplete({
  label,
  fetchSuggestions,
  onSelect,
  onQueryChange,
  placeholder,
  debounceMs = 250,
  minQueryLength = 2,
}: SearchAutocompleteProps) {
  const listboxId = useId()
  const optionId = (index: number) => `${listboxId}-option-${index}`

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const rootRef = useRef<HTMLDivElement>(null)

  // ---------------------------------------------------------------- fetching
  const requestSeq = useRef(0)
  const controllerRef = useRef<AbortController>(null)

  // The debounced searcher is created once and kept in a ref so its timer survives
  // re-renders. The refs it closes over are only ever read inside the debounced
  // callback — that is, in a timeout, never during render. The rule cannot see that,
  // and rewriting this to satisfy it would lose the timer on every keystroke.
  const searchRef = useRef(
    // eslint-disable-next-line react-hooks/refs
    debounce((term: string) => {
      const seq = ++requestSeq.current
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      setStatus('loading')

      fetchSuggestions(term, controller.signal).then(
        (results) => {
          if (seq !== requestSeq.current) return // a newer search has already started
          setSuggestions(results)
          setStatus('ready')
          setIsOpen(true)
          setActiveIndex(-1)
        },
        (error: unknown) => {
          if (seq !== requestSeq.current) return
          if (error instanceof DOMException && error.name === 'AbortError') return
          setStatus('error')
          setSuggestions([])
          setIsOpen(true)
        },
      )
    }, debounceMs),
  )

  useEffect(() => {
    const search = searchRef.current
    return () => {
      search.cancel()
      controllerRef.current?.abort()
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    setActiveIndex(-1)
    onQueryChange?.(value)
    if (value.trim().length < minQueryLength) {
      searchRef.current.cancel()
      requestSeq.current++ // invalidate anything still in flight
      setSuggestions([])
      setStatus('idle')
      setIsOpen(false)
      return
    }
    setIsOpen(true)
    searchRef.current(value.trim())
  }

  const select = (suggestion: JobSuggestion) => {
    searchRef.current.cancel()
    requestSeq.current++
    setQuery(suggestion.title)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
    setStatus('idle')
    onQueryChange?.(suggestion.title)
    onSelect(suggestion)
  }

  // ---------------------------------------------------------------- keyboard
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true)
        setActiveIndex(0)
        return
      }
      if (suggestions.length === 0) return
      setActiveIndex((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (suggestions.length === 0) return
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
      return
    }

    if (event.key === 'Enter') {
      const active = suggestions[activeIndex]
      if (!active) return
      event.preventDefault()
      select(active)
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // ------------------------------------------------------------ outside click
  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setIsOpen(false)
      setActiveIndex(-1)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  // ------------------------------------------------------------------ render
  const showList = isOpen && status !== 'loading' && suggestions.length > 0
  const showEmpty = isOpen && status === 'ready' && suggestions.length === 0

  return (
    <div ref={rootRef} className="search-autocomplete">
      <label htmlFor={`${listboxId}-input`}>{label}</label>
      <input
        id={`${listboxId}-input`}
        type="text"
        role="combobox"
        placeholder={placeholder}
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={`${listboxId}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div role="status" aria-live="polite">
        {status === 'loading' && 'Searching…'}
        {showEmpty && 'No matching jobs'}
        {status === 'error' && 'Something went wrong. Try again.'}
      </div>

      {showList && (
        <ul id={`${listboxId}-listbox`} role="listbox" aria-label={label}>
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault() // keep focus in the input
                select(suggestion)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span>{suggestion.title}</span>
              <span> · {suggestion.employerName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
