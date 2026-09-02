import { describe, expect, it } from 'vitest'

import { TOTAL_QUESTIONS, scoreDiagnostic } from './score'

/** A run of twelve marks with the first `right` of them correct. */
const marks = (right: number): boolean[] =>
  Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i < right)

describe('scoreDiagnostic', () => {
  it('scores a perfect run', () => {
    const result = scoreDiagnostic(marks(12))

    expect(result.score).toBe(12)
    expect(result.band).toBe('senior-shaped')
    expect(result.startModule).toBe(8)
  })

  it('sends a 0–3 to the platform modules', () => {
    const result = scoreDiagnostic(marks(2))

    expect(result.score).toBe(2)
    expect(result.band).toBe('starting-fresh')
    expect(result.startModule).toBe(2)
    expect(result.focusModules).toEqual([2, 3, 4])
  })

  it('sends a 7+ to the interview modules', () => {
    const result = scoreDiagnostic(marks(8))

    expect(result.band).toBe('mid-shaped')
    expect(result.startModule).toBe(8)
    expect(result.focusModules).toEqual([8, 11, 14])
  })

  it('sends a 4–6 to modules 2 and 3', () => {
    const result = scoreDiagnostic(marks(5))

    expect(result.band).toBe('common')
    expect(result.startModule).toBe(2)
    expect(result.focusModules).toEqual([2, 3])
  })

  it('treats a blank sheet as a zero, not an error', () => {
    const result = scoreDiagnostic(marks(0))

    expect(result.score).toBe(0)
    expect(result.band).toBe('starting-fresh')
  })

  it('counts only the marks you got right, wherever they fall', () => {
    const scattered = [true, false, true, false, true, false, true, false, true, false, true, false]

    expect(scoreDiagnostic(scattered).score).toBe(6)
    expect(scoreDiagnostic(scattered).band).toBe('common')
  })

  it('puts the band boundaries exactly where the score slide puts them', () => {
    expect(scoreDiagnostic(marks(3)).band).toBe('starting-fresh')
    expect(scoreDiagnostic(marks(4)).band).toBe('common')
    expect(scoreDiagnostic(marks(6)).band).toBe('common')
    expect(scoreDiagnostic(marks(7)).band).toBe('mid-shaped')
    expect(scoreDiagnostic(marks(9)).band).toBe('mid-shaped')
    expect(scoreDiagnostic(marks(10)).band).toBe('senior-shaped')
  })

  it('hands back a fresh focusModules array each call', () => {
    const first = scoreDiagnostic(marks(5))
    const second = scoreDiagnostic(marks(5))

    expect(first.focusModules).not.toBe(second.focusModules)

    first.focusModules.push(99)
    expect(second.focusModules).toEqual([2, 3])
  })

  it('rejects a run that is not twelve answers long', () => {
    expect(() => scoreDiagnostic([true, false, true])).toThrow(RangeError)
    expect(() => scoreDiagnostic([])).toThrow(RangeError)
    expect(() => scoreDiagnostic(Array(13).fill(true))).toThrow(RangeError)
  })
})
