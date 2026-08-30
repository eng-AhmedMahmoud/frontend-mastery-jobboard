import type { Employer, Job } from '@/domain'

export const EMPLOYERS: Employer[] = [
  { id: 'e1', name: 'Catalyst', logoUrl: null, location: 'Cairo, Egypt', employeeCount: 48 },
  { id: 'e2', name: 'Breadfast', logoUrl: null, location: 'Cairo, Egypt', employeeCount: 900 },
  { id: 'e3', name: 'Instabug', logoUrl: null, location: 'Cairo, Egypt', employeeCount: 320 },
  { id: 'e4', name: 'Halan', logoUrl: null, location: 'Giza, Egypt', employeeCount: 1400 },
  { id: 'e5', name: 'Tabby', logoUrl: null, location: 'Dubai, UAE', employeeCount: 640 },
  { id: 'e6', name: 'Foodics', logoUrl: null, location: 'Riyadh, Saudi Arabia', employeeCount: 780 },
  { id: 'e7', name: 'Vercel', logoUrl: null, location: 'Remote', employeeCount: 500 },
  { id: 'e8', name: 'Paymob', logoUrl: null, location: 'Cairo, Egypt', employeeCount: 520 },
]

const employerById = new Map(EMPLOYERS.map((employer) => [employer.id, employer]))

export const employerOf = (job: Job): Employer => {
  const employer = employerById.get(job.employerId)
  if (!employer) throw new Error(`unknown employer ${job.employerId}`)
  return employer
}
