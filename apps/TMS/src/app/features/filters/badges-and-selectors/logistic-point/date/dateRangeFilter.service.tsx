import {FilterData} from "@dashdoc/web-common";
import {
    DateRangeSelector,
    BadgeDatesTypesKeys,
    DatesBadge,
    PeriodBadge,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {DateRangeQuery} from "./types";

export function getDateRangeFilter(): FilterData<DateRangeQuery> {
    return {
        key: "period",
        testId: "period",
        selector: {
            label: t("common.creationDate"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery, dataType) => (
                <DateRangeSelector<DateRangeQuery>
                    query={query}
                    updateQuery={updateQuery}
                    initialDataType={dataType}
                />
            ),
        },
        getBadges: (query, updateQuery) =>
            (
                [
                    {
                        startDateKey: "start_date",
                        endDateKey: "end_date",
                        periodQueryKey: "period",
                        typeOfDates: "all",
                    },
                ] as Array<BadgeDatesTypesKeys<DateRangeQuery>>
            ).flatMap(({startDateKey, endDateKey, periodQueryKey, typeOfDates}) => [
                {
                    count: query[periodQueryKey] ? 1 : 0,
                    badge: (
                        <PeriodBadge<DateRangeQuery>
                            key={periodQueryKey}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={periodQueryKey}
                            typeOfDates={typeOfDates}
                        />
                    ),
                    selectorDataType: typeOfDates,
                },
                {
                    count: query[startDateKey] || query[endDateKey] ? 1 : 0,
                    badge: (
                        <DatesBadge<DateRangeQuery>
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
