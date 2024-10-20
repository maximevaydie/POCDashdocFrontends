import {apiService} from "@dashdoc/web-common";
import {InvoiceItem} from "dashdoc-utils";
import React from "react";

export type InvoiceItemSuggestionArguments = {
    customerToInvoiceId?: number;
    shipperId?: number;
};

export const InvoiceItemSuggestionArgumentsContext = React.createContext<
    InvoiceItemSuggestionArguments | undefined
>(undefined);

export async function fetchInvoiceItemSuggestion(
    invoiceItemSuggestionArguments: InvoiceItemSuggestionArguments | undefined
): Promise<{
    suggested_invoice_item: InvoiceItem | null;
}> {
    return apiService.post(
        "invoice-item-catalog/suggest-invoice-item/",
        {
            customer_to_invoice_id: invoiceItemSuggestionArguments?.customerToInvoiceId,
            shipper_id: invoiceItemSuggestionArguments?.shipperId,
        },
        {apiVersion: "web"}
    );
}
