/**
 * Prototype Pattern (https://javascriptpatterns.vercel.app/patterns/design-patterns/prototype-pattern)
 *
 * Share properties among many objects of the same type using prototype delegation.
 * Illustrates Object.create delegation and avoiding class duplication overhead.
 */

export interface JobListingContract {
  id: string
  title: string
  company: string
  getFormattedSummary(): string
  apply(candidateName: string): string
}

// The Prototype Object containing shared methods in memory
export const jobListingProto = {
  getFormattedSummary(this: JobListingContract): string {
    return `${this.title} at ${this.company}`
  },

  apply(this: JobListingContract, candidateName: string): string {
    return `Application submitted for ${candidateName} to ${this.company} (Job ID: ${this.id})`
  },
}

/**
 * Creates a job listing delegating to jobListingProto via Object.create
 */
export function createJobListing(id: string, title: string, company: string): JobListingContract {
  const job = Object.create(jobListingProto) as JobListingContract
  job.id = id
  job.title = title
  job.company = company
  return job
}

/**
 * Safe dictionary pattern — dictionary with null prototype (no Object.prototype methods or pollution)
 */
export function createDictionary<T>(): Record<string, T> {
  return Object.create(null)
}
