# Architecture

This repo is not just where the exercises live — it is the worked example of the
architecture module 11 teaches. If the structure rots, the lesson rots with it.

Two rules explain everything below:

1. **Layers point downward.** A layer may import from the layers beneath it and never
   from the layers above.
2. **A feature's internals are private.** The only public surface of a feature is its
   `index.ts`. Nothing reaches past it.

Both are enforced by `eslint.config.js` and checked in CI — a bad import fails the build,
it does not get caught in review.

## The layers

```
                     ┌──────────────────────────────────────────┐
  app                │ composition root — wires features         │  owns no business logic
                     ├──────────────────────────────────────────┤
  features           │ jobs · search · applications · employers  │  one front door each
                     ├──────────────────────────────────────────┤
  ui                 │ button · select · modal · virtual-list    │  knows no business concept
                     ├──────────────────────────────────────────┤
  data               │ fixtures + the fake server                │  below the UI
                     ├──────────────────────────────────────────┤
  domain             │ Job · Employer · Application · filters    │  types only, no dependencies
                     ├──────────────────────────────────────────┤
  utils              │ debounce · throttle · deepClone · …       │  framework-free, imports nothing
                     └──────────────────────────────────────────┘
```

| Folder | What belongs here | What must never be here |
|---|---|---|
| `src/utils` | The interview utility library. Plain functions, no React, no imports from `src`. | Anything that knows what a `Job` is. |
| `src/domain` | The shared language of the product, as types. | Logic, defaults, fixtures, `zod` schemas *(module 4 adds those beside it, not in it)*. |
| `src/data` | `fixtures/` — realistic seed data. `server/` — the fake backend: latency, aborts, out-of-order responses. | Any import from `ui`, `features` or `app`. |
| `src/ui` | Design-system primitives. They take props and emit events. | The words job, employer or application. |
| `src/features` | Business subdomains. Each owns its `api/`, `components/`, `hooks/` and an `index.ts`. | An import from another feature. |
| `src/app` | The composition root, the shell, the routes. | Business logic of any kind. |

### Why features never import each other

Two features that need each other are one feature with a seam in the wrong place. The fix
is always one of three moves, in this order:

1. Wire them together in `src/app` — the composition root is allowed to know both.
2. Push the shared piece **down** into `domain`, `ui` or `utils`.
3. Merge them, and admit they were one subdomain.

Reaching across is never the fourth option. That is how a modular codebase becomes a big
ball of mud with folders.

### Why `features/`, not `modules/`

The architecture lesson calls these *modules by business subdomain*. In this repo the word
"module" already means a module of the course, so the folder is `features/` to keep the two
meanings apart. The concept is unchanged.

## Which stage owns which paths

Every exercise stage owns a **disjoint** set of paths. That is not a tidiness preference —
`stage.config.json` strips exactly those paths to generate the `start` branch, so an overlap
would blank out work the student already finished on an earlier stage.

| Stage branch | Owns | Status |
|---|---|:--:|
| `module-2/browser-lab` | `src/features/perf-lab/` | |
| `module-3/utils` | `src/utils/` | ✅ built |
| `module-4/domain-types` | `src/domain/` | |
| `module-5/feed-ui` | `src/features/jobs/components/`, `src/features/jobs/hooks/` | |
| `module-6/typed-components` | `src/ui/button/`, `src/ui/select/`, `src/ui/field/` | |
| `module-7/autocomplete` | `src/features/search/` | ✅ built |
| `module-7/overlays` | `src/ui/modal/`, `src/ui/dropdown/`, `src/ui/tabs/`, `src/ui/toast/` | |
| `module-7/virtual-list` | `src/ui/virtual-list/` | |
| `module-8/data-layer` | `src/features/jobs/api/`, `src/features/applications/`, `src/app/routes.tsx` | |
| `module-9/next-rendering` | a Next.js port — its own app, not a folder in this one | |
| `module-10/perf-and-tests` | `e2e/`, the performance budget config | |
| `module-12/capstone` | assembles the lot; merges into `main` | |

**Adding a stage:** pick the paths from this table, create them, write the solution, then
`pnpm stage:publish <stage>` and `pnpm stage:verify <stage>`. If you need a path that is
already owned, the stage is scoped wrong — split it, or take the folder over completely and
say so in `stage.config.json`.

## What each future module changes

The shape above is designed so that no module has to move another module's files.

- **Module 2** adds `features/perf-lab/` — a deliberately slow page to instrument. It is the
  one feature that exists to be measured, not shipped.
- **Module 4** replaces the hand-written types in `domain/` with schema-derived ones, and
  puts the validators next to them. The folder's boundary does not change.
- **Module 5** fills `features/jobs/components/` properly — today's components are the
  reference implementation the stage strips.
- **Module 6** creates `ui/` for real: `button/`, `select/`, `field/`, each typed and
  polymorphic.
- **Module 7** adds `ui/modal`, `ui/dropdown`, `ui/tabs`, `ui/toast`, `ui/virtual-list`.
- **Module 8** takes over `features/jobs/api/` and `features/applications/`, replacing the
  hand-rolled fetch-in-an-effect with TanStack Query, and introduces `app/routes.tsx` so the
  filters and the selection move into the URL.
- **Module 9** ports the app to Next.js. Everything below `features/` travels unchanged —
  which is the point of the boundaries, and a good slide.
- **Module 10** adds `e2e/` and a budget the CI enforces.

## Deliberate rough edges

Some of the code is not the best version of itself, on purpose — the better version is a
later module's lesson. Each one is marked in place:

| Where | What is rough | Fixed in |
|---|---|:--:|
| `features/jobs/hooks/use-job-search.ts` | Fetch in an effect, loading flag set by hand, sequence number guarding stale responses. | M8 |
| `features/applications/hooks/use-applications.ts` | Optimistic update with no rollback. | M8 |
| `features/search/components/search-autocomplete.tsx` | The debounced searcher lives in a ref because the timer has to survive re-renders. | M7 |
| `src/utils/debounce.ts`, `throttle.ts` | `this` is aliased on purpose so a debounced *method* stays callable. | — correct as written |

Where the linter disagrees with one of these, the `eslint-disable` carries the reason and
the module number. A silent disable is a bug; a disable that teaches is the point.

## Known gap

`README.md` and the curriculum list six utilities in the module 3 library — `debounce`,
`throttle`, `deepClone`, `curry`, `EventEmitter`, `promiseAll` — but `curry` has no
implementation and no tests yet. The stage is otherwise complete at 39 tests. Either add
`src/utils/curry.ts` with its tests and republish the stage, or drop `curry` from the
curriculum copy. Do not leave the two disagreeing.
