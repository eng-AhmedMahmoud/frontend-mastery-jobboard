export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type WorkMode = 'onsite' | 'hybrid' | 'remote'
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'staff'

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

export interface JobFilters {
  query: string
  workMode: WorkMode[]
  seniority: SeniorityLevel[]
  minSalary: number | null
}
