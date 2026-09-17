/**
 * Proxy Pattern (https://javascriptpatterns.vercel.app/patterns/design-patterns/proxy-pattern)
 *
 * Intercept and control interactions to target objects.
 * Uses Reflect API to maintain default language semantics and forward operations.
 */

export interface UserProfile {
  id: string
  username: string
  age: number
  email: string
  role: 'engineer' | 'lead' | 'manager'
}

export interface ProxyAuditLog {
  property: string
  previousValue: unknown
  newValue: unknown
  timestamp: number
}

export function createReactiveUser(
  initialUser: UserProfile,
  onAudit?: (log: ProxyAuditLog) => void
): UserProfile {
  return new Proxy(initialUser, {
    get(target, prop, receiver) {
      // Reflect.get maintains prototype chain & getter bindings
      const value = Reflect.get(target, prop, receiver)
      return value
    },

    set(target, prop, value, receiver) {
      if (typeof prop !== 'string') {
        return Reflect.set(target, prop, value, receiver)
      }

      // Validation Rules
      if (prop === 'username') {
        if (typeof value !== 'string' || value.trim().length < 3) {
          throw new TypeError('Username must be a string of at least 3 characters.')
        }
      }

      if (prop === 'age') {
        if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0 || value > 120) {
          throw new RangeError('Age must be a positive integer between 1 and 120.')
        }
      }

      if (prop === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          throw new TypeError('Invalid email address format.')
        }
      }

      const prev = Reflect.get(target, prop, receiver)
      const success = Reflect.set(target, prop, value, receiver)

      if (success && onAudit) {
        onAudit({
          property: prop,
          previousValue: prev,
          newValue: value,
          timestamp: Date.now(),
        })
      }

      return success
    },

    deleteProperty(target, prop) {
      if (prop === 'id') {
        throw new Error('Cannot delete immutable property: id')
      }
      return Reflect.deleteProperty(target, prop)
    },
  })
}
