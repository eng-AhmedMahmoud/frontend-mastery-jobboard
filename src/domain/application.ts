import type { SalaryRange } from './job'

/**
 * An application moves through states. Modelled as a discriminated union rather than
 * a bag of booleans — module 4 and module 8 both lean on this.
 */
export type Application =
  | { status: 'draft'; jobId: string; updatedAt: string }
  | { status: 'submitted'; jobId: string; submittedAt: string; coverLetter: string }
  | { status: 'in-review'; jobId: string; submittedAt: string; reviewerName: string }
  | { status: 'rejected'; jobId: string; submittedAt: string; reason: string | null }
  | { status: 'offer'; jobId: string; submittedAt: string; salary: SalaryRange }
