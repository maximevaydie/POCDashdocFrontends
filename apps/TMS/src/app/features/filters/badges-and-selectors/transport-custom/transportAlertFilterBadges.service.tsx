import {FilterData, FilteringBadge} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {TransportAlertQuery} from "app/features/filters/badges-and-selectors/transport-custom/transportFilter.types";

export function getTransportAlertFilterBadges(): FilterData<TransportAlertQuery> {
    return {
        key: "transport-alert",
        testId: "transport-alert",
        selector: null,
        getBadges: (query, updateQuery) =>
            alertBadges.map(({queryKey, getLabel}) => ({
                count: query[queryKey] !== null && query[queryKey] !== undefined ? 1 : 0,
                badge: (
                    <FilteringBadge
                        label={getLabel(query[queryKey] as boolean | null)}
                        onDelete={() =>
                            updateQuery({
                                [queryKey]: null,
                            })
                        }
                    />
                ),
            })),
    };
}
const alertBadges: Array<{
    queryKey: keyof TransportAlertQuery;
    getLabel: (value: boolean | null | undefined) => string;
}> = [
    {
        queryKey: "has_price",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withPrice") : t("filters.withoutPrice"),
    },
    {
        queryKey: "has_carbon_footprint",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withCarbonFootprint") : t("filters.withoutCarbonFootprint"),
    },
    {
        queryKey: "has_booking_needed",
        getLabel: () => t("transportForm.bookingNeeded"),
    },
    {
        queryKey: "has_observations",
        getLabel: (value: boolean | null) =>
            value
                ? t("dashboard.transports.disputed", {smart_count: 2}, {capitalize: true})
                : t("dashboard.transports.undisputed", {smart_count: 2}, {capitalize: true}),
    },
    {
        queryKey: "has_complete_cmr_document",
        getLabel: (value: boolean | null) =>
            value
                ? t(
                      "dashboard.transports.done_with_cmr_document",
                      {smart_count: 2},
                      {capitalize: true}
                  )
                : t(
                      "dashboard.transports.done_without_cmr_document",
                      {smart_count: 2},
                      {capitalize: true}
                  ),
    },
    {
        queryKey: "has_non_cmr_document",
        getLabel: (value: boolean | null) =>
            value
                ? t(
                      "dashboard.transports.done_with_non_cmr_document",
                      {smart_count: 2},
                      {capitalize: true}
                  )
                : t(
                      "dashboard.transports.done_without_non_cmr_document",
                      {smart_count: 2},
                      {capitalize: true}
                  ),
    },
    {
        queryKey: "has_cmr_to_be_checked",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withCmrToBeChecked") : t("filters.withoutCmrToBeChecked"),
    },
    {
        queryKey: "has_weight_to_be_checked",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withWeightToBeChecked") : t("filters.withoutWeightToBeChecked"),
    },
    {
        queryKey: "has_customer_to_invoice",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withCustomerToInvoice") : t("filters.withoutCustomerToInvoice"),
    },
    {
        queryKey: "has_missing_invoice_item",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withoutMissingInvoiceItem") : t("filters.withMissingInvoiceItem"),
    },
    {
        queryKey: "has_edition_by_trucker",
        getLabel: (value: boolean | null) =>
            value ? t("filters.withEditionByTrucker") : t("filters.withoutEditionByTrucker"),
    },
];
