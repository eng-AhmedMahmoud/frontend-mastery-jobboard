import { describe, it, expect, vi } from 'vitest'
import { createReactiveUser, type UserProfile, type ProxyAuditLog } from './proxy'

describe('Proxy Pattern — Validation & Audit Trap', () => {
  const baseUser: UserProfile = {
    id: 'usr-101',
    username: 'ahmed',
    age: 28,
    email: 'ahmed@catalystai.llc',
    role: 'engineer',
  }

  it('allows reading properties transparently via Reflect', () => {
    const user = createReactiveUser({ ...baseUser })
    expect(user.username).toBe('ahmed')
    expect(user.age).toBe(28)
    expect(user.email).toBe('ahmed@catalystai.llc')
  })

  it('updates valid properties and triggers audit logging callback', () => {
    const auditLogs: ProxyAuditLog[] = []
    const user = createReactiveUser({ ...baseUser }, (log) => auditLogs.push(log))

    user.username = 'tariq'
    expect(user.username).toBe('tariq')
    expect(auditLogs).toHaveLength(1)
    expect(auditLogs[0]).toMatchObject({
      property: 'username',
      previousValue: 'ahmed',
      newValue: 'tariq',
    })
  })

  it('throws TypeError when username is too short', () => {
    const user = createReactiveUser({ ...baseUser })
    expect(() => {
      user.username = 'al'
    }).toThrow(TypeError)
  })

  it('throws RangeError when age is invalid', () => {
    const user = createReactiveUser({ ...baseUser })
    expect(() => {
      user.age = -5
    }).toThrow(RangeError)

    expect(() => {
      user.age = 150
    }).toThrow(RangeError)
  })

  it('throws TypeError when email format is invalid', () => {
    const user = createReactiveUser({ ...baseUser })
    expect(() => {
      user.email = 'not-an-email'
    }).toThrow(TypeError)
  })

  it('prevents deleting protected property id', () => {
    const user = createReactiveUser({ ...baseUser })
    expect(() => {
      // @ts-expect-error testing runtime delete guard
      delete user.id
    }).toThrow('Cannot delete immutable property: id')
  })
})
