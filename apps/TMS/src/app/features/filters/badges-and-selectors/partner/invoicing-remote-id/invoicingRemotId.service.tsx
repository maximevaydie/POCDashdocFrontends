import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {InvoicingRemoteIdQuery} from "./types";

export function getInvoicingRemoteIdFilter(): FilterData<InvoicingRemoteIdQuery> {
    return getBooleanChoiceFilter({
        key: "has_invoicing_remote_id",
        testId: "has-invoicing-remote-id",
        label: t("components.invoicingRemoteId"),
        icon: "invoice",
        optionsLabels: {
            on: t("companyFilter.hasInvoicingRemoteId"),
            off: t("companyFilter.hasNotInvoicingRemoteId"),
        },
        queryKey: "has_invoicing_remote_id",
    });
}
