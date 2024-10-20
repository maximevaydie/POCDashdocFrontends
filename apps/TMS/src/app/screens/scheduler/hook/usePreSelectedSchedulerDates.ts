import createPersistedState from "use-persisted-state";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";

const PRESELECTED_SCHEDULER_DATES_STORAGE_KEY = "scheduler.selectedDates";
const preselectedDatesState = createPersistedState(
    PRESELECTED_SCHEDULER_DATES_STORAGE_KEY,
    sessionStorage
);

export function usePreSelectedSchedulerDates() {
    const [dateQuery, setSelectedDatesQuery] = preselectedDatesState<
        Pick<SchedulerFilters, "period" | "start_date" | "end_date">
    >({});

    return {dateQuery, setSelectedDatesQuery};
}
