import { describe, it, expect, beforeEach } from 'vitest'
import { AppConfig, appConfig } from './singleton'

describe('Singleton Pattern', () => {
  beforeEach(() => {
    AppConfig._reset()
  })

  it('returns the exact same instance on repeated getInstance calls', () => {
    const config1 = AppConfig.getInstance()
    const config2 = AppConfig.getInstance()

    expect(config1).toBe(config2)
  })

  it('prevents direct second instantiation with new', () => {
    AppConfig.getInstance()

    expect(() => {
      new AppConfig()
    }).toThrow('Cannot instantiate more than one AppConfig')
  })

  it('shares state across references', () => {
    const a = AppConfig.getInstance()
    const b = AppConfig.getInstance()

    expect(b.activeTheme).toBe('dark')
    a.setTheme('light')
    expect(b.activeTheme).toBe('light')
  })

  it('is frozen when exported directly as appConfig', () => {
    expect(Object.isFrozen(appConfig)).toBe(true)
    expect(() => {
      // @ts-expect-error testing runtime freeze
      appConfig.apiUrl = 'https://malicious.url'
    }).toThrow()
  })
})
