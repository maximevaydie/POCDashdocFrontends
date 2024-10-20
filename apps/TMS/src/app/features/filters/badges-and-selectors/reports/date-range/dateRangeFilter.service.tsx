import {FilterData, Period, PeriodFilterProps} from "@dashdoc/web-common";
import {
    DateRangeSelector,
    BadgeDatesTypesKeys,
    DatesBadge,
    PeriodBadge,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {CreatedReportPeriodQuery, ReportPeriodQuery} from "./dateRange.types";

export function getDateRangeFilter(
    periodFilterProps?: PeriodFilterProps,
    showCreatedDateType?: boolean,
    defaultPeriod?: Period
): FilterData<ReportPeriodQuery & CreatedReportPeriodQuery> {
    return {
        key: "period",
        testId: "period",
        selector: {
            label: t("transport.period"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery, dataType) => (
                <DateRangeSelector<ReportPeriodQuery & CreatedReportPeriodQuery>
                    query={query}
                    updateQuery={updateQuery}
                    initialDataType={dataType}
                    periodFilterProps={periodFilterProps}
                    showCreatedDateType={showCreatedDateType}
                    updateQueryOnDataTypeChange
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
                ] as Array<BadgeDatesTypesKeys<ReportPeriodQuery & CreatedReportPeriodQuery>>
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
                            <PeriodBadge<ReportPeriodQuery & CreatedReportPeriodQuery>
                                key={periodQueryKey}
                                query={query}
                                updateQuery={updateQuery}
                                queryKey={periodQueryKey}
                                typeOfDates={typeOfDates}
                                staticRanges={periodFilterProps?.staticRanges}
                                defaultPeriod={defaultPeriod}
                            />
                        ) : (
                            <DatesBadge<ReportPeriodQuery & CreatedReportPeriodQuery>
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
