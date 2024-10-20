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

import {InvoicingDatePeriodQuery} from "./invoiceDateRange.types";

export function getInvoicingDateRangeFilter(): FilterData<InvoicingDatePeriodQuery> {
    return {
        key: "invoicing-date",
        testId: "invoicing-date",
        selector: {
            label: t("common.invoicingDate"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery) => (
                <InvoicingDateRangeSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => {
            return [
                {
                    count: query["invoicing_period"] ? 1 : 0,
                    badge: (
                        <PeriodBadge<InvoicingDatePeriodQuery>
                            key={"period"}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={"invoicing_period"}
                            typeOfDates={"invoicing"}
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
                    count: query["invoicing_start_date"] || query["invoicing_end_date"] ? 1 : 0,
                    badge: (
                        <DatesBadge<InvoicingDatePeriodQuery>
                            key={"invoicing-dates-period"}
                            query={query}
                            updateQuery={updateQuery}
                            startDateQueryKey={"invoicing_start_date"}
                            endDateQueryKey={"invoicing_end_date"}
                            typeOfDates={"invoicing"}
                        />
                    ),
                },
            ];
        },
    };
}

type Props = {
    query: InvoicingDatePeriodQuery;
    updateQuery: (query: Partial<InvoicingDatePeriodQuery>) => void;
};

function InvoicingDateRangeSelector({query, updateQuery}: Props) {
    const queryKeys: PeriodFilterQueryKeys<InvoicingDatePeriodQuery> = {
        start_date_key: "invoicing_start_date",
        end_date_key: "invoicing_end_date",
        period_key: "invoicing_period",
    };

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("common.invoicingDate")}
                conditionLabel={t("filter.in")}
            />
            <FiltersPeriod<InvoicingDatePeriodQuery>
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
