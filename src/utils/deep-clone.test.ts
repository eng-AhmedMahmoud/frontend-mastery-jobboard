import { describe, expect, it } from 'vitest'
import { deepClone } from './deep-clone'

describe('deepClone', () => {
  it('returns primitives unchanged', () => {
    expect(deepClone(42)).toBe(42)
    expect(deepClone('remote')).toBe('remote')
    expect(deepClone(null)).toBeNull()
    expect(deepClone(undefined)).toBeUndefined()
  })

  it('copies a flat object', () => {
    const filters = { query: 'react', minSalary: 30000 }
    const copy = deepClone(filters)

    expect(copy).toEqual(filters)
    expect(copy).not.toBe(filters)
  })

  it('copies nested structures without sharing references', () => {
    const job = {
      title: 'Senior Frontend Engineer',
      employer: { name: 'Catalyst', location: { city: 'Cairo' } },
      skills: ['react', 'typescript'],
    }
    const copy = deepClone(job)

    copy.employer.location.city = 'Dubai'
    copy.skills.push('next.js')

    expect(job.employer.location.city).toBe('Cairo')
    expect(job.skills).toHaveLength(2)
  })

  it('clones arrays as arrays', () => {
    const copy = deepClone([1, [2, [3]]])
    expect(Array.isArray(copy)).toBe(true)
    expect(Array.isArray(copy[1])).toBe(true)
    expect(copy).toEqual([1, [2, [3]]])
  })

  it('clones Date instances', () => {
    const postedAt = new Date('2026-03-01T09:00:00.000Z')
    const copy = deepClone({ postedAt })

    expect(copy.postedAt).toBeInstanceOf(Date)
    expect(copy.postedAt.getTime()).toBe(postedAt.getTime())
    expect(copy.postedAt).not.toBe(postedAt)
  })

  it('clones Map and Set', () => {
    const source = {
      byId: new Map([['job-1', { title: 'Frontend Engineer' }]]),
      tags: new Set(['remote', 'senior']),
    }
    const copy = deepClone(source)

    expect(copy.byId).toBeInstanceOf(Map)
    expect(copy.tags).toBeInstanceOf(Set)
    expect(copy.byId.get('job-1')).toEqual({ title: 'Frontend Engineer' })
    expect(copy.byId.get('job-1')).not.toBe(source.byId.get('job-1'))
    expect([...copy.tags]).toEqual(['remote', 'senior'])
  })

  it('survives circular references', () => {
    type Node = { name: string; self?: Node }
    const node: Node = { name: 'root' }
    node.self = node

    const copy = deepClone(node)

    expect(copy.name).toBe('root')
    expect(copy.self).toBe(copy)
    expect(copy.self).not.toBe(node)
  })

  it('handles the same object appearing twice without duplicating it', () => {
    const shared = { currency: 'EGP' }
    const copy = deepClone({ a: shared, b: shared })

    expect(copy.a).toBe(copy.b)
    expect(copy.a).not.toBe(shared)
  })
})
