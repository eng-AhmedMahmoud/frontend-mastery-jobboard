import { describe, it, expect, beforeEach } from 'vitest'
import * as connectionModule from './live-bindings'

describe('Module Pattern & ESM Live Bindings', () => {
  beforeEach(() => {
    connectionModule.resetConnections()
  })

  it('keeps internal state private while exposing getter functions', () => {
    // Cannot access activeConnectionCount directly
    expect((connectionModule as Record<string, unknown>).activeConnectionCount).toBeUndefined()
    expect(connectionModule.getConnectionCount()).toBe(0)
  })

  it('reflects live binding mutations through module functions', () => {
    expect(connectionModule.getConnectionCount()).toBe(0)

    connectionModule.openConnection()
    expect(connectionModule.getConnectionCount()).toBe(1)

    connectionModule.openConnection()
    expect(connectionModule.getConnectionCount()).toBe(2)

    connectionModule.closeConnection()
    expect(connectionModule.getConnectionCount()).toBe(1)
  })
})
