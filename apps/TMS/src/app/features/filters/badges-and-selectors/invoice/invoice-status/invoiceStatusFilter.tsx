import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t, TranslationKeys} from "@dashdoc/web-core";
import {checkType} from "dashdoc-utils";

import {InvoiceStatus} from "app/taxation/invoicing/types/invoice.types";

const INVOICE_STATUS_TRANSLATION_KEYS = [
    {
        translationKey: "invoice.status.draft",
        value: "draft",
    },
    {translationKey: "invoice.status.final", value: "final"},
    {translationKey: "invoice.status.paid", value: "paid"},
] as const;

checkType<Readonly<{translationKey: TranslationKeys; value: InvoiceStatus}[]>>(
    INVOICE_STATUS_TRANSLATION_KEYS
);

export type InvoiceStatusQuery = {
    status__in?: InvoiceStatus[];
};

export function getInvoiceStatusFilter(ignore = false): FilterData<InvoiceStatusQuery> {
    const items = INVOICE_STATUS_TRANSLATION_KEYS.map(({translationKey, value}) => ({
        label: t(translationKey),
        value,
    }));

    return getStaticListFilter<InvoiceStatusQuery>({
        key: "status",
        label: t("common.status"),
        icon: "checkList",
        items,
        queryKey: "status__in",
        ignore,
        testId: "filters-invoice-status-radio",
    });
}
