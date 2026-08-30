#!/usr/bin/env node
/**
 * verify-stage.mjs — prove a stage's three branches behave the way the course promises.
 *
 * Checks, for `<stage>/{solution,guided,start}`:
 *   1. the test files are byte-identical across all three (the contract never changes)
 *   2. `solution` passes
 *   3. `start` fails    — otherwise the exercise is already solved for the student
 *   4. `guided` fails   — hints, not answers
 *
 * Usage: node scripts/verify-stage.mjs module-3/utils
 */

import { execFileSync, spawnSync } from 'node:child_process'

const stage = process.argv[2]

if (!stage) {
  console.error('usage: node scripts/verify-stage.mjs <stage>   e.g. module-3/utils')
  process.exit(1)
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const branches = ['solution', 'guided', 'start'].map((mode) => `${stage}/${mode}`)
const startedOn = git('rev-parse', '--abbrev-ref', 'HEAD')

if (git('status', '--porcelain')) {
  console.error('verify-stage: working tree is dirty — commit or stash first')
  process.exit(1)
}

const failures = []

// 1 — the test contract must be identical everywhere
for (const branch of branches.slice(1)) {
  const diff = spawnSync('git', ['diff', '--quiet', branches[0], branch, '--', 'src/**/*.test.ts'])
  if (diff.status !== 0) {
    failures.push(`${branch}: test files differ from ${branches[0]} — the contract must be identical`)
  }
}

// 2–4 — expected pass/fail per branch
const expectation = { solution: 'pass', guided: 'fail', start: 'fail' }

for (const branch of branches) {
  // Stage names are nested (module-3/utils), so the mode is the last segment.
  const mode = branch.split('/').pop()
  git('checkout', branch)
  const result = spawnSync('pnpm', ['vitest', 'run', '--reporter=dot'], { encoding: 'utf8' })
  const passed = result.status === 0
  const got = passed ? 'pass' : 'fail'
  const want = expectation[mode]
  const ok = got === want

  console.log(`${ok ? '✓' : '✗'} ${branch.padEnd(34)} expected ${want}, got ${got}`)
  if (!ok) {
    failures.push(
      want === 'pass'
        ? `${branch}: tests must pass — the solution is the source of truth`
        : `${branch}: tests must fail — otherwise the student has nothing to implement`,
    )
  }
}

git('checkout', startedOn)

if (failures.length) {
  console.error('\nverify-stage failed:')
  for (const failure of failures) console.error(`  · ${failure}`)
  process.exit(1)
}

console.log(`\n✓ ${stage}: all three branches behave correctly`)
