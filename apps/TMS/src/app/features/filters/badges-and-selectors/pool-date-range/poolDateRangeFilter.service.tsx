import {
    DateRangeSelector,
    BadgeDatesTypesKeys,
    DatesBadge,
    PeriodBadge,
    FilterData,
    PeriodFilterQueryKeys,
} from "@dashdoc/web-common";
import {PeriodFilterProps} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {PoolDateRangeQuery} from "./poolDateRange.types";

export const poolPeriodQueryKeys: PeriodFilterQueryKeys<PoolDateRangeQuery> = {
    start_date_key: "pool_start_date",
    end_date_key: "pool_end_date",
    period_key: "pool_period",
};

export function getPoolDateRangeFilter(
    staticRanges: PeriodFilterProps["staticRanges"]
): FilterData<PoolDateRangeQuery> {
    return {
        key: "poolPeriod",
        testId: "pool-period",
        selector: {
            label: t("scheduler.poolOfUnplannedPeriod"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery, dataType) => (
                <DateRangeSelector<PoolDateRangeQuery>
                    query={query}
                    updateQuery={updateQuery}
                    prefix="pool_"
                    periodFilterProps={{staticRanges: staticRanges}}
                    initialDataType={dataType}
                />
            ),
        },
        getBadges: (query, updateQuery) =>
            (
                [
                    {
                        startDateKey: "pool_start_date",
                        endDateKey: "pool_end_date",
                        periodQueryKey: "pool_period",
                        typeOfDates: "all",
                    },
                    {
                        startDateKey: "pool_loading_start_date",
                        endDateKey: "pool_loading_end_date",
                        periodQueryKey: "pool_loading_period",
                        typeOfDates: "loading",
                    },
                    {
                        startDateKey: "pool_unloading_start_date",
                        endDateKey: "pool_unloading_end_date",
                        periodQueryKey: "pool_unloading_period",
                        typeOfDates: "unloading",
                    },
                ] as Array<BadgeDatesTypesKeys<PoolDateRangeQuery>>
            ).flatMap(({startDateKey, endDateKey, periodQueryKey, typeOfDates}) => [
                {
                    count: query[periodQueryKey] ? 1 : 0,
                    badge: (
                        <PeriodBadge<PoolDateRangeQuery>
                            key={periodQueryKey}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={periodQueryKey}
                            typeOfDates={typeOfDates}
                            staticRanges={staticRanges}
                        />
                    ),
                    selectorDataType: typeOfDates,
                },
                {
                    count: query[startDateKey] || query[endDateKey] ? 1 : 0,
                    badge: (
                        <DatesBadge<PoolDateRangeQuery>
                            key={`${typeOfDates}-dates-period`}
                            query={query}
                            updateQuery={updateQuery}
                            startDateQueryKey={startDateKey}
                            endDateQueryKey={endDateKey}
                            typeOfDates={typeOfDates}
                        />
                    ),
                    selectorDataType: typeOfDates,
                },
            ]),
    };
}
