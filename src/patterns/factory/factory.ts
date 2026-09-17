/**
 * Factory Pattern (https://javascriptpatterns.vercel.app/patterns/design-patterns/factory-pattern)
 *
 * Use a factory function to create objects without exposing the instantiation logic.
 * Encapsulates object creation with polymorphic variations and default configurations.
 */

export type JobType = 'remote-frontend' | 'lead-architect' | 'intern'

export interface JobListing {
  id: string
  title: string
  salary: number
  tier: 'entry' | 'mid' | 'senior' | 'staff'
  benefits: string[]
  isPublished: boolean
}

export function createJobFactory(
  type: JobType,
  overrides: { id: string; title: string; salary?: number }
): JobListing {
  switch (type) {
    case 'remote-frontend':
      return {
        id: overrides.id,
        title: overrides.title,
        salary: overrides.salary ?? 85000,
        tier: 'mid',
        benefits: ['Remote Stipend', 'Flexible Hours', 'Health Insurance'],
        isPublished: true,
      }

    case 'lead-architect':
      return {
        id: overrides.id,
        title: overrides.title,
        salary: overrides.salary ?? 160000,
        tier: 'staff',
        benefits: ['Equity', 'Annual Bonus', 'Home Office Budget', 'Executive Health'],
        isPublished: true,
      }

    case 'intern':
      return {
        id: overrides.id,
        title: overrides.title,
        salary: overrides.salary ?? 30000,
        tier: 'entry',
        benefits: ['Mentorship Program', 'Learning Budget'],
        isPublished: false,
      }

    default: {
      const _exhaustive: never = type
      throw new Error(`Unsupported job type: ${_exhaustive}`)
    }
  }
}
