#!/usr/bin/env node
/**
 * publish-stage.mjs — regenerate `<stage>/guided` and `<stage>/start` from `<stage>/solution`.
 *
 * Run it from the solution branch after any change to that stage. The derived branches are
 * always recreated from scratch, never patched, so a hand-edit on them cannot survive.
 *
 * `strip.mjs` only rewrites source files, so anything else written for the solution — the
 * NOTES.md on the trade-offs, above all — would ride along into `guided` and `start` and
 * hand the student the discussion before they have written a line. Those files are listed
 * in SOLUTION_ONLY below and deleted on the derived branches.
 *
 * Usage: node scripts/publish-stage.mjs module-3/utils
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'

/** Written for the solution branch only. Deleted from `guided` and `start`. */
const SOLUTION_ONLY = ['NOTES.md']

const stage = process.argv[2]

if (!stage) {
  console.error('usage: node scripts/publish-stage.mjs <stage>   e.g. module-3/utils')
  process.exit(1)
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const run = (cmd, ...args) => execFileSync(cmd, args, { stdio: 'inherit' })

const solutionBranch = `${stage}/solution`
const current = git('rev-parse', '--abbrev-ref', 'HEAD')

if (current !== solutionBranch) {
  console.error(`publish-stage: run this from ${solutionBranch} (currently on ${current})`)
  process.exit(1)
}

if (git('status', '--porcelain')) {
  console.error('publish-stage: working tree is dirty — commit the solution first')
  process.exit(1)
}

for (const mode of ['guided', 'start']) {
  const branch = `${stage}/${mode}`
  console.log(`\n▸ ${branch}`)

  git('checkout', '-B', branch, solutionBranch)
  run('node', 'scripts/strip.mjs', '--mode', mode)

  // Checked before the deletions below, so a removed NOTES.md can never stand in for a
  // strip that did nothing.
  if (!git('status', '--porcelain')) {
    console.error(`publish-stage: strip produced no changes for ${branch} — are the #region markers missing?`)
    git('checkout', solutionBranch)
    process.exit(1)
  }

  for (const path of SOLUTION_ONLY) {
    if (!existsSync(path)) continue
    await rm(path, { recursive: true })
    console.log(`  removed   ${path} — solution only`)
  }

  git('add', '-A')
  git('commit', '-m', `chore(${stage}): generate ${mode} branch from solution`)
}

git('checkout', solutionBranch)

console.log(`\n✓ ${stage}: solution → guided → start regenerated`)
console.log('  next: pnpm stage:verify ' + stage)
