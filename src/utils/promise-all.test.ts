import { describe, expect, it } from 'vitest'
import { promiseAll } from './promise-all'

const after = <T>(ms: number, value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

describe('promiseAll', () => {
  it('resolves with the values in input order, not completion order', async () => {
    const results = await promiseAll([after(30, 'slow'), after(10, 'fast'), after(20, 'middle')])
    expect(results).toEqual(['slow', 'fast', 'middle'])
  })

  it('resolves immediately for an empty list', async () => {
    await expect(promiseAll([])).resolves.toEqual([])
  })

  it('accepts plain values alongside promises', async () => {
    const results = await promiseAll([1, Promise.resolve(2), 3])
    expect(results).toEqual([1, 2, 3])
  })

  it('rejects with the first rejection', async () => {
    const failure = new Error('network down')
    await expect(promiseAll([after(50, 'ok'), Promise.reject(failure)])).rejects.toBe(failure)
  })

  it('rejects even when a later promise would resolve', async () => {
    await expect(
      promiseAll([Promise.reject(new Error('first')), after(10, 'second')]),
    ).rejects.toThrow('first')
  })

  it('keeps undefined values in their slots', async () => {
    const results = await promiseAll([Promise.resolve(undefined), Promise.resolve('value')])
    expect(results).toHaveLength(2)
    expect(results[0]).toBeUndefined()
    expect(results[1]).toBe('value')
  })
})
