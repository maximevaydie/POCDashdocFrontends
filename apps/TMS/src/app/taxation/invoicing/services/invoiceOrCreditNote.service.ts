import {addDays} from "date-fns";

export function getDueDateFromInvoicingDate(invoicingDate: Date) {
    return addDays(invoicingDate, 30);
}
