# Frontend Mastery — the job board

One product, built across the whole program. Every module ships a slice of it; module 12
assembles the slices into a deployed application you can defend in an interview.

`main` holds the finished capstone and the shared foundation (domain types, fixtures, tooling).
The exercises live on branches.

## Branch naming

Branches follow the course convention in `../GIT-CONVENTIONS.md`:

```
module-<N>/v<V>-<slug>/<start|guided|solution>     target
module-3/utils/start                               today — video numbers land with each
                                                   module's lesson map
```

The end state of a video is tagged `m<N>-v<V>-end` on its `solution` branch, so a student
who fell behind can `git checkout m3-v4-end` and be caught up. Tags come with the numbers.

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
git checkout module-3/utils/start
pnpm install
pnpm test:watch          # red

# ...implement until green...

git diff module-3/utils/solution -- src/     # compare your approach to mine
```

Stuck on one function? Pull just the hints for it, not the answer:

```bash
git checkout module-3/utils/guided -- src/utils/debounce.ts
```

Do the struggling first. The hint is worth far less if you read it before you've tried.

## Stages

| Branch base | Module | What you build |
|---|---|---|
| `module-2/browser-lab` | 2 | Instrument a slow page: reflow vs repaint, compositor-only animation, flame charts |
| `module-3/utils` | 3 | The utility library: debounce, throttle, deepClone, curry, EventEmitter, promiseAll |
| `module-4/domain-types` | 4 | Typed domain model, discriminated states, schema validation, typed API client |
| `module-5/feed-ui` | 5 | The listings feed in React — composition, keys, effects, a profiler pass |
| `module-6/typed-components` | 6 | Typed primitives: polymorphic Button, generic Select, typed fields |
| `module-7/autocomplete` | 7 | Search autocomplete: debounce, race conditions, keyboard nav, ARIA combobox |
| `module-7/overlays` | 7 | Apply modal, filter dropdown, tabs, toasts — focus trap, portals, live regions |
| `module-7/virtual-list` | 7 | Virtualized listings by hand: windowing, pooling, recycling |
| `module-8/data-layer` | 8 | TanStack Query + Router: caching, optimistic apply, filters as URL state |
| `module-9/next-rendering` | 9 | Next.js port: public SEO pages vs authenticated dashboard, server actions |
| `module-10/perf-and-tests` | 10 | Baseline → budget → fix, with Vitest + Playwright + MSW in CI |
| `module-12/capstone` | 12 | Assemble everything, wire auth, deploy, write the architecture story |

## For the instructor

The solution branch is the only one written by hand. `guided` and `start` are generated
from it, so they cannot drift:

```bash
git checkout module-3/utils/solution
# ...edit, commit...
pnpm stage:publish module-3/utils   # regenerates .../guided and .../start
pnpm stage:verify  module-3/utils   # solution passes, guided & start fail, tests identical
```

Each stage branch carries a `stage.config.json` saying which paths belong to it:

```json
{ "stage": "module-7/autocomplete", "video": null, "strip": ["src/components/autocomplete"] }
```

That scope matters. A stage branches from the previous stage's solution, so without it the
stripper would also blank out work the student already finished — `module-7/autocomplete/start`
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
