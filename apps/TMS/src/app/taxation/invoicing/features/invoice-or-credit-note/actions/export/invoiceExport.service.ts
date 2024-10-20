import {InvoiceExportItemsCounters} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportModal";
import {
    InvoiceExportElement,
    InvoiceExportListType,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";

export const INVOICE_EXPORT_FORM_ID = "export-invoices-form";

// Same value than for MAX_TRANSPORT_EXPORT, guessed from tests done in production
export const MAX_INVOICE_ITEMS_TO_EXPORT = 6000;

// 10 Invoices around 1MB, 1000 Invoices around 100MB per export max
export const MAX_INVOICE_DOCUMENTS_TO_EXPORT = 1000;

export function getExportItemsTotalCount(
    itemsCounters: InvoiceExportItemsCounters,
    listType: InvoiceExportListType,
    exportElement: InvoiceExportElement
) {
    const itemCounters = itemsCounters[listType];
    let totalCount = 0;
    switch (exportElement) {
        case "invoice":
            totalCount = itemCounters.invoices || 0;
            break;
        case "credit_note":
            totalCount = itemCounters.creditNotes || 0;
            break;
        case "all":
            totalCount = (itemCounters.invoices || 0) + (itemCounters.creditNotes || 0);
            break;
    }
    return totalCount;
}
