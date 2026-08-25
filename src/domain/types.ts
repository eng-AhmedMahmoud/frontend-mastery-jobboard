/**
 * The job board domain. Every stage of the program builds a slice of this product,
 * so these types are shared by all of them and live on `main`.
 */

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type WorkMode = 'onsite' | 'hybrid' | 'remote'
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'staff'

export interface Employer {
  id: string
  name: string
  logoUrl: string | null
  location: string
  employeeCount: number
}

export interface SalaryRange {
  currency: 'EGP' | 'USD' | 'EUR' | 'AED' | 'SAR'
  min: number
  max: number
  period: 'month' | 'year'
}

export interface Job {
  id: string
  title: string
  employerId: string
  location: string
  workMode: WorkMode
  employmentType: EmploymentType
  seniority: SeniorityLevel
  salary: SalaryRange | null
  skills: string[]
  postedAt: string // ISO 8601
  applicantCount: number
}

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

export interface JobFilters {
  query: string
  workMode: WorkMode[]
  seniority: SeniorityLevel[]
  minSalary: number | null
}
