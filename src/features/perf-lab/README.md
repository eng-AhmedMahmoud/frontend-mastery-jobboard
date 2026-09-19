# `perf-lab` — module 2's exercise

Rasmi's results list holds 600 job cards. On a throttled machine it stutters while you
scroll, and filtering takes about 400ms to repaint. Three things are wrong with it, and
each one lives in a different stage of the rendering pipeline.

Your deliverable is **not** only a green test run. It is two Performance recordings —
before and after — and four sentences: what you measured, which stage it landed in, what
you changed, what the number became.

## The four functions

| File | The move | The lesson behind it |
|---|---|---|
| `visible-range.ts` | Do **less** work — render the rows on screen, not all 600 | 7 · reflow costs the CPU |
| `raf-schedule.ts` | Do it **once** — one handler run per frame, newest arguments win | 9 · the event loop |
| `batch-layout.ts` | Do it **in order** — every read, then every write | 7 · forced synchronous layout |
| `instrument.ts` | **Prove** it — a labelled band in the Performance panel | 10 · instrument and prove the fix |

None of them import React, and none of them touch the DOM. That is deliberate: the hard
part of this module is arithmetic and ordering, and both are things you can test.

## How to work it

```sh
git checkout module-2/browser-lab/start
pnpm install
pnpm test:watch                    # red — that red is the deliverable
```

Stuck for twenty minutes on one function? Pull the hints for that file only:

```sh
git checkout module-2/browser-lab/guided -- src/features/perf-lab/raf-schedule.ts
```

When it is green, compare your approach to mine:

```sh
git diff module-2/browser-lab/solution -- src/features/perf-lab/
```

## The measurement loop

The tests prove the logic. They cannot prove the page got faster — only a recording does.

1. **Record** six seconds of scrolling, with 4× CPU throttling on. Your laptop is not your user.
2. **Find the long task** — the red-cornered block. Everything else is noise until it is gone.
3. **Read the colour** — purple is layout, green is paint, yellow is your JavaScript. A warning
   triangle is a forced synchronous layout: go straight there.
4. **Fix one thing, re-record.** Two changes at once and you have learned nothing.

Same recording length, same throttle, before and after. That pair of screenshots is what goes
in the pull request — and what you describe in the interview.
