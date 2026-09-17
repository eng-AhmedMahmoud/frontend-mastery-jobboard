import { describe, it, expect } from 'vitest'
import { createJobFactory } from './factory'

describe('Factory Pattern', () => {
  it('creates remote frontend jobs with standard mid-tier benefits', () => {
    const job = createJobFactory('remote-frontend', {
      id: 'job-1',
      title: 'React Engineer',
    })

    expect(job).toMatchObject({
      id: 'job-1',
      title: 'React Engineer',
      salary: 85000,
      tier: 'mid',
      isPublished: true,
    })
    expect(job.benefits).toContain('Remote Stipend')
  })

  it('creates lead architect jobs with staff-tier compensation and perks', () => {
    const job = createJobFactory('lead-architect', {
      id: 'job-2',
      title: 'Principal Frontend Architect',
      salary: 190000,
    })

    expect(job.salary).toBe(190000)
    expect(job.tier).toBe('staff')
    expect(job.benefits).toContain('Equity')
  })

  it('creates unpublished entry-tier intern listings', () => {
    const job = createJobFactory('intern', {
      id: 'job-3',
      title: 'Frontend Intern',
    })

    expect(job.tier).toBe('entry')
    expect(job.isPublished).toBe(false)
  })
})
