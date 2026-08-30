/**
 * The job board domain — the shared language of the product.
 *
 * Types only, no logic and no dependencies: every layer above may import from here,
 * and this layer imports from nobody. Module 4 owns this folder.
 */
export type {
  EmploymentType,
  WorkMode,
  SeniorityLevel,
  SalaryRange,
  Job,
  JobFilters,
} from './job'
export type { Employer } from './employer'
export type { Application } from './application'
