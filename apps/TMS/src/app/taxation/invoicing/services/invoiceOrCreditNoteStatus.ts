import {t} from "@dashdoc/web-core";
import {BadgeProps} from "@dashdoc/web-ui";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

export function getInvoiceStatusLabel(invoiceStatus: Invoice["status"]) {
    switch (invoiceStatus) {
        case "draft":
            return t("invoice.status.draft");
        case "final":
            return t("invoice.status.final");
        case "paid":
            return t("invoice.status.paid");
    }
}
export function getCreditNoteStatusLabel(creditNoteStatus: CreditNote["status"]) {
    switch (creditNoteStatus) {
        case "draft":
            return t("creditNote.status.draft");
        case "final":
            return t("creditNote.status.final");
        case "paid":
            return t("creditNote.status.paid");
    }
}

export function getStatusBadgeVariant(
    invoiceStatus: Invoice["status"] | CreditNote["status"]
): BadgeProps["variant"] | undefined {
    switch (invoiceStatus) {
        case "draft":
            return "neutral";
        case "final":
            return "blue";
        case "paid":
            return "success";
        default:
            return undefined;
    }
}
