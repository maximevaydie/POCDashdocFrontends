import {apiService} from "@dashdoc/web-common";
import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {formatNumber, TransportsCounts, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";

import {TabName} from "app/common/tabs";
import {
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
} from "app/types/businessStatus";

import {ButtonFilter} from "./ButtonFilter";
import {
    getTransportsQueryParamsFromFiltersQuery,
    FilterQueryWithNavigationParameters,
} from "./utils";

export type TransportsCountButtonFiltersProps<TQuery> = {
    currentQuery: TQuery;
    updateQuery: (newQuery: Partial<TQuery>, method?: "push" | "replace") => void;
    displayWithoutAlerts?: boolean; // Display the filter for transports without alerts
};

type AlertFilter = {
    dataTestId?: string;
    countKey: keyof TransportsCounts;
    getLabel: (count: number | undefined) => string;
    defineActiveness: {
        when: keyof FilterQueryWithNavigationParameters;
        is: boolean;
    };
};

type AlertType =
    | "price"
    | "carbonFootprint"
    | "observations"
    | "completeCMRDocument"
    | "cmrToBeChecked"
    | "weightToBeChecked"
    | "customerToInvoice"
    | "missingInvoiceItem"
    | "editionByTrucker"
    | "missingBooking";

const alertFilters: Record<AlertType, AlertFilter> = {
    price: {
        dataTestId: "button-filter-no-price",
        countKey: "without_price",
        defineActiveness: {
            when: "has_price",
            is: false,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithoutPrice", {
                count: formatNumber(count),
            }),
    },
    carbonFootprint: {
        dataTestId: "button-filter-no-carbon-footprint",
        countKey: "without_carbon_footprint",
        defineActiveness: {
            when: "has_carbon_footprint",
            is: false,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithoutCarbonFootprint", {
                count: formatNumber(count),
            }),
    },
    observations: {
        dataTestId: "button-filter-has-observations",
        countKey: "with_observations",
        defineActiveness: {
            when: "has_observations",
            is: true,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithObservations", {
                count: formatNumber(count),
            }),
    },
    completeCMRDocument: {
        dataTestId: "button-filter-no-complete-cmr-document",
        countKey: "without_complete_cmr_document",
        defineActiveness: {
            when: "has_complete_cmr_document",
            is: false,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithoutCMRDocument", {
                count: formatNumber(count),
            }),
    },
    cmrToBeChecked: {
        dataTestId: "button-filter-cmr-to-be-checked",
        countKey: "with_cmr_to_be_checked",
        defineActiveness: {
            when: "has_cmr_to_be_checked",
            is: true,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithCmrToBeChecked", {
                count: formatNumber(count),
            }),
    },
    weightToBeChecked: {
        dataTestId: "button-filter-weight-to-be-checked",
        countKey: "with_weight_to_be_checked",
        defineActiveness: {
            when: "has_weight_to_be_checked",
            is: true,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithWeightToBeChecked", {
                count: formatNumber(count),
            }),
    },
    customerToInvoice: {
        dataTestId: "button-filter-without-customer-to-invoice",
        countKey: "without_customer_to_invoice",
        defineActiveness: {
            when: "has_customer_to_invoice",
            is: false,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithoutCustomerToinvoice", {
                smart_count: formatNumber(count),
            }),
    },
    missingInvoiceItem: {
        dataTestId: "button-filter-with-missing-invoice-item",
        countKey: "with_missing_invoice_item",
        defineActiveness: {
            when: "has_missing_invoice_item",
            is: true,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithoutInvoiceItem", {
                smart_count: formatNumber(count),
            }),
    },
    missingBooking: {
        dataTestId: "button-filter-with-missing-booking",
        countKey: "with_missing_booking",
        defineActiveness: {
            when: "has_booking_needed",
            is: true,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithoutBooking", {
                smart_count: formatNumber(count),
            }),
    },
    editionByTrucker: {
        dataTestId: "button-filter-edition-by-trucker",
        countKey: "with_edition_by_trucker",
        defineActiveness: {
            when: "has_edition_by_trucker",
            is: true,
        },
        getLabel: (count: number | undefined) =>
            t("filters.transportsWithEditionByTrucker", {
                smart_count: formatNumber(count),
            }),
    },
};

export const TransportsCountButtonFilters: FunctionComponent<
    TransportsCountButtonFiltersProps<FilterQueryWithNavigationParameters>
> = ({currentQuery, updateQuery, displayWithoutAlerts}) => {
    const [filteredTransportsCounts, setFilteredTransportsCounts] =
        useState<TransportsCounts | null>(null);
    const [
        isFilteredTransportsCountLoading,
        loadFilteredTransportsCount,
        unloadFilteredTransportsCount,
    ] = useToggle(false);

    const timezone = useTimezone();

    const alertsByTab: Partial<Record<TabName, AlertType[]>> = useMemo(() => {
        return {
            [TRANSPORTS_TAB]: ["missingBooking"],
            [TRANSPORTS_TO_PLAN_TAB]: ["missingBooking"],
            [TRANSPORTS_TO_SEND_TO_TRUCKER_TAB]: ["missingBooking"],
            [TRANSPORTS_ONGOING_TAB]: ["missingBooking"],
            [ORDERS_TAB]: ["missingBooking"],
            [ORDERS_TO_ASSIGN_OR_DECLINED_TAB]: ["missingBooking"],
            [ORDERS_TO_SEND_TO_CARRIER_TAB]: ["missingBooking"],
            [ORDERS_AWAITING_CONFIRMATION_TAB]: ["missingBooking"],
            [ORDERS_ONGOING_TAB]: ["missingBooking"],
            [TRANSPORTS_DONE_TAB]: [
                "price",
                "carbonFootprint",
                "observations",
                "completeCMRDocument",
                "cmrToBeChecked",
                "weightToBeChecked",
                "customerToInvoice",
                "missingInvoiceItem",
                "editionByTrucker",
            ],
            [ORDERS_DONE_OR_CANCELLED_TAB]: ["carbonFootprint", "completeCMRDocument"],
        };
    }, []);

    let alerts = useMemo(() => {
        const alertTypes = currentQuery.tab && alertsByTab[currentQuery.tab];
        if (alertTypes) {
            return alertTypes.map((alertType) => alertFilters[alertType]);
        }
        return [];
    }, [currentQuery]);

    useEffect(() => {
        loadFilteredTransportsCount();
        apiService.Transports.getCounts({
            query: {
                ...getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true),
                ordering: undefined,
                // Ignore any toggled filters
                ...alerts.reduce(
                    (acc, alert) => ({
                        ...acc,
                        [alert.defineActiveness.when]: undefined,
                    }),
                    {}
                ),
                // Only includes filter shown in the button filters
                include_filters: alerts.map((alert) => alert.countKey),
            },
        })
            .then(setFilteredTransportsCounts)
            .finally(unloadFilteredTransportsCount);
    }, [
        alerts,
        currentQuery,
        loadFilteredTransportsCount,
        timezone,
        unloadFilteredTransportsCount,
    ]);

    const updateQueryWithCounters = useCallback(
        (newCounterQuery: Partial<typeof currentQuery>) =>
            updateQuery({
                ...currentQuery,
                ...alerts.reduce(
                    (acc, alert) => ({
                        ...acc,
                        [alert.defineActiveness.when]: undefined,
                    }),
                    {}
                ),
                ordering: undefined,
                ...newCounterQuery,
            }),
        [alerts, currentQuery, updateQuery]
    );

    return (
        <>
            {!isFilteredTransportsCountLoading &&
                [
                    displayWithoutAlerts && filteredTransportsCounts?.without_alert ? (
                        <ButtonFilter
                            key={`button-filter-no-alert`}
                            label={t("filters.transportsWithoutWarnings", {
                                count: formatNumber(filteredTransportsCounts.without_alert),
                            })}
                            severity="positive"
                            active={alerts.reduce(
                                (acc, alert) =>
                                    acc &&
                                    currentQuery[alert.defineActiveness.when] ===
                                        !alert.defineActiveness.is,
                                true
                            )}
                            onClick={() =>
                                updateQueryWithCounters(
                                    alerts.reduce(
                                        (acc, alert) => ({
                                            ...acc,
                                            [alert.defineActiveness.when]:
                                                !alert.defineActiveness.is,
                                        }),
                                        {}
                                    )
                                )
                            }
                        />
                    ) : undefined,
                    ...alerts.map((alert) =>
                        filteredTransportsCounts?.[alert.countKey] ? (
                            <ButtonFilter
                                key={alert.dataTestId}
                                label={alert.getLabel(filteredTransportsCounts[alert.countKey])}
                                severity="warn"
                                active={
                                    currentQuery[alert.defineActiveness.when] ===
                                    alert.defineActiveness.is
                                }
                                onClick={() =>
                                    updateQueryWithCounters({
                                        [alert.defineActiveness.when]: alert.defineActiveness.is,
                                    })
                                }
                            />
                        ) : undefined
                    ),
                ].filter(Boolean)}
        </>
    );
};
