/**
 * Singleton Pattern (https://javascriptpatterns.vercel.app/patterns/design-patterns/singleton-pattern)
 *
 * Share a single global instance throughout our application.
 * Utilizes Object.freeze and ESM module-level caching.
 */

let instance: AppConfig | null = null

export class AppConfig {
  readonly apiUrl: string
  readonly maxRetries: number
  private _activeTheme: 'light' | 'dark'

  constructor(apiUrl = 'https://api.catalystai.llc', maxRetries = 3) {
    if (instance) {
      throw new Error('Cannot instantiate more than one AppConfig. Use AppConfig.getInstance().')
    }
    this.apiUrl = apiUrl
    this.maxRetries = maxRetries
    this._activeTheme = 'dark'
    instance = this
  }

  get activeTheme(): 'light' | 'dark' {
    return this._activeTheme
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._activeTheme = theme
  }

  static getInstance(): AppConfig {
    if (!instance) {
      instance = new AppConfig()
    }
    return instance
  }

  /**
   * For testing teardowns only: resets the singleton instance.
   */
  static _reset(): void {
    instance = null
  }
}

// Module export singleton instance — frozen to prevent property tampering
export const appConfig = Object.freeze(AppConfig.getInstance())
