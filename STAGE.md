# Stage m07-autocomplete — the search box

**Module 7 · UI Engineering: Components & Accessibility**

Build the job board's search autocomplete from scratch. No combobox library, no headless UI.

This is the most frequently asked "build this live" question in frontend interviews, and it is
asked precisely because five separate skills collide in one component. Most candidates get three
of them.

## What's actually being tested

| # | Skill | The failure mode |
|---|---|---|
| 1 | Debouncing | A request per keystroke. Reuse the `debounce` you wrote in `m03-utils`. |
| 2 | **Race conditions** | You type `react`, then ` engineer`. The first response lands last and overwrites the newer results. This is the one that separates mid from senior. |
| 3 | Keyboard access | Arrows don't wrap, Enter submits the form, Escape does nothing, the caret jumps because you forgot `preventDefault`. |
| 4 | ARIA combobox | No `role`, no `aria-expanded`, no `aria-activedescendant` — or worse, moving DOM focus into the list. |
| 5 | State honesty | Loading, empty and error all rendered as "nothing happened". |

## The contract

```ts
<SearchAutocomplete
  label="Search jobs"
  fetchSuggestions={(query, signal) => Promise<JobSuggestion[]>}
  onSelect={(suggestion) => void}
  debounceMs={250}
  minQueryLength={2}
/>
```

15 tests describe the behaviour precisely. Read them before you write anything — in a real
interview, the questions you ask before coding are half the score.

## Things worth knowing before you start

- **`aria-activedescendant`, not focus.** In a combobox, DOM focus stays in the input the whole
  time. The input points at the active option's `id`. Moving real focus into the list breaks
  typing and is the most common accessibility mistake in this component.
- **`onMouseDown`, not `onClick`,** for selecting an option. `click` fires after `blur`, and by
  then the list has already closed — so your handler never runs.
- **Sequence numbers *and* `AbortController`.** The sequence number keeps the UI correct; the
  abort stops wasted network. An interviewer will ask for both, and they solve different problems.
- **Build the debounced function once.** Created in the render body, it's a new function on every
  render, and a fresh debounce debounces nothing.

## Working through it

```bash
git checkout m07-autocomplete/start
pnpm install
pnpm test:watch
```

The tests are ordered from the obvious to the brutal. If you're passing everything except
`ignores a slow response that arrives after a newer one`, you've written the version that ships
to production and then produces a bug report nobody can reproduce.

Stuck? `git checkout m07-autocomplete/guided -- src/components/`

## Acceptance

- `pnpm test` — 54 passing (39 from `m03-utils`, 15 here)
- `pnpm typecheck` — clean
- Keyboard-only: you can search, choose and submit without touching the mouse
- The list never shows results for a query that is no longer in the input

## Where it goes

This is the search box at the top of the job board. Module 8 replaces the hand-rolled
fetching with TanStack Query and the term moves into the URL — at which point you'll see exactly
which parts of this component were state management and which were UI.
