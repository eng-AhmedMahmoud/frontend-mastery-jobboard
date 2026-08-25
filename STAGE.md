# Stage m03-utils — the interview utility library

**Module 3 · JavaScript, Deeply**

Six functions that get asked in real interviews more often than anything else on the frontend.
You're not using them from a library here — you're writing them, with the tests an interviewer
would write if they had time.

## What you implement

| File | Function | The follow-up question you should expect |
|---|---|---|
| `src/utils/debounce.ts` | `debounce(fn, wait)` + `cancel` / `flush` | "What happens to `this`?" · "How would you add a leading edge?" |
| `src/utils/throttle.ts` | `throttle(fn, wait, { leading, trailing })` | "How is this different from debounce?" · "Which one for infinite scroll?" |
| `src/utils/deep-clone.ts` | `deepClone(value)` | "What about Dates? Maps? Cycles?" · "Why not `JSON.parse(JSON.stringify(x))`?" |
| `src/utils/event-emitter.ts` | `EventEmitter` — `on` / `once` / `off` / `emit` | "What if a listener unsubscribes during emit?" |
| `src/utils/promise-all.ts` | `promiseAll(values)` | "Why is result order preserved?" · "Now write `allSettled`" |

## Where it goes in the product

These aren't exercises in a vacuum — the job board uses all of them:

- `debounce` → the search box in module 7's autocomplete
- `throttle` → the infinite-scroll handler on the listings feed
- `deepClone` → resetting filters to their last saved state
- `EventEmitter` → the toast system in module 7
- `promiseAll` → loading a job and its employer in parallel in module 8

## Working through it

```bash
pnpm install
pnpm test:watch        # red, 39 failing
```

Implement one file at a time. The tests are ordered from the obvious case to the one that
catches people out — if you're passing the first three tests in a file and failing the last two,
you've written the version most candidates write.

Stuck on a specific function? Pull only its hints:

```bash
git checkout m03-utils/guided -- src/utils/debounce.ts
```

Done? Compare, don't just check:

```bash
git diff m03-utils/solution -- src/utils/
```

## Acceptance

- `pnpm test` — 39 passing
- `pnpm typecheck` — clean, with `strict` on
- No `any`, no `@ts-expect-error`
- Every function keeps working if called with no arguments, called twice, or cancelled mid-flight
