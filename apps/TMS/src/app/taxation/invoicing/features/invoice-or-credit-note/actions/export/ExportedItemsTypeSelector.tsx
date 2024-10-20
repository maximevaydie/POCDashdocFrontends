import {t} from "@dashdoc/web-core";
import {Callout, Radio} from "@dashdoc/web-ui";
import React from "react";

import {getExportItemsTotalCount} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/invoiceExport.service";
import {InvoiceExportItemsCounters} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportModal";
import {
    InvoiceExportElement,
    InvoiceExportListType,
    InvoiceExportOpenedFrom,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";

type Props = {
    listType: InvoiceExportListType;
    setListType: (value: InvoiceExportListType) => void;
    itemsCounters: InvoiceExportItemsCounters;
    exportElement: InvoiceExportElement;
    maxItemsToExport: number;
    openedFrom: InvoiceExportOpenedFrom;
};
export function ExportedItemsTypeSelector({
    listType,
    setListType,
    itemsCounters,
    exportElement,
    maxItemsToExport,
    openedFrom,
}: Props) {
    let noSelected;
    if (exportElement === "invoice") {
        noSelected = openedFrom === "credit_note";
    } else if (exportElement === "credit_note") {
        noSelected = openedFrom === "invoice";
    } else {
        noSelected = true;
    }
    const itemCounters = itemsCounters[listType];
    const hasCreditNotes =
        itemCounters.creditNotes && itemCounters.creditNotes > 0 && !(exportElement === "invoice");
    const hasInvoices =
        itemCounters.invoices && itemCounters.invoices > 0 && !(exportElement === "credit_note");
    const totalCount = getExportItemsTotalCount(itemsCounters, listType, exportElement);

    let calloutText;
    let calloutProps = {};
    if (totalCount > maxItemsToExport) {
        calloutText = t("invoiceExportModal.tooMuchItemsExported", {
            count: totalCount,
            max: maxItemsToExport,
        });
        calloutProps = {variant: "danger"};
    } else if (!hasInvoices && !hasCreditNotes) {
        calloutText = t("invoiceExportModal.noItemExported");
        calloutProps = {variant: "warning"};
    } else if (!hasCreditNotes && hasInvoices) {
        calloutText = t("invoiceExportModal.xInvoicesExported", {
            smart_count: itemCounters.invoices || 0,
        });
    } else if (!hasInvoices && hasCreditNotes) {
        calloutText = t("invoiceExportModal.xCreditNotesExported", {
            smart_count: itemCounters.creditNotes || 0,
        });
    } else {
        calloutText = t("invoiceExportModal.xInvoicesAndyCreditNotesExported", {
            invoicesCount: itemCounters.invoices,
            creditNotesCount: itemCounters.creditNotes,
        });
    }
    const callout = (
        <Callout
            data-testid="exported-items-counter-callout"
            mt={-2}
            mb={2}
            p={2}
            maxWidth={"500px"}
            {...calloutProps}
        >
            {calloutText}
        </Callout>
    );
    return (
        <>
            <Radio
                label={t("invoiceExportModal.exportFilteredItems")}
                checked={listType === "filtered"}
                onChange={() => setListType("filtered")}
                data-testid="export-filtered-items-radio"
            />
            {listType === "filtered" && callout}
            {!noSelected && (
                <Radio
                    label={t("invoiceExportModal.exportSelectedItems")}
                    checked={listType === "selected"}
                    onChange={() => setListType("selected")}
                    data-testid="export-selected-items-radio"
                />
            )}
            {listType === "selected" && callout}
            <Radio
                label={t("invoiceExportModal.exportAllItems")}
                checked={listType === "all"}
                onChange={() => setListType("all")}
                data-testid="export-all-items-radio"
            />
            {listType === "all" && callout}{" "}
        </>
    );
}
//
