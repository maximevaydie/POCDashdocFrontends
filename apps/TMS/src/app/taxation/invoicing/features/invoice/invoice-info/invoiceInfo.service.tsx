import {invoiceLineService} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-line-groups/invoiceLine.service";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type InvoiceSummary = {
    [id: string]: InvoiceSummaryItem;
};
type InvoiceSummaryItem = {uid: string; label: string; amount: number};

function getInvoiceItemsSummary(invoice: Invoice): InvoiceSummaryItem[] {
    const invoiceItemsSummary: InvoiceSummary = {};

    const allLines = invoiceLineService.getAllLines(invoice);
    allLines.map((line) => {
        const invoiceItem = line.invoice_item;
        const lineAmount = parseFloat(line.amount);
        if (invoiceItem?.uid) {
            if (invoiceItemsSummary[invoiceItem.uid]) {
                invoiceItemsSummary[invoiceItem.uid].amount += lineAmount;
            } else {
                invoiceItemsSummary[invoiceItem.uid] = {
                    uid: invoiceItem.uid,
                    label: invoiceItem.description,
                    amount: lineAmount,
                };
            }
        }
    });
    return Object.values(invoiceItemsSummary).sort((a, b) => b.amount - a.amount);
}
export const invoiceInfoService = {
    getInvoiceItemsSummary,
};
