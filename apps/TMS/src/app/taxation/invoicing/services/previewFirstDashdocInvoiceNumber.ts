import {formatDate} from "dashdoc-utils";

import {InvoiceNumberingPostData} from "app/taxation/invoicing/types/invoiceSettingsTypes";

export function previewFirstDashdocInvoiceNumber(
    numberingData: InvoiceNumberingPostData,
    invoicingDate?: Date | null
) {
    const date = invoicingDate ? invoicingDate : new Date();

    const prefix = previewInvoicePrefix(numberingData.prefix_template, date);
    const firstInvoiceCounter = previewFirstInvoiceCounter(numberingData, date);
    return `${prefix}${firstInvoiceCounter}`;
}

export function previewFirstInvoiceCounter(
    numberingData: InvoiceNumberingPostData,
    invoicingDate: Date
) {
    const {reset_period, last_invoice_date_outside_dashdoc, last_invoice_number_outside_dashdoc} =
        numberingData;

    const year = invoicingDate.getFullYear();
    const month = invoicingDate.getMonth();

    // If the reset_period is "year" or "month", we need to check if the last_invoice_date_outside_dashdoc is in the same period
    // If it is, we need to increment the last_invoice_number_outside_dashdoc by 1
    // If it is not, we need to reset the last_invoice_number_outside_dashdoc to 1
    let nextInvoiceNumber = 1;
    const lastInvoiceDate = last_invoice_date_outside_dashdoc
        ? new Date(last_invoice_date_outside_dashdoc)
        : null;

    if (reset_period === "year") {
        if (
            (lastInvoiceDate && lastInvoiceDate.getFullYear() === year) ||
            lastInvoiceDate === null
        ) {
            nextInvoiceNumber = last_invoice_number_outside_dashdoc + 1;
        }
    }
    if (reset_period === "month") {
        if (
            (lastInvoiceDate &&
                lastInvoiceDate.getFullYear() === year &&
                lastInvoiceDate.getMonth() === month) ||
            lastInvoiceDate === null
        ) {
            nextInvoiceNumber = last_invoice_number_outside_dashdoc + 1;
        }
    }
    if (reset_period === "never") {
        nextInvoiceNumber = last_invoice_number_outside_dashdoc + 1;
    }
    return nextInvoiceNumber;
}

export function previewInvoicePrefix(prefixTemplate: string, date: Date) {
    return prefixTemplate
        .replace(/\[\[year\]\]/g, formatDate(date, "yyyy"))
        .replace(/\[\[month\]\]/g, formatDate(date, "MM"));
}
