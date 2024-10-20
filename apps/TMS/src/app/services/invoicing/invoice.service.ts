import {t} from "@dashdoc/web-core";
import {checkType, formatNumber, InvoiceItem} from "dashdoc-utils";
import sumBy from "lodash.sumby";

import {Invoice, PartialInvoice} from "app/taxation/invoicing/types/invoice.types";

import {InvoiceError} from "./invoiceError.service";

export type AddInvoiceLineForm = {
    description: string;
    quantity: string;
    unit_price: string;
    invoice_item: InvoiceItem | null;
};

type TransportIds = {
    uid: string;
    pk: number;
};

export type TransportsErrorsMap = {
    [invoiceErrorCode in InvoiceError]: TransportIds[];
};

export type BulkCreateInvoicesWarning = {
    reset_merge_by_invoices_uid: string[];
};

export type CreatedInvoice = {uid: string; document_number: null | string};

/** Must be kept in sync with the output of the backend `CreateDraftInvoiceResponseDict` type. */
export type BulkCreateInvoicesResponse = {
    invoices: CreatedInvoice[];
    invoiced_transport_count: number;
    transports_added_to_draft_count: number;
    invoice_creation_errors: TransportsErrorsMap;
    warnings: BulkCreateInvoicesWarning;
};

export type ExistingDraft = {
    uid: Invoice["uid"];
    price: number;
    transports_count: number;
    created: string;
    notes: string | null;
};

export function getDraftInvoiceLabel(draftInvoice: ExistingDraft) {
    let label = `${t("components.invoice")}: ${formatNumber(draftInvoice.price, {
        style: "currency",
        currency: "EUR",
    })}`;

    return label;
}

/**
 * Checks whether the object is a full invoice, useful for type narrowing.
 */
export function isFullInvoice(invoice: Invoice | PartialInvoice): invoice is Invoice {
    // This isn't perfect, an invoice could potentially have `__partial = false`
    // and still lack some fields. This would be a good use case to implement validation with zod.
    if (invoice.__partial !== false) {
        return false;
    }
    // Add a TypeScript check for good measure, so we can have a compiler error
    // if the type came to change and the narrowing wasn't correct anymore.
    checkType<Invoice>(invoice);
    return true;
}

export function getCreditNotesByStatus(
    invoice: PartialInvoice | Invoice,
    statuses: Invoice["status"][]
) {
    return invoice.credit_notes.filter((creditNote) => statuses.includes(creditNote.status));
}

export function canCreditTotally(invoice: Invoice, hasDahdocInvoicingEnabled: boolean) {
    return (
        invoice.status !== "draft" &&
        invoice.is_dashdoc &&
        parseFloat(invoice.total_price) > 0 &&
        (invoice.credit_notes || [])?.length === 0 &&
        hasDahdocInvoicingEnabled
    );
}

export function getCreditedPrice(invoice: PartialInvoice | Invoice, includeDraft: boolean) {
    let creditNotes = [];
    if (includeDraft) {
        creditNotes = invoice.credit_notes;
    } else {
        creditNotes = invoice.credit_notes.filter((creditNote) => creditNote.status !== "draft");
    }
    return sumBy(creditNotes, (creditNote) => parseFloat(creditNote.total_tax_free_amount));
}

export function isFullyCredited(invoice: PartialInvoice | Invoice, includeDraft: boolean) {
    return getCreditedPrice(invoice, includeDraft) === parseFloat(invoice.total_price);
}
