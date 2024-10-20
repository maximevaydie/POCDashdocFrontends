import {canCreditTotally} from "app/services/invoicing/invoice.service";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

export type InvoiceAction =
    | "sendReminder"
    | "delete"
    | "markFinal"
    | "markNotFinal"
    | "markPaid"
    | "markNotPaid"
    | "exportDocuments"
    | "createCreditNote"
    | "openInNewTab"
    | "duplicate";

function getMainActions(status: Invoice["status"], fromSharing: boolean) {
    let actions: InvoiceAction[] = [];
    if (fromSharing) {
        actions.push("exportDocuments");
    } else {
        switch (status) {
            case "paid":
                actions.push("markNotPaid");
                break;
            case "final":
                actions.push("markPaid");
                break;
            case "draft":
                actions.push("markFinal");
                break;
        }
    }
    return actions;
}

function getExtraActions(
    invoice: Invoice,
    fromSharing: boolean,
    hasDashdocInvoicingEnabled: boolean
) {
    if (fromSharing) {
        return [];
    }
    let actions: InvoiceAction[] = [];

    if (invoice.status === "final" && invoice.credit_notes.length === 0 && !invoice.is_dashdoc) {
        actions.push("markNotFinal");
    }

    if (invoice.status === "final" && invoice.is_dashdoc) {
        actions.push("sendReminder");
    }

    if (canCreditTotally(invoice, hasDashdocInvoicingEnabled)) {
        actions.push("createCreditNote");
    }

    if (hasDashdocInvoicingEnabled && invoice.is_bare_invoice && invoice.is_dashdoc) {
        actions.push("duplicate");
    }

    actions.push("exportDocuments");

    if (invoice.status === "draft") {
        actions.push("delete");
    }
    return actions;
}

export const invoiceActionsService = {
    getMainActions,
    getExtraActions,
};
