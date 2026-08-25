#!/usr/bin/env node
/**
 * strip.mjs — derive the `guided` and `start` branches from the `solution` source.
 *
 * The solution is the only version anyone hand-writes. The other two are generated,
 * so they can never silently drift out of sync with it.
 *
 * Markers, all written as ordinary comments inside the solution:
 *
 *   // #region solution
 *   ...the real implementation...
 *   // #endregion
 *
 *   // #placeholder throw new Error('Not implemented')
 *      Optional. Overrides what replaces the region. Must sit directly above `#region`.
 *
 *   // #hint 1 Keep the timer id outside the returned function.
 *      Kept (as `// TODO 1:`) in `guided`, removed in `start`.
 *
 *   // #note anything the student should read in every version
 *      Kept everywhere. Use for the brief, never for the answer.
 *
 * Usage: node scripts/strip.mjs --mode guided|start [--dir src] [--dry]
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const mode = getArg('mode')
const rootDir = getArg('dir', 'src')
const dryRun = args.includes('--dry')

if (mode !== 'guided' && mode !== 'start') {
  console.error('strip.mjs: --mode must be "guided" or "start"')
  process.exit(1)
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css'])
const DEFAULT_PLACEHOLDER = "throw new Error('Not implemented')"

/** Files whose content must be identical in all three branches. */
const isProtected = (path) => /\.test\.(ts|tsx|js|jsx)$/.test(path) || path.includes('/fixtures/')

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      yield* walk(path)
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
      yield path
    }
  }
}

const indentOf = (line) => line.slice(0, line.length - line.trimStart().length)

function transform(source, mode) {
  const lines = source.split('\n')
  const output = []
  let pendingPlaceholder = null
  let inRegion = false
  let regionIndent = ''
  let changed = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (inRegion) {
      if (/^\/\/\s*#endregion\b/.test(trimmed)) {
        inRegion = false
        pendingPlaceholder = null
      }
      continue // drop everything inside the region, including the markers
    }

    const placeholderMatch = trimmed.match(/^\/\/\s*#placeholder\s+(.*)$/)
    if (placeholderMatch) {
      pendingPlaceholder = placeholderMatch[1].trim()
      continue
    }

    if (/^\/\/\s*#region\s+solution\b/.test(trimmed)) {
      inRegion = true
      changed = true
      regionIndent = indentOf(line)
      output.push(`${regionIndent}${pendingPlaceholder ?? DEFAULT_PLACEHOLDER}`)
      continue
    }

    const hintMatch = trimmed.match(/^\/\/\s*#hint\s+(\d+)\s+(.*)$/)
    if (hintMatch) {
      changed = true
      if (mode === 'guided') {
        output.push(`${indentOf(line)}// TODO ${hintMatch[1]}: ${hintMatch[2]}`)
      }
      continue // `start` gets no hint at all
    }

    const noteMatch = trimmed.match(/^\/\/\s*#note\s+(.*)$/)
    if (noteMatch) {
      output.push(`${indentOf(line)}// ${noteMatch[1]}`)
      continue
    }

    output.push(line)
  }

  if (inRegion) {
    throw new Error('unterminated `#region solution` — every region needs an `#endregion`')
  }

  return { text: output.join('\n'), changed }
}

let touched = 0
let skipped = 0

for await (const path of walk(rootDir)) {
  const normalized = path.split('\\').join('/')
  if (isProtected(normalized)) {
    skipped++
    continue
  }

  const source = await readFile(path, 'utf8')
  let result
  try {
    result = transform(source, mode)
  } catch (error) {
    console.error(`strip.mjs: ${path}: ${error.message}`)
    process.exit(1)
  }

  if (!result.changed) continue
  touched++
  if (!dryRun) await writeFile(path, result.text, 'utf8')
  console.log(`  ${dryRun ? 'would strip' : 'stripped'}  ${path}`)
}

console.log(
  `strip.mjs: mode=${mode} · ${touched} file(s) ${dryRun ? 'to strip' : 'stripped'} · ${skipped} protected file(s) left untouched`,
)
