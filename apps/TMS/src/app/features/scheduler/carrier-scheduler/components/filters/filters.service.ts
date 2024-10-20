import {DateRangePickerProps} from "@dashdoc/web-ui";
import {parseDate} from "dashdoc-utils";
import addDays from "date-fns/addDays";
import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";
import cloneDeep from "rfdc/default";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";

export function getPoolDefaultDateStaticRanges(today: Date): DateRangePickerProps["staticRanges"] {
    return {
        until_today: {
            label: "dateRangePicker.staticRanges.untilToday",
            range: {
                getStartDate: () => undefined,
                getEndDate: () => endOfDay(today),
            },
        },
        today: {
            label: "dateRangePicker.staticRanges.today",
            range: {
                getStartDate: () => startOfDay(today),
                getEndDate: () => endOfDay(today),
            },
        },
        tomorrow: {
            label: "dateRangePicker.staticRanges.tomorrow",
            range: {
                getStartDate: () => startOfDay(addDays(today, 1)),
                getEndDate: () => endOfDay(addDays(today, 1)),
            },
        },
    };
}

function getDatetimeRangeString(startDate: Date, endDate: Date) {
    const start = startOfDay(startDate).toISOString();
    const end = endOfDay(endDate).toISOString();
    const datetimeRange = [start, end].join(",");
    return datetimeRange;
}
export function cleanPlannedFilterQuery(
    query: SchedulerFilters,
    startDate: Date,
    endDate: Date,
    extendedView: boolean
) {
    const filteredRowsIds =
        query?.view === "trucker"
            ? query?.trucker__in
            : query?.view === "vehicle"
              ? query?.vehicle__in
              : query?.trailer__in;
    const cleanedQuery = {
        view: query.view,
        extended_view: extendedView,
        datetime_range: getDatetimeRangeString(startDate, endDate),
        rows: filteredRowsIds?.join(","),
    };
    return cleanedQuery;
}

export const cleanUnplannedFilterQuery = (
    today: Date,
    query: SchedulerFilters,
    extendedView: boolean,
    initialPoolOrdering: string | null
): SchedulerFilters & {
    datetime_range?: string;
    date__in?: string;
    loading_date__in?: string;
    unloading_date__in?: string;
    extended_view: boolean;
} => {
    const cleanedQuery = cloneDeep(query) as SchedulerFilters & {
        datetime_range?: string;
        date__in?: string;
        loading_date__in?: string;
        unloading_date__in?: string;
        extended_view: boolean;
    };

    [
        {
            period_key: "pool_period",
            start_date_key: "pool_start_date",
            end_date_key: "pool_end_date",
            datetime_range_key: "date__in",
        },
        {
            period_key: "pool_loading_period",
            start_date_key: "pool_loading_start_date",
            end_date_key: "pool_loading_end_date",
            datetime_range_key: "loading_date__in",
        },
        {
            period_key: "pool_unloading_period",
            start_date_key: "pool_unloading_start_date",
            end_date_key: "pool_unloading_end_date",
            datetime_range_key: "unloading_date__in",
        },
    ].map(
        ({
            period_key,
            start_date_key,
            end_date_key,
            datetime_range_key,
        }: {
            period_key: "pool_period";
            start_date_key: "pool_start_date";
            end_date_key: "pool_end_date";
            datetime_range_key:
                | "datetime_range"
                | "unloading_date__in"
                | "loading_date__in"
                | "date__in";
        }) => {
            let startDate;
            let endDate;

            if (cleanedQuery[start_date_key] || cleanedQuery[end_date_key]) {
                if (cleanedQuery[start_date_key]) {
                    startDate = parseDate(cleanedQuery[start_date_key]);
                }
                if (cleanedQuery[end_date_key]) {
                    endDate = parseDate(cleanedQuery[end_date_key]);
                }
            } else if (cleanedQuery[period_key]) {
                const range =
                    getPoolDefaultDateStaticRanges(today)?.[cleanedQuery[period_key] as string]
                        ?.range;
                if (range) {
                    startDate = range.getStartDate();
                    endDate = range.getEndDate();
                }
            }
            if (startDate || endDate) {
                if (!startDate) {
                    startDate = new Date("1970-01-01");
                }
                if (!endDate) {
                    endDate = new Date("2999-12-31");
                }
                const startDateISO = startOfDay(startDate).toISOString();
                const endDateISO = endOfDay(endDate).toISOString();
                cleanedQuery[datetime_range_key] = [startDateISO, endDateISO].join(",");
            }
        }
    );

    if (cleanedQuery.view === "trucker") {
        cleanedQuery.trucker__isnull = true;
    } else if (cleanedQuery.view === "vehicle") {
        cleanedQuery.vehicle__isnull = true;
    } else if (cleanedQuery.view === "trailer") {
        cleanedQuery.trailer__isnull = true;
    }

    delete cleanedQuery.period;
    delete cleanedQuery.start_date;
    delete cleanedQuery.end_date;
    delete cleanedQuery.pool_period;
    delete cleanedQuery.pool_start_date;
    delete cleanedQuery.pool_end_date;
    delete cleanedQuery.pool_loading_period;
    delete cleanedQuery.pool_loading_start_date;
    delete cleanedQuery.pool_loading_end_date;
    delete cleanedQuery.pool_unloading_period;
    delete cleanedQuery.pool_unloading_start_date;
    delete cleanedQuery.pool_unloading_end_date;
    delete cleanedQuery.trucker__in;
    delete cleanedQuery.vehicle__in;
    delete cleanedQuery.trailer__in;
    delete cleanedQuery.view;
    delete cleanedQuery.tab;
    delete cleanedQuery.ordering_trailers;
    delete cleanedQuery.ordering_vehicles;
    delete cleanedQuery.ordering_truckers;
    delete cleanedQuery.fleet_tags__in;

    if (initialPoolOrdering) {
        cleanedQuery.ordering = cleanedQuery.ordering
            ? `${initialPoolOrdering},${cleanedQuery.ordering}`
            : initialPoolOrdering;
    }

    cleanedQuery.extended_view = extendedView;

    return cleanedQuery;
};
