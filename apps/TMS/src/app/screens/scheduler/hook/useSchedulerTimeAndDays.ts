import {useCallback} from "react";
import createPersistedState from "use-persisted-state";

import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

type SchedulerTimeAndDaysState = {
    timeRange: {start: string; end: string} | null;
    hideSaturdays: boolean;
    hideSundays: boolean;
};

const PRESELECTED_SCHEDULER_TIME_AN_DAYS_STORAGE_KEY = "schedulerTimeAndDays";
const preselectedSchedulerTimeAndDaysState = createPersistedState(
    PRESELECTED_SCHEDULER_TIME_AN_DAYS_STORAGE_KEY
);

export function useSchedulerTimeAndDays() {
    const isSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const [preselectedSchedulerTimeAndDays, setPreselectedSchedulerTimeAndDays] =
        preselectedSchedulerTimeAndDaysState<SchedulerTimeAndDaysState>({
            timeRange: null,
            hideSaturdays: false,
            hideSundays: false,
        });

    const setTimeRange = useCallback(
        (value: SchedulerTimeAndDaysState["timeRange"]) => {
            setPreselectedSchedulerTimeAndDays((prev) => ({
                ...prev,
                timeRange: isSchedulerByTimeEnabled ? value : null,
            }));
        },
        [isSchedulerByTimeEnabled, setPreselectedSchedulerTimeAndDays]
    );

    const setHideSaturdays = useCallback(
        (value: SchedulerTimeAndDaysState["hideSaturdays"]) => {
            setPreselectedSchedulerTimeAndDays((prev) => ({
                ...prev,
                hideSaturdays: value,
            }));
        },
        [setPreselectedSchedulerTimeAndDays]
    );
    const setHideSundays = useCallback(
        (value: SchedulerTimeAndDaysState["hideSundays"]) => {
            setPreselectedSchedulerTimeAndDays((prev) => ({
                ...prev,
                hideSundays: value,
            }));
        },
        [setPreselectedSchedulerTimeAndDays]
    );

    return {
        timeRange: isSchedulerByTimeEnabled ? preselectedSchedulerTimeAndDays.timeRange : null,
        hideSaturdays: preselectedSchedulerTimeAndDays.hideSaturdays,
        hideSundays: preselectedSchedulerTimeAndDays.hideSundays,
        setTimeRange,
        setHideSaturdays,
        setHideSundays,
    };
}
