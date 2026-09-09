# Frontend Mastery — the job board

The exercise repository for [Catalyst](https://catalystai.llc)'s **Frontend Mastery** program.

One product, built across the whole program. Every module ships a slice of it; module 12
assembles the slices into a deployed application you can defend in an interview. Nothing
here is a throwaway demo — the `debounce` you write in module 3 is still running inside the
autocomplete in module 7, and both are still in the app you deploy at the end.

`main` holds the assembled product and the shared foundation: the domain model, the fake API,
the fixtures and the tooling. **The exercises live on branches.**

---

## Quick start

Requires **Node 22+** and **pnpm 11+** (`corepack enable` gets you the right pnpm).

```bash
git clone <this-repo> && cd frontend-mastery-jobboard
pnpm install

pnpm dev            # the assembled app
pnpm test           # the full suite
```

Then pick up your first exercise:

```bash
git checkout module-3/utils/start
pnpm test:watch     # red — 39 failing. That is the starting line.
```

---

## How an exercise works

Every stage exists **three times**. The tests are byte-identical across all three; the only
thing that changes is how much of the implementation is already there.

| Branch | What's in it |
|---|---|
| `<stage>/start` | Scaffold, types, fixtures and the **failing tests**. Implementations throw `Not implemented`. No hints. Start here. |
| `<stage>/guided` | The same tests, plus numbered `TODO` steps and the reasoning behind each. An escape hatch — not an answer key. |
| `<stage>/solution` | The finished implementation, every test green, plus `NOTES.md` on the trade-offs and what an interviewer will push on. |

### The loop

```bash
git checkout module-3/utils/start
pnpm test:watch                              # red

# ...implement until green...

git diff module-3/utils/solution -- src/     # compare your approach to mine
```

Stuck on one function? Pull the hints for that file only, not the answer:

```bash
git checkout module-3/utils/guided -- src/utils/debounce.ts
```

**Struggle first.** A hint read before the attempt is worth almost nothing, and the compare
step is where most of the learning actually happens — not in getting to green.

---

## Stages

| Branch base | Module | What you build | Status |
|---|:--:|---|:--:|
| `module-1/setup` | 1 | The workspace, the three-branch workflow, and the scorer that turns your diagnostic marks into the module to open first | ✅ |
| `module-2/browser-lab` | 2 | Instrument a slow page: reflow vs repaint, compositor-only animation, flame charts | |
| `module-3/utils` | 3 | The utility library: `debounce`, `throttle`, `deepClone`, `EventEmitter`, `promiseAll` | ✅ |
| `module-4/domain-types` | 4 | Typed domain model, discriminated states, schema validation, typed API client | |
| `module-5/feed-ui` | 5 | The listings feed in React — composition, keys, effects, a profiler pass | |
| `module-6/typed-components` | 6 | Typed primitives: polymorphic `Button`, generic `Select`, typed fields | |
| `module-7/autocomplete` | 7 | Search autocomplete: debounce, race conditions, keyboard nav, ARIA combobox | ✅ |
| `module-7/overlays` | 7 | Apply modal, filter dropdown, tabs, toasts — focus trap, portals, live regions | |
| `module-7/virtual-list` | 7 | Virtualized listings by hand: windowing, pooling, recycling | |
| `module-8/data-layer` | 8 | TanStack Query + Router: caching, optimistic apply, filters as URL state | |
| `module-9/next-rendering` | 9 | Next.js port: public SEO pages vs authenticated dashboard, server actions | |
| `module-10/perf-and-tests` | 10 | Baseline → budget → fix, with Vitest + Playwright + MSW in CI | |
| `module-12/capstone` | 12 | Assemble everything, wire auth, deploy, write the architecture story | |

13 stages × 3 branches, plus `main` — forty branches in all.

---

## Branch naming

Branches follow the [course-wide convention](https://github.com/eng-AhmedMahmoud/frontend-mastery-program#git-conventions) —
one branch per video, namespaced by module:

```
module-<N>/v<V>-<slug>/<start|guided|solution>
```

Video numbers arrive with each module's lesson map, so today the branches carry the module
and the slug only:

```
module-3/utils/start          ← now
module-3/v4-utils/start       ← once module 3's lesson map exists
```

The end state of each video gets tagged `m<N>-v<V>-end` on its `solution` branch, so a
student who fell behind runs `git checkout m3-v4-end` and is caught up. Tags land with the
numbers.

---

## What's in `main`

```
src/
  app/           the composition root — wires features together, owns no business logic
  features/      business subdomains: jobs · search · applications
  ui/            design-system primitives (module 6 onward)
  domain/        Job, Employer, Application — the shared language, types only
  data/          fixtures/ seed data · server/ the fake backend
  utils/         the interview utility library — framework-free
  styles/        global stylesheet and tokens
  test/          setup shared by every suite
scripts/         the stage tooling (see below)
```

**The layers point downward and a feature's internals are private** — both enforced by
`eslint.config.js` and checked in CI, so a bad import fails the build rather than review.
The full map, including which stage owns which paths, is in
[`ARCHITECTURE.md`](./ARCHITECTURE.md). Read it before adding a stage.

**No component library, on purpose.** If a student can `pnpm add` a combobox, they never
learn what a combobox is. Everything with an interaction model is built in this repo.

The fake API is deliberately hostile: it varies latency, honours `AbortSignal`, and returns
responses out of order — so a naive autocomplete visibly breaks, and the student has to fix
it for the right reason.

---

## Tech stack

| | |
|---|---|
| **React 19** | no UI kit — components are the syllabus |
| **TypeScript** | `strict` + `noUncheckedIndexedAccess` |
| **Vite** | honours `PORT` / `HOST` from the environment |
| **Vitest** | `node` for logic, `jsdom` for components |
| **Testing Library** | tests behaviour, not implementation |
| **GitHub Actions** | enforces the branch contract on every push |

```bash
pnpm dev            # dev server
pnpm build          # typecheck + production build
pnpm lint           # style, hooks, and the import boundaries
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm typecheck      # tsc --noEmit
```

---

## For instructors

The `solution` branch is the **only one written by hand**. `guided` and `start` are generated
from it, so the three can never drift apart:

```bash
git checkout module-3/utils/solution
# ...edit, commit...

pnpm stage:publish module-3/utils   # regenerate .../guided and .../start
pnpm stage:verify  module-3/utils   # solution passes; guided & start fail; tests identical
```

`stage:verify` is the safety net that matters: it proves the starter still **has work left in
it**. An exercise branch whose tests pass is a broken exercise, and you find that out three
weeks after launch unless a machine checks.

### `stage.config.json`

Each stage branch carries a config saying which paths belong to it:

```json
{
  "stage": "module-7/autocomplete",
  "module": 7,
  "video": null,
  "title": "Search autocomplete",
  "strip": ["src/components/autocomplete"]
}
```

The scope matters. A stage branches from the previous stage's solution, so without `strip`
the stripper would also blank out work the student already finished —
`module-7/autocomplete/start` would ship a broken `debounce` and fail for the wrong reason.

### Markers

Inside solution files, the stripper reads:

```ts
// #placeholder throw new Error('Not implemented')   ← optional, overrides the default stub
// #region solution
  ...real implementation...
// #endregion
// #hint 1 Keep the timer id outside the returned function — that's what survives calls.
// #note Text every student sees, in all three branches.
```

`#hint` lines become `TODO n:` comments in `guided` and disappear in `start`.
**Test files and fixtures are never touched by the stripper.**

### CI

`.github/workflows/ci.yml` typechecks and lints every branch, then asserts the contract:

- a `solution` branch (or `main`) **must pass** its tests
- a `start` or `guided` branch **must fail** — otherwise the exercise is already solved

The lint step is where the architecture is actually enforced: a cross-feature import, a
reach past a front door, or a utility that grew a dependency all fail the build.

### Rules that keep this from rotting

1. Never hand-edit `guided` or `start`. Regenerate them.
2. Keep stage path ownership disjoint — see the table in `ARCHITECTURE.md`. Two stages that
   strip overlapping paths blank out work the student already finished.
3. Solutions never merge into `main` except through `module-12/capstone` — `main` is the
   assembled product, not a pile of exercises.
4. Never commit a secret. `.env.example` carries the keys with dummy values; `.env` and
   `.env.*` are ignored.

---

## License

Course material for enrolled Catalyst students. Not for redistribution.
