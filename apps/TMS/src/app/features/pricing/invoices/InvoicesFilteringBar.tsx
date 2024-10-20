import {getCompanySetting, useSelector} from "@dashdoc/web-common";
import {
    FilteringBar,
    FilteringBarProps,
} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {getCustomerFilter} from "app/features/filters/badges-and-selectors/invoice/customer/customerFilter";
import {getDueDateRangeFilter} from "app/features/filters/badges-and-selectors/invoice/invoice-date-range/dueDateRangeFilter";
import {getInvoicingDateRangeFilter} from "app/features/filters/badges-and-selectors/invoice/invoice-date-range/invoicingDateRangeFilter";
import {getPaymentDateRangeFilter} from "app/features/filters/badges-and-selectors/invoice/invoice-date-range/paymentDateRangeFilter";
import {getTransportsDateRangeFilter} from "app/features/filters/badges-and-selectors/invoice/invoice-date-range/transportsDateRangeFilter";
import {getInvoiceStatusFilter} from "app/features/filters/badges-and-selectors/invoice/invoice-status/invoiceStatusFilter";
import {getIsBareFilter} from "app/features/filters/badges-and-selectors/invoice/is-bare/isBareFilter";
import {getIsLateFilter} from "app/features/filters/badges-and-selectors/invoice/is-late/isLateFilter";
import {getPaymentMethodsFilter} from "app/features/filters/badges-and-selectors/invoice/payment-methods/paymentMethodsFilter";
import {InvoicesOrCreditNotesListQuery} from "app/features/filters/deprecated/utils";
import {
    DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS,
    INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY,
    InvoicesOrCreditNotesSettings,
    InvoicesOrCreditNotesSettingsSchema,
} from "app/features/pricing/invoices/invoicesSettingsView";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

export type InvoicingTab = "invoices" | "creditNotes";

type FilteringProps = {
    currentQuery: InvoicesOrCreditNotesListQuery;
    selectedViewPk: number | undefined;
    tab: InvoicingTab;
    updateQuery: (newQuery: any, method?: "push" | "replace") => void;
    updateSelectedViewPk: (viewPk: number | null | undefined) => void;
};

export function InvoicesFilteringBar({
    currentQuery,
    selectedViewPk,
    tab,
    updateQuery,
    updateSelectedViewPk,
}: FilteringProps) {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const invoicePaymentSetting = useSelector((state) =>
        getCompanySetting(state, "invoice_payment")
    );

    const filters = useMemo(() => {
        const isCreditNotesTabActive = tab === "creditNotes";

        return [
            ...(hasDashdocInvoicingEnabled ? [getIsBareFilter(tab)] : []),
            getCustomerFilter(),
            ...(hasDashdocInvoicingEnabled
                ? [getInvoicingDateRangeFilter(), getDueDateRangeFilter()]
                : [getInvoicingDateRangeFilter(), getTransportsDateRangeFilter()]),
            ...(hasDashdocInvoicingEnabled && invoicePaymentSetting
                ? [getPaymentDateRangeFilter(isCreditNotesTabActive)]
                : []),
            ...(hasDashdocInvoicingEnabled ? [getIsLateFilter(isCreditNotesTabActive)] : []),
            ...(hasDashdocInvoicingEnabled && invoicePaymentSetting
                ? [getPaymentMethodsFilter(isCreditNotesTabActive)]
                : []),
            getInvoiceStatusFilter(),
        ];
    }, [hasDashdocInvoicingEnabled, tab, invoicePaymentSetting]);

    const viewsParams: FilteringBarProps<InvoicesOrCreditNotesSettings>["viewsParams"] = {
        selectedViewPk: selectedViewPk,
        setSelectedViewPk: updateSelectedViewPk,
        viewCategory: INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY,
        addEnabled: true,
        deleteEnabled: true,
    };

    return (
        <Box pb={2} flex={1}>
            <FilteringBar<InvoicesOrCreditNotesSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS}
                parseQuery={InvoicesOrCreditNotesSettingsSchema.parse}
                viewsParams={viewsParams}
                size="large"
                data-testid="invoices-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("invoices.searchBarPlaceholder")}
            />
        </Box>
    );
}
