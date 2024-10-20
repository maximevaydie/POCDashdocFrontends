import {
    DatesBadge,
    FilterData,
    FilteringHeader,
    FiltersPeriod,
    PeriodBadge,
    PeriodFilterQueryKeys,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {dateRangePickerStaticRanges} from "@dashdoc/web-ui";
import React from "react";

import {DueDatePeriodQuery} from "./invoiceDateRange.types";

export function getDueDateRangeFilter(): FilterData<DueDatePeriodQuery> {
    return {
        key: "due-date",
        testId: "due-date",
        selector: {
            label: t("common.dueDate"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery) => (
                <DueDateRangeSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => {
            return [
                {
                    count: query["due_period"] ? 1 : 0,
                    badge: (
                        <PeriodBadge<DueDatePeriodQuery>
                            key={"period"}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={"due_period"}
                            typeOfDates={"due"}
                            staticRanges={{
                                week: dateRangePickerStaticRanges["week"],
                                last_week: dateRangePickerStaticRanges["last_week"],
                                month: dateRangePickerStaticRanges["month"],
                                last_month: dateRangePickerStaticRanges["last_month"],
                            }}
                        />
                    ),
                },
                {
                    count: query["due_start_date"] || query["due_end_date"] ? 1 : 0,
                    badge: (
                        <DatesBadge<DueDatePeriodQuery>
                            key={"due-dates-period"}
                            query={query}
                            updateQuery={updateQuery}
                            startDateQueryKey={"due_start_date"}
                            endDateQueryKey={"due_end_date"}
                            typeOfDates={"due"}
                        />
                    ),
                },
            ];
        },
    };
}

type Props = {
    query: DueDatePeriodQuery;
    updateQuery: (query: Partial<DueDatePeriodQuery>) => void;
};

function DueDateRangeSelector({query, updateQuery}: Props) {
    const queryKeys: PeriodFilterQueryKeys<DueDatePeriodQuery> = {
        start_date_key: "due_start_date",
        end_date_key: "due_end_date",
        period_key: "due_period",
    };

    return (
        <>
            <FilteringHeader dataTypeLabel={t("common.dueDate")} conditionLabel={t("filter.in")} />
            <FiltersPeriod<DueDatePeriodQuery>
                currentQuery={query}
                updateQuery={updateQuery}
                queryKeys={queryKeys}
                selectionOnly
                periodFilterProps={{
                    staticRanges: {
                        week: dateRangePickerStaticRanges["week"],
                        last_week: dateRangePickerStaticRanges["last_week"],
                        month: dateRangePickerStaticRanges["month"],
                        last_month: dateRangePickerStaticRanges["last_month"],
                    },
                }}
            />
        </>
    );
}
