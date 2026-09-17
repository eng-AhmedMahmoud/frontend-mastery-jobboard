import { describe, it, expect } from 'vitest'
import { createJobListing, jobListingProto, createDictionary } from './prototype'

describe('Prototype Pattern — Delegation & Shared Memory', () => {
  it('delegates method calls to the shared prototype', () => {
    const job1 = createJobListing('1', 'Senior Frontend Engineer', 'Catalyst')
    const job2 = createJobListing('2', 'Staff Engineer', 'Google')

    expect(job1.getFormattedSummary()).toBe('Senior Frontend Engineer at Catalyst')
    expect(job2.getFormattedSummary()).toBe('Staff Engineer at Google')

    // Both instances share the exact same function reference in memory
    expect(job1.getFormattedSummary).toBe(job2.getFormattedSummary)
    expect(Object.getPrototypeOf(job1)).toBe(jobListingProto)
  })

  it('does not carry methods as own properties', () => {
    const job = createJobListing('1', 'UI Engineer', 'Stripe')

    expect(Object.prototype.hasOwnProperty.call(job, 'title')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(job, 'getFormattedSummary')).toBe(false)
  })

  it('allows dynamic prototype extension across all existing instances', () => {
    const job = createJobListing('1', 'React Specialist', 'Vercel')

    // Extend prototype dynamically
    // @ts-expect-error dynamic prototype enhancement demo
    jobListingProto.getTier = function () {
      return 'tier-1'
    }

    // @ts-expect-error dynamic call
    expect(job.getTier()).toBe('tier-1')

    // @ts-expect-error cleanup
    delete jobListingProto.getTier
  })

  it('creates safe dictionaries without Object.prototype inheritance to prevent pollution', () => {
    const dict = createDictionary<number>()
    dict['views'] = 42

    expect(dict['views']).toBe(42)
    // No toString, valueOf, or prototype pollution vulnerabilities
    expect(Object.getPrototypeOf(dict)).toBe(null)
    expect((dict as unknown as Record<string, unknown>).toString).toBeUndefined()
  })
})
