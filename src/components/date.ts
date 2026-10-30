// Components that need `moment`.
//
// Kept out of the core barrel: a bundler links every module a barrel
// re-exports before tree-shaking runs, so re-exporting these from the root
// would make `moment` mandatory even for a consumer who only wants a button.
//
// Reached through the `uiwekit/date` subpath.

export { default as UiCalendar } from './calendar/index.vue'
export { default as UiCalendarGridDays } from './calendar/grid/days/index.vue'
export { default as UiCalendarGridMonths } from './calendar/grid/months/index.vue'
export { default as UiCalendarGridYears } from './calendar/grid/years/index.vue'
export { default as UiDatePicker } from './date-picker/index.vue'
