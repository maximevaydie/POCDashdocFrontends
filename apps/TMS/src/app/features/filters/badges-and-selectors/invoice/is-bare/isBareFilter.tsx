import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {InvoicingTab} from "app/features/pricing/invoices/InvoicesFilteringBar";

export type IsBareQuery = {
    is_bare?: boolean;
};

export function getIsBareFilter(tab: InvoicingTab): FilterData<IsBareQuery> {
    return getBooleanChoiceFilter<IsBareQuery>({
        key: "is-bare",
        testId: "is-bare",
        label: tab === "invoices" ? t("invoices.invoiceType") : t("invoices.creditNoteType"),
        icon: "invoice",
        optionsLabels: {
            on: t("invoices.withoutTransport"),
            off: t("invoices.withTransport"),
        },
        queryKey: "is_bare",
    });
}
