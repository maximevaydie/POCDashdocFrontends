import {useTimezone} from "@dashdoc/web-common";
import {DateRangePickerRange} from "@dashdoc/web-ui";
import {parseAndZoneDate, parseDate} from "dashdoc-utils";
import {addDays, differenceInDays, endOfDay, startOfDay} from "date-fns";
import {useCallback, useEffect, useState} from "react";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";

const MAX_DURATION_IN_DAYS = 31;

type State = {
    startDate: Date;
    endDate: Date;
};

export function useDates(
    currentQuery: SchedulerFilters,
    updateQuery?: (query: Partial<SchedulerFilters>) => void
) {
    /**
     * useState / useRef / others hooks
     **/

    const timezone = useTimezone();
    const query = currentQuery; // avoid semgrep error

    const [{startDate, endDate}, setState] = useState<State>(() => {
        const currentDate: Date = parseAndZoneDate(new Date(), timezone) as Date;
        return computeState(currentDate, query);
    });

    /**
     * useEffect
     **/

    useEffect(
        () => {
            setState(() => {
                const currentDate: Date = parseAndZoneDate(new Date(), timezone) as Date;
                return computeState(currentDate, currentQuery);
            });
        },
        /**
         * TODO : there is a magic sauce here to explain
         * if we add setFilterFromQuery in deps, there is an infinite loop
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentQuery.period, currentQuery.start_date, currentQuery.end_date]
    );

    const onDateChange = useCallback(
        (dateRange: DateRangePickerRange) => {
            const newStartDate = dateRange.startDate
                ? startOfDay(dateRange.startDate).toISOString()
                : undefined;
            const newEndDate = dateRange.endDate
                ? endOfDay(dateRange.endDate).toISOString()
                : undefined;
            updateQuery?.({
                start_date: newStartDate,
                end_date: newEndDate,
                period: undefined,
            });
        },
        [updateQuery]
    );

    return {
        startDate,
        endDate,
        onDateChange,
    };
}

function computeState(currentDate: Date, currentQuery: SchedulerFilters): State {
    let start;
    let end;
    switch (currentQuery.period) {
        case "today":
            start = new Date(currentDate);
            end = new Date(currentDate);
            break;
        case "today_and_tomorrow":
            start = new Date(currentDate);
            end = addDays(currentDate, 1);
            break;
        case "around_today":
            start = addDays(currentDate, -1);
            end = addDays(currentDate, 1);
            break;
        case "short_week":
            start = addDays(currentDate, -1);
            end = addDays(currentDate, 3);
            break;
        case "long_week":
            start = addDays(currentDate, -1);
            end = addDays(currentDate, 6);
            break;
        default:
            if (currentQuery.start_date && currentQuery.end_date) {
                // @ts-ignore
                start = startOfDay(parseDate(currentQuery.start_date));
                // @ts-ignore
                end = endOfDay(parseDate(currentQuery.end_date));
                if (differenceInDays(end, start) > MAX_DURATION_IN_DAYS - 1) {
                    end = addDays(start, MAX_DURATION_IN_DAYS - 1);
                }
            } else {
                start = addDays(currentDate, -1);
                end = addDays(currentDate, 3);
            }
    }
    start = startOfDay(start);
    end = endOfDay(end);
    return {startDate: start, endDate: end};
}
