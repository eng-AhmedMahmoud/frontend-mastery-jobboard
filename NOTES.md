# `module-3/utils` — the trade-offs

You are reading this on the `solution` branch. It is the conversation that comes *after*
green tests: why each utility is shaped the way it is, what it costs, and where an
interviewer pushes.

These five are the most-asked functions in frontend interviews. Passing the tests is the
easy half. Being able to defend a line while you type it is the half that gets scored.

---

## `debounce`

**The trade-off: responsiveness against work.** Every millisecond of `wait` is a
millisecond the user stares at a stale screen. Too short and you are back to a request per
keystroke; too long and the box feels broken. 250–400ms is the range for search input, and
you should be able to say why you picked your number.

**Decisions in this implementation**

- **Trailing edge by default.** For a search box, the last thing typed is the only query
  worth sending.
- `cancel()` **and** `flush()`. `cancel` is for unmount; `flush` is for "the user pressed
  Enter, send it now". Most submitted answers ship neither, and the follow-up question is
  always about one of them.
- A normal `function`, not an arrow, with `fn.apply(this, args)`. An arrow has no `this`
  of its own, so `debounce(obj.method)` would silently lose its receiver — module 3,
  lesson 3, cashed in.
- The timer id lives in the closure, not on the returned function. That is what lets one
  call cancel the previous one, and it is the whole mechanism.

**What an interviewer pushes on**

> "What happens on unmount?"

A pending timer fires into a dead component. Return `cancel` and call it in cleanup.

> "Does this fix the race condition?"

**No** — and this is the answer that separates people. Debounce reduces the *number* of
requests. Two that do go out can still come back out of order, and the stale one can win.
That needs an `AbortController` or a request id, which is module 7's autocomplete.

---

## `throttle`

**The trade-off: which edges you keep.** Leading-only feels instant and drops the final
state. Trailing-only is accurate and feels laggy. Both is usually right and costs you an
extra timer plus the stored arguments.

Say which pair you chose and what the user would feel if you chose the other.

**Decisions in this implementation**

- Both edges on by default, each switchable. `leading: false` is the case that breaks most
  implementations — the first call must *not* run immediately, and the naive
  `lastInvokedAt = 0` start makes it run.
- Timestamps, not a boolean gate. A boolean cannot tell you how much of the window is
  left, so it cannot schedule an accurate trailing call.
- One trailing timer, not one per call. Scheduling per call is the bug the function exists
  to prevent.

**What an interviewer pushes on**

> "Debounce or throttle here?"

Wait for quiet → debounce. Guarantee a rate → throttle. Say the sentence, then name the
case: search input is debounce, scroll position is throttle.

> "Why not `requestAnimationFrame`?"

For anything that paints per frame — scroll, drag, mousemove — rAF *is* the better
throttle, because it is aligned to the frame instead of to a wall-clock guess. That is
`rafSchedule` in `module-2/browser-lab`.

---

## `deepClone`

**The trade-off: correctness against surface area.** A complete deep clone is not a
twenty-line function — it is a long tail of exotic objects. This version handles the ones
that turn up in application data and stops there, on purpose.

**Decisions in this implementation**

- The `WeakMap` is set **before** recursing. Set it after and a circular reference
  recurses forever. This is the single most-marked line in the function.
- `WeakMap`, not `Map`, so the bookkeeping cannot outlive the objects it describes.
- `Date`, `Map` and `Set` are handled explicitly. Spread them and you get `{}` — silently,
  with no error, which is how this bug reaches production.
- `Reflect.ownKeys` rather than `Object.keys`, so symbols and non-enumerable properties
  survive.
- Functions are returned by reference, not cloned. Cloning a function is not meaningful
  in JavaScript, and pretending otherwise is worse than the sharing.
- **Recursive**, which means a deep enough tree overflows the stack. The queue-based
  version is the follow-up answer, not the first draft.

**What an interviewer pushes on**

> "Why not `JSON.parse(JSON.stringify(x))`?"

Three failures in ten seconds: a `Date` becomes a string, `undefined` and functions
disappear, and a cycle throws.

> "Why not `structuredClone`?"

In production, use it — it is built in, handles cycles, `Map`, `Set` and typed arrays. You
write this one to prove you know what it is doing, and because `structuredClone` throws on
functions and DOM nodes, which is sometimes exactly the case you have.

---

## `EventEmitter`

**The trade-off: decoupling against traceability.** Events make the publisher and the
subscriber independent, and they make "what happens when I click this" unanswerable
without a search. Use them across a boundary you actually want loose, not as a general
way to call functions.

**Decisions in this implementation**

- `on()` **returns an unsubscribe**. This is the senior touch and the one interviewers look
  for: cleanup that cannot be forgotten, because you were handed it rather than told to
  reconstruct it.
- A `Map` of `Set`s. The `Set` means registering the same listener twice is a no-op —
  arguably wrong if you want duplicates, and right for every real use of this class.
- The event's entry is **deleted** when its last listener leaves. Otherwise the map grows
  with empty sets forever, which is module 3, lesson 8, in miniature.
- Typed by an `Events` record, so `emit('job:selected', payload)` is checked against the
  payload the event declares. An untyped emitter is a stringly-typed API.
- `#listeners` is genuinely private. No convention, no underscore, no way to reach it from
  outside.

**What an interviewer pushes on**

> "What if a listener throws?"

In this version it stops the rest of the emit. Say so, and say the alternative: wrap each
call in try/catch and report, at the cost of hiding real errors. Both are defensible;
having no opinion is not.

> "Where is the leak?"

A listener that closes over a component and is never removed. The emitter holds the
listener, the listener holds the closure, the closure holds the tree. This is the #1 SPA
leak, and the returned unsubscribe is the fix.

---

## `promiseAll`

**The trade-off: what failure should mean.** `all` fails the whole screen on one bad
endpoint. `allSettled` renders what it can. Neither is more correct — the right one
depends on whether the page is meaningful with a hole in it.

**Decisions in this implementation**

- Results go into a **pre-sized array by index**. Pushing as they resolve returns
  completion order, which is the wrong answer and the reason the question is asked.
- A `settled` counter rather than `results.length`. A slot holding `undefined` is
  indistinguishable from an empty one, so length lies.
- The empty array resolves immediately, handled **before** the loop. This is the case that
  fails half of all submitted answers.
- `Promise.resolve(value)` normalises non-promise inputs in one line — the real
  `Promise.all` accepts any iterable of values.
- `reject` is passed straight through as the rejection handler. A promise settles once, so
  no guard flag is needed; adding one signals you do not trust the primitive.

**What an interviewer pushes on**

> "Does the first rejection cancel the others?"

**No.** They keep running and their results are discarded. Cancellation is
`AbortController`, and it is a separate decision from combination.

> "Now write `allSettled`."

Same skeleton, one changed settle condition: never reject, and store
`{ status, value | reason }` per slot. If you built `promiseAll` with a counter, this is a
three-line edit — which is the point of building it with a counter.

---

## The thing this stage is really teaching

None of these five needed anything you had not already seen by lesson 8. `debounce` is a
closure with a timer. `EventEmitter` is a `Map` and an unsubscribe. `promiseAll` is a
counter and an index.

You can write them from an empty file because you spent eight lessons on the mechanics
instead of memorising the snippets — and that is exactly the difference the interview is
built to detect.
