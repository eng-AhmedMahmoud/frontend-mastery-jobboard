import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchAutocomplete, type JobSuggestion } from './search-autocomplete'

const JOBS: JobSuggestion[] = [
  { id: 'job-1', title: 'Senior Frontend Engineer', employerName: 'Catalyst' },
  { id: 'job-2', title: 'Frontend Engineer', employerName: 'Breadfast' },
  { id: 'job-3', title: 'React Engineer', employerName: 'Instabug' },
]

/** A promise you resolve by hand — the only reliable way to test out-of-order responses. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function setup(overrides: Partial<Parameters<typeof SearchAutocomplete>[0]> = {}) {
  const onSelect = vi.fn()
  const fetchSuggestions = vi.fn(async () => JOBS)
  const user = userEvent.setup()

  render(
    <SearchAutocomplete
      label="Search jobs"
      fetchSuggestions={fetchSuggestions}
      onSelect={onSelect}
      debounceMs={20}
      {...overrides}
    />,
  )

  return { user, onSelect, fetchSuggestions, input: screen.getByRole('combobox') }
}

describe('SearchAutocomplete', () => {
  it('renders a labelled combobox that starts collapsed', () => {
    const { input } = setup()
    expect(screen.getByLabelText('Search jobs')).toBe(input)
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not search below the minimum query length', async () => {
    const { user, input, fetchSuggestions } = setup({ minQueryLength: 3 })
    await user.type(input, 're')
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(fetchSuggestions).not.toHaveBeenCalled()
  })

  it('debounces: a burst of keystrokes produces one request', async () => {
    const { user, input, fetchSuggestions } = setup()
    await user.type(input, 'frontend')
    await waitFor(() => expect(fetchSuggestions).toHaveBeenCalledTimes(1))
    expect(fetchSuggestions).toHaveBeenCalledWith('frontend', expect.any(AbortSignal))
  })

  it('shows the suggestions and expands the combobox', async () => {
    const { user, input } = setup()
    await user.type(input, 'engineer')

    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(3)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(options[0]).toHaveTextContent('Senior Frontend Engineer')
  })

  it('announces the empty state instead of showing an empty list', async () => {
    const { user, input } = setup({ fetchSuggestions: vi.fn(async () => []) })
    await user.type(input, 'cobol')

    expect(await screen.findByText('No matching jobs')).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('moves the active option with the arrow keys and wraps at both ends', async () => {
    const { user, input } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0]?.id)

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[2]?.id)

    await user.keyboard('{ArrowDown}') // wraps to the top
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0]?.id)

    await user.keyboard('{ArrowUp}') // wraps to the bottom
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[2]?.id)
  })

  it('marks the active option with aria-selected', async () => {
    const { user, input } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.keyboard('{ArrowDown}')

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(options[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('selects the active option on Enter and closes the list', async () => {
    const { user, input, onSelect } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.keyboard('{ArrowDown}{Enter}')

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(JOBS[0])
    expect(input).toHaveValue('Senior Frontend Engineer')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ignores Enter when no option is active', async () => {
    const { user, input, onSelect } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.keyboard('{Enter}')

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('selects on click', async () => {
    const { user, input, onSelect } = setup()
    await user.type(input, 'engineer')
    const options = await screen.findAllByRole('option')

    await user.click(options[1]!)

    expect(onSelect).toHaveBeenCalledWith(JOBS[1])
    expect(input).toHaveValue('Frontend Engineer')
  })

  it('closes on Escape but keeps what was typed', async () => {
    const { user, input } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('engineer')
  })

  it('closes when a click lands outside the component', async () => {
    const { user, input } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.click(document.body)

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
  })

  it('clearing the input below the minimum closes the list', async () => {
    const { user, input } = setup()
    await user.type(input, 'engineer')
    await screen.findAllByRole('option')

    await user.clear(input)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('ignores a slow response that arrives after a newer one', async () => {
    const slow = deferred<JobSuggestion[]>()
    const fast = deferred<JobSuggestion[]>()
    const responses = [slow.promise, fast.promise]
    const fetchSuggestions = vi.fn(() => responses.shift()!)

    const { user, input } = setup({ fetchSuggestions })

    await user.type(input, 'react')
    await waitFor(() => expect(fetchSuggestions).toHaveBeenCalledTimes(1))

    await user.type(input, ' engineer')
    await waitFor(() => expect(fetchSuggestions).toHaveBeenCalledTimes(2))

    // The second request answers first, then the first one finally lands.
    fast.resolve([JOBS[2]!])
    expect(await screen.findByText('React Engineer')).toBeInTheDocument()

    slow.resolve([JOBS[0]!, JOBS[1]!])

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(1)
    })
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument()
  })

  it('surfaces a failed request instead of showing a stale list', async () => {
    const fetchSuggestions = vi.fn(async () => {
      throw new Error('network down')
    })
    const { user, input } = setup({ fetchSuggestions })

    await user.type(input, 'engineer')

    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
