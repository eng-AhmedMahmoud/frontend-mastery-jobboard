/**
 * Perf lab — the four moves module 2 spends ten lessons earning.
 *
 * The front door of the feature: the composition root imports from here, never from a
 * file inside. Module 2 owns it.
 *
 *   visibleRange  do less work   — render the twelve rows on screen, not the six hundred
 *   rafSchedule   do it once     — one handler run per frame, with the newest arguments
 *   batchLayout   do it in order — every read, then every write, so layout runs once
 *   measure       prove it       — a number before and a number after, in the Performance panel
 */
export { visibleRange } from './visible-range'
export type { VisibleRange, VisibleRangeInput } from './visible-range'

export { rafSchedule } from './raf-schedule'
export type { Scheduled, RafSchedulerOptions } from './raf-schedule'

export { batchLayout } from './batch-layout'
export type { BatchLayoutInput } from './batch-layout'

export { measure, isLongTask, LONG_TASK_MS } from './instrument'
export type { Measured, PerformanceLike } from './instrument'
