import {
    DatesBadge,
    FilterData,
    FilteringHeader,
    FiltersPeriod,
    Period,
    PeriodBadge,
    PeriodFilterQueryKeys,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

type TelematicDatePeriodQuery = {
    start_date?: string;
    end_date?: string;
    period?: Period;
};

export function getTelematicDateRangeFilter(): FilterData<TelematicDatePeriodQuery> {
    return {
        key: "telematic-date",
        testId: "telematic-date",
        selector: {
            label: t("dateRangePicker.label"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery) => (
                <TelematicDateRangeSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => {
            return [
                {
                    count: query["period"] ? 1 : 0,
                    badge: (
                        <PeriodBadge<TelematicDatePeriodQuery>
                            key={"period"}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={"period"}
                            typeOfDates={"all"}
                        />
                    ),
                },
                {
                    count: query["start_date"] || query["end_date"] ? 1 : 0,
                    badge: (
                        <DatesBadge<TelematicDatePeriodQuery>
                            key={"telematic-dates-period"}
                            query={query}
                            updateQuery={updateQuery}
                            startDateQueryKey={"start_date"}
                            endDateQueryKey={"end_date"}
                            typeOfDates={"all"}
                        />
                    ),
                },
            ];
        },
    };
}

type Props = {
    query: TelematicDatePeriodQuery;
    updateQuery: (query: Partial<TelematicDatePeriodQuery>) => void;
};

function TelematicDateRangeSelector({query, updateQuery}: Props) {
    const queryKeys: PeriodFilterQueryKeys<TelematicDatePeriodQuery> = {
        start_date_key: "start_date",
        end_date_key: "end_date",
        period_key: "period",
    };

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("common.date")}
                conditionLabel={t("filter.containInPeriod")}
            />
            <FiltersPeriod<TelematicDatePeriodQuery>
                currentQuery={query}
                updateQuery={updateQuery}
                queryKeys={queryKeys}
                selectionOnly
            />
        </>
    );
}
