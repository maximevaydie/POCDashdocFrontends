import {FilterData, Period, PeriodFilterProps} from "@dashdoc/web-common";
import {
    DateRangeSelector,
    BadgeDatesTypesKeys,
    DatesBadge,
    PeriodBadge,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {CreatedTransportPeriodQuery, TransportPeriodQuery} from "./transportDateRange.types";

export function getTransportDateRangeFilter(
    periodFilterProps?: PeriodFilterProps,
    showCreatedDateType?: boolean,
    defaultPeriod?: Period
): FilterData<TransportPeriodQuery & CreatedTransportPeriodQuery> {
    return {
        key: "period",
        testId: "period",
        selector: {
            label: t("transport.period"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery, dataType) => (
                <DateRangeSelector<TransportPeriodQuery & CreatedTransportPeriodQuery>
                    query={query}
                    updateQuery={updateQuery}
                    initialDataType={dataType}
                    periodFilterProps={periodFilterProps}
                    showCreatedDateType={showCreatedDateType}
                />
            ),
        },
        getBadges: (query, updateQuery) =>
            (
                [
                    showCreatedDateType
                        ? {
                              startDateKey: "created_start_date",
                              endDateKey: "created_end_date",
                              periodQueryKey: "created_period",
                              typeOfDates: "created",
                          }
                        : {
                              startDateKey: "start_date",
                              endDateKey: "end_date",
                              periodQueryKey: "period",
                              typeOfDates: "all",
                          },
                    {
                        startDateKey: "loading_start_date",
                        endDateKey: "loading_end_date",
                        periodQueryKey: "loading_period",
                        typeOfDates: "loading",
                    },
                    {
                        startDateKey: "unloading_start_date",
                        endDateKey: "unloading_end_date",
                        periodQueryKey: "unloading_period",
                        typeOfDates: "unloading",
                    },
                ] as Array<BadgeDatesTypesKeys<TransportPeriodQuery & CreatedTransportPeriodQuery>>
            ).flatMap(function ({startDateKey, endDateKey, periodQueryKey, typeOfDates}) {
                const hasPeriodBadge = query[periodQueryKey];
                const hasDatesBadge = query[startDateKey] || query[endDateKey];
                if (!hasPeriodBadge && !hasDatesBadge) {
                    return [];
                }
                return [
                    {
                        count: 1,
                        badge: hasPeriodBadge ? (
                            <PeriodBadge<TransportPeriodQuery & CreatedTransportPeriodQuery>
                                key={periodQueryKey}
                                query={query}
                                updateQuery={updateQuery}
                                queryKey={periodQueryKey}
                                typeOfDates={typeOfDates}
                                staticRanges={periodFilterProps?.staticRanges}
                                defaultPeriod={defaultPeriod}
                            />
                        ) : (
                            <DatesBadge<TransportPeriodQuery & CreatedTransportPeriodQuery>
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
                ];
            }),
    };
}
