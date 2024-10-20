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

import {TransportsDatePeriodQuery} from "./invoiceDateRange.types";

export function getTransportsDateRangeFilter(): FilterData<TransportsDatePeriodQuery> {
    return {
        key: "transports-date",
        testId: "transports-date",
        selector: {
            label: t("filter.transportsDates"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery) => (
                <TransportsDateRangeSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => {
            return [
                {
                    count: query["transports_period"] ? 1 : 0,
                    badge: (
                        <PeriodBadge<TransportsDatePeriodQuery>
                            key={"period"}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={"transports_period"}
                            typeOfDates={"transports"}
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
                    count: query["transports_start_date"] || query["transports_end_date"] ? 1 : 0,
                    badge: (
                        <DatesBadge<TransportsDatePeriodQuery>
                            key={"transports-dates-period"}
                            query={query}
                            updateQuery={updateQuery}
                            startDateQueryKey={"transports_start_date"}
                            endDateQueryKey={"transports_end_date"}
                            typeOfDates={"transports"}
                        />
                    ),
                },
            ];
        },
    };
}

type Props = {
    query: TransportsDatePeriodQuery;
    updateQuery: (query: Partial<TransportsDatePeriodQuery>) => void;
};

function TransportsDateRangeSelector({query, updateQuery}: Props) {
    const queryKeys: PeriodFilterQueryKeys<TransportsDatePeriodQuery> = {
        start_date_key: "transports_start_date",
        end_date_key: "transports_end_date",
        period_key: "transports_period",
    };

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("filter.transportsDates")}
                conditionLabel={t("filter.in")}
            />
            <FiltersPeriod<TransportsDatePeriodQuery>
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
