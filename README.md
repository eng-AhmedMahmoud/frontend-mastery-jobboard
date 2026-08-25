# Frontend Mastery — the job board

One product, built across the whole program. Every module ships a slice of it; module 12
assembles the slices into a deployed application you can defend in an interview.

`main` holds the finished capstone and the shared foundation (domain types, fixtures, tooling).
The exercises live on branches.

## Three branches per stage

Every exercise stage exists three times:

| Branch | What's in it |
|---|---|
| `<stage>/start` | The scaffold, the types, the fixtures and the **failing tests**. Implementations throw `Not implemented`. No hints. Start here. |
| `<stage>/guided` | The same tests, plus numbered `TODO` steps and the reasoning behind each one. Use it when you're stuck — it's an escape hatch, not an answer key. |
| `<stage>/solution` | The finished implementation with every test green, plus `NOTES.md` on the trade-offs and what an interviewer will push on. |

The tests are **identical** in all three. The only thing that changes is how much of the
implementation is already there.

## How to work through a stage

```bash
git checkout m03-utils/start
pnpm install
pnpm test:watch          # red

# ...implement until green...

git diff m03-utils/solution -- src/     # compare your approach to mine
```

Stuck on one function? Pull just the hints for it, not the answer:

```bash
git checkout m03-utils/guided -- src/utils/debounce.ts
```

Do the struggling first. The hint is worth far less if you read it before you've tried.

## Stages

| Branch base | Module | What you build |
|---|---|---|
| `m02-browser-lab` | 2 | Instrument a slow page: reflow vs repaint, compositor-only animation, flame charts |
| `m03-utils` | 3 | The utility library: debounce, throttle, deepClone, curry, EventEmitter, promiseAll |
| `m04-domain-types` | 4 | Typed domain model, discriminated states, schema validation, typed API client |
| `m05-feed-ui` | 5 | The listings feed in React — composition, keys, effects, a profiler pass |
| `m06-typed-components` | 6 | Typed primitives: polymorphic Button, generic Select, typed fields |
| `m07-autocomplete` | 7 | Search autocomplete: debounce, race conditions, keyboard nav, ARIA combobox |
| `m07-overlays` | 7 | Apply modal, filter dropdown, tabs, toasts — focus trap, portals, live regions |
| `m07-virtual-list` | 7 | Virtualized listings by hand: windowing, pooling, recycling |
| `m08-data-layer` | 8 | TanStack Query + Router: caching, optimistic apply, filters as URL state |
| `m09-next-rendering` | 9 | Next.js port: public SEO pages vs authenticated dashboard, server actions |
| `m10-perf-and-tests` | 10 | Baseline → budget → fix, with Vitest + Playwright + MSW in CI |
| `m12-capstone` | 12 | Assemble everything, wire auth, deploy, write the architecture story |

## For the instructor

The solution branch is the only one written by hand. `guided` and `start` are generated
from it, so they cannot drift:

```bash
git checkout m03-utils/solution
# ...edit, commit...
pnpm stage:publish m03-utils    # regenerates m03-utils/guided and m03-utils/start
pnpm stage:verify  m03-utils    # asserts solution passes, guided & start fail, tests identical
```

Each stage branch carries a `stage.config.json` saying which paths belong to it:

```json
{ "stage": "m07-autocomplete", "strip": ["src/components/autocomplete"] }
```

That scope matters. A stage branches from the previous stage's solution, so without it the
stripper would also blank out work the student already finished — `m07-autocomplete/start`
would ship a broken `debounce` and fail for the wrong reason.

Markers used inside solution files:

```ts
// #placeholder throw new Error('Not implemented')   ← optional, overrides the default stub
// #region solution
  ...real implementation...
// #endregion
// #hint 1 Keep the timer id outside the returned function — that's what survives calls.
// #note Text every student sees, in all three branches.
```

`#hint` lines become `TODO n:` comments in `guided` and disappear in `start`.
Test files and fixtures are never touched by the stripper.
