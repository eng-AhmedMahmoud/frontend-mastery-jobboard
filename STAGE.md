# Stage module-1/setup — the workspace, and the loop

**Module 1 · Foundations — What Companies Actually Test · Lesson 7**

The smallest possible exercise, on purpose. Its job is not to teach you JavaScript — it is to
prove your toolchain works and to walk you through the loop you will use for the next thirteen
modules, before that loop is carrying anything heavy.

## Before you start

```bash
node -v          # v20 or newer — CI runs 20 and 22
pnpm -v          # 11.x  (corepack enable && corepack prepare pnpm@latest --activate)
git --version
```

## What you implement

| File | Function | Why this one |
|---|---|---|
| `src/diagnostic/score.ts` | `scoreDiagnostic(marks)` | Turns your own twelve diagnostic marks from lesson 5 into the module you should open first |

Nine tests, one pure function, no framework and no DOM. If it feels too easy, it is — the
difficulty here is entirely in the workflow, not the code.

## Working through it

```bash
git checkout module-1/setup/start
pnpm install
pnpm test:watch        # red, 9 failing
```

Read `src/diagnostic/score.test.ts` before you read `score.ts`. The test is the specification,
and reading it first is the habit this stage actually exists to build.

Stuck for twenty minutes? Pull the hints for that file only — not the answer:

```bash
git checkout module-1/setup/guided -- src/diagnostic/score.ts
```

Green? Compare, don't just check:

```bash
git diff module-1/setup/solution -- src/diagnostic/
```

## Acceptance

- `pnpm test` — 9 passing
- `pnpm typecheck` — clean, with `strict` on
- No `any`, no `@ts-expect-error`
- A caller who mutates the returned `focusModules` cannot affect the next caller

## Then run it on yourself

```ts
import { scoreDiagnostic } from '@/diagnostic'

// your twelve marks from lesson 5, in order
scoreDiagnostic([true, false, true, true, false, false, true, false, false, true, false, false])
// → { score: 5, band: 'common', startModule: 2, focusModules: [2, 3] }
```

Write the score, the date, and `startModule` on the first page of your notebook. You take the
same twelve questions again in module 13, and the delta is the proof.
