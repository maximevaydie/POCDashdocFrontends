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

import {PaymentDatePeriodQuery} from "./invoiceDateRange.types";

export function getPaymentDateRangeFilter(ignore = false): FilterData<PaymentDatePeriodQuery> {
    return {
        key: "payment-date",
        testId: "payment-date",
        selector: ignore
            ? null
            : {
                  label: t("invoice.paymentDate"),
                  icon: "calendar",
                  getFilterSelector: (query, updateQuery) => (
                      <PaymentDateRangeSelector query={query} updateQuery={updateQuery} />
                  ),
              },
        getBadges: (query, updateQuery) => {
            return [
                {
                    count: query["payment_period"] ? 1 : 0,
                    badge: (
                        <PeriodBadge<PaymentDatePeriodQuery>
                            ignore={ignore}
                            key={"period"}
                            query={query}
                            updateQuery={updateQuery}
                            queryKey={"payment_period"}
                            typeOfDates={"payment"}
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
                    count: query["payment_start_date"] || query["payment_end_date"] ? 1 : 0,
                    badge: (
                        <DatesBadge<PaymentDatePeriodQuery>
                            key={"payment-dates-period"}
                            query={query}
                            updateQuery={updateQuery}
                            startDateQueryKey={"payment_start_date"}
                            endDateQueryKey={"payment_end_date"}
                            typeOfDates={"payment"}
                        />
                    ),
                },
            ];
        },
    };
}

type Props = {
    query: PaymentDatePeriodQuery;
    updateQuery: (query: Partial<PaymentDatePeriodQuery>) => void;
};

function PaymentDateRangeSelector({query, updateQuery}: Props) {
    const queryKeys: PeriodFilterQueryKeys<PaymentDatePeriodQuery> = {
        start_date_key: "payment_start_date",
        end_date_key: "payment_end_date",
        period_key: "payment_period",
    };

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("invoice.paymentDate")}
                conditionLabel={t("filter.in")}
            />
            <FiltersPeriod<PaymentDatePeriodQuery>
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
