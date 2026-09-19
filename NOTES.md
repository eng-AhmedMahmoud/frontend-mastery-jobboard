# `module-2/browser-lab` — the trade-offs

You are reading this on the `solution` branch. It is the conversation that comes *after*
green tests: why each function is shaped the way it is, what it costs, and where an
interviewer pushes.

---

## `visibleRange`

**The trade-off: memory and paint against complexity.** Rendering 600 cards costs layout
and paint on all 600. Rendering twelve costs almost nothing — but you now own a scroll
listener, an offset, a spacer element, and a class of bug where the list looks empty
because the maths is off by one.

Windowing is worth it somewhere around a few hundred rows. Below that you have added a
moving part for nothing, and `content-visibility: auto` gets you most of the win for one
line of CSS.

**Decisions in this implementation**

- `endIndex` is **inclusive**. An exclusive end reads better in a `slice` and worse
  everywhere else; whichever you pick, the empty list is the case that catches people, and
  the tests pin it to `-1`.
- Overscan is applied **before** clamping. Clamp first and the range walks off the ends of
  the list on a fast scroll.
- `rowHeight: 0` and `count: 0` both return an empty range instead of throwing. Both are
  real states — the first render, before layout has run, hands you exactly that.
- Fixed row height only. Variable heights need a measured offset cache and a binary search
  over it, which is `src/ui/virtual-list` in module 7, not here.

**What an interviewer pushes on**

> "What happens when the rows aren't all the same height?"

Say the honest answer: this version breaks, and the fix is an offset cache — measure each
row once, store its top, binary-search it on scroll. Then say why you would not build that
first.

> "Why overscan at all?"

Because scrolling is sampled, not continuous. Between two frames the user can travel
further than one row, and without overscan they see the background.

---

## `rafSchedule`

**The trade-off: latency against work.** Throttling by clock (`throttle(fn, 16)`) is
*close* to one frame and aligned to nothing. Throttling by frame is aligned to the only
moment the work can matter — and costs you up to one frame of latency on the first call,
because nothing runs synchronously.

That latency is the reason this is wrong for a click handler and right for a scroll
handler.

**Decisions in this implementation**

- **Trailing-only.** The frame runs with the newest arguments, and there is no leading
  edge. For scroll position, the newest value is the only correct one.
- The handle is cleared **before** the call, so a handler that schedules itself again from
  inside the frame works. A self-scheduling animation loop is the common case.
- `fn.bind(this, ...args)` holds the receiver and the arguments in one value. Keeping the
  two apart works equally well and trips `no-this-alias`.
- `requestFrame` / `cancelFrame` are injected. Not for purity — for the tests, which drive
  frames by hand so the ordering can be asserted instead of slept on.
- `cancel()` clears the pending call as well as the handle. Clear only the handle and a
  cancelled payload fires on the next frame.

**What an interviewer pushes on**

> "Is this the same as `throttle(fn, 16)`?"

No. A 16ms throttle can fire twice in one frame on a 120Hz display and skip a frame on a
60Hz one. `requestAnimationFrame` fires once per frame, whatever the refresh rate, and not
at all in a background tab — which is a feature.

> "What happens on unmount?"

A pending frame fires into a dead component. That is what `cancel()` is for, and why the
function returns it rather than a bare closure.

---

## `batchLayout`

**The trade-off: none worth the name.** This is the rare case where the fast version is
also the clearer one. The cost is that the two phases must stay apart, and the next person
to touch it will want to merge them back into one readable loop.

Leave a comment. The merge is silent, and the regression is 600 forced layouts.

**Decisions in this implementation**

- **Synchronous on purpose.** Wrapping it in `requestAnimationFrame` would be defensible
  in an app and would make the ordering untestable, which is the whole point of the
  exercise.
- It returns the measurements. Callers usually want the numbers they just read, and
  handing them back stops the caller from reading again — a second read after the write
  phase forces the layout you just avoided.
- Items and measurements are carried together rather than indexed in parallel. Two arrays
  and an index is the version that breaks under `noUncheckedIndexedAccess`.

**What an interviewer pushes on**

> "Which properties actually force layout?"

`offsetTop/Left/Width/Height`, `client*`, `scroll*`, `getBoundingClientRect()`,
`getComputedStyle()` on a geometry property, `focus()`. Know four of them by name.

> "Does React solve this for you?"

Partly. React batches its own writes, but `useLayoutEffect` reading geometry after a
commit is the same trap with a hook around it. The read/write split is still yours to
make.

---

## `measure`

**The trade-off: instrumentation is itself work.** Every mark and measure allocates an
entry and the buffer is finite. Measuring at the granularity of one row is how you make
the profile the slowest thing in the profile.

Measure at the boundary you would name in a bug report: "filter", "render feed",
"parse response".

**Decisions in this implementation**

- `try/finally`, so a throwing callback still leaves a timing behind. The slowest run of
  a session is usually the one that threw.
- The duration comes from `now()`, not from the User Timing entry. The entry is for the
  Performance panel; the number is for you, and it survives on a clock that has nothing
  but `now()`.
- `mark` and `measure` are optional on the injected clock. That is a testing seam, not a
  polyfill: every browser this course targets has both.
- `LONG_TASK_MS` is 50 because that is the threshold in the Long Tasks spec — the same
  number DevTools uses to put a red corner on a block. It is not a round number someone
  liked.

**What an interviewer pushes on**

> "How do you know the fix worked?"

Two recordings, same length, same CPU throttle, one changed thing. Anything else is a
story about a number.

> "Why not just `console.time`?"

It writes to the console and nowhere else. `performance.measure` puts a named band in the
timeline next to the layout and paint work it caused, and it can be read back from
`performance.getEntriesByType('measure')` in a real user monitoring payload.

---

## The thing this stage is really teaching

Three of these four functions make the page faster by **doing less**, not by doing the
same work quickly. That ordering — skip it, coalesce it, batch it, and only then optimise
it — is the answer to almost every frontend performance question you will be asked.

The fourth function exists so you can prove the other three worked.
