import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {TransportInvoicingStatusQuery} from "app/features/filters/badges-and-selectors/transport-statuses/statusFilter.types";

export function getTransportInvoicingStatusFilter(
    hasInvoiceEntityEnabled: boolean,
    ignore?: boolean
): FilterData<TransportInvoicingStatusQuery> {
    return getStaticListFilter<TransportInvoicingStatusQuery>({
        key: "invoicing-status",
        label: t("filter.invoicingStatus"),
        icon: "checkList",
        items: getTransportInvoicingStatusItems(hasInvoiceEntityEnabled),
        queryKey: "invoicing_status__in",
        ignore,
        testId: "invoicing-status",
    });
}

export function getTransportInvoicingStatusItems(hasInvoiceEntityEnabled: boolean) {
    const allOptions = [
        {label: t("transportInvoicingStatus.unverified"), value: "unverified"},
        {label: t("components.verified"), value: "verified"},
        {
            label: t("components.draftInProgress"),
            value: "draft",
        },
        {label: t("components.billed"), value: "final"},
        {label: t("components.paid"), value: "paid"},
    ];

    if (hasInvoiceEntityEnabled) {
        return allOptions;
    }
    return allOptions.filter((option) => option.value !== "draft");
}
