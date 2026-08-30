/**
 * Search — the front door of the feature.
 *
 * Nothing outside this folder imports from its internals; everything it offers is
 * re-exported here. Module 7 owns it.
 */
export { SearchAutocomplete } from './components/search-autocomplete'
export type { JobSuggestion } from './components/search-autocomplete'
export { fetchSuggestions } from './api/suggestions-api'
