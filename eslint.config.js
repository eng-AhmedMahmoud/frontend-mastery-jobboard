import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * The architecture is not a diagram in a README — it is these rules.
 *
 * Layers, from the bottom up. A layer may import from the layers below it and never
 * from the layers above:
 *
 *   utils    framework-free. Imports nothing from src at all.
 *   domain   the shared language. Types only, no dependencies.
 *   data     fixtures and the fake server. May use domain.
 *   ui       design-system primitives. May use utils. Knows no business concept.
 *   features business subdomains. May use everything below, never another feature.
 *   app      the composition root. Wires features together. Owns no business logic.
 *
 * Cross-feature imports are banned outright: if two features need to talk, the
 * composition root wires them, or the shared thing belongs in domain / ui / utils.
 * A feature's internals are private — the only public surface is its index.ts.
 */

const deny = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
})

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Nobody reaches past a feature's front door.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: deny([
      {
        group: ['@/features/*/*'],
        message:
          'Import a feature through its front door: @/features/jobs, not a file inside it.',
      },
    ]),
  },

  // utils — the interview utility library. Framework-free by definition, so it may not
  // import anything from this codebase; that is what makes it portable to an interview.
  {
    files: ['src/utils/**/*.ts'],
    ignores: ['src/utils/**/*.test.ts'],
    rules: {
      ...deny([
        { group: ['@/**', '../**'], message: 'src/utils is framework-free — it imports nothing.' },
      ]),
      // debounce and throttle capture `this` on purpose: a debounced *method* has to be
      // callable as one. Losing `this` is the bug the module 3 tests check for, so the
      // alias is the correct implementation, not a smell.
      '@typescript-eslint/no-this-alias': 'off',
    },
  },

  // domain — the shared language. Types only, and it depends on nobody.
  {
    files: ['src/domain/**/*.ts'],
    rules: deny([
      { group: ['@/**'], message: 'src/domain is the bottom layer — it imports nothing from src.' },
    ]),
  },

  // ui — design-system primitives. They know nothing about jobs, employers or applications.
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: deny([
      {
        group: ['@/features/**', '@/data/**', '@/app/**', '@/domain/**'],
        message: 'A ui primitive knows no business concept. Take what it needs as props.',
      },
    ]),
  },

  // data — fixtures and the fake server. Below the UI, so it cannot reach up into it.
  {
    files: ['src/data/**/*.ts'],
    rules: deny([
      {
        group: ['@/features/**', '@/ui/**', '@/app/**'],
        message: 'src/data is below the UI. It may use @/domain and nothing above it.',
      },
    ]),
  },

  // features — a subdomain may use everything below it, but never another feature.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: deny([
      {
        group: ['@/features/**'],
        message:
          'Features do not import each other. Wire them in src/app, or move the shared piece down into domain / ui / utils.',
      },
      { group: ['@/app/**'], message: 'A feature never imports the composition root.' },
    ]),
  },

  // Tests describe behaviour, so they are allowed to reach wherever they need to.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // The stage tooling is Node scripts, not app code.
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
    rules: { 'no-undef': 'off' },
  },
)
