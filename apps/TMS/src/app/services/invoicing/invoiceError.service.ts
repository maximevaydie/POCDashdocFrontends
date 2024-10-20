import {t} from "@dashdoc/web-core";

// Keep it in sync with InvoicingErrorType in backend
export type InvoiceError =
    | "already_invoiced_transport"
    | "cannot_invoice_unverified_transport"
    | "cannot_invoice_transport_without_price"
    | "cannot_invoice_transport_with_negative_price"
    | "cannot_invoice_transport_without_mandatory_invoice_item"
    | "cannot_invoice_transport_without_customer_to_invoice"
    | "cannot_invoice_transport_with_non_invoiceable_customer_to_invoice"
    | "cannot_invoice_transport_with_line_unit_price_with_more_than_two_decimal_places";

export function getInvoiceErrorMessageFromServerError(invoiceErrorCode: InvoiceError) {
    const INVOICE_ERROR_CODES: {[invoiceErrorCode in InvoiceError]: string} = {
        already_invoiced_transport: t("invoiceErrors.AlreadyInvoicedTransport"),
        cannot_invoice_unverified_transport: t("invoiceErrors.CannotInvoiceUnverifiedTransport"),
        cannot_invoice_transport_without_price: t(
            "invoiceErrors.CannotInvoiceTransportWithoutPrice"
        ),
        cannot_invoice_transport_with_negative_price: t(
            "invoiceErrors.CannotInvoiceTransportWithNegativePrice"
        ),
        cannot_invoice_transport_without_mandatory_invoice_item: t(
            "invoiceErrors.CannotInvoiceTransportWithoutMandatoryInvoiceItem"
        ),
        cannot_invoice_transport_without_customer_to_invoice: t(
            "invoiceErrors.CannotInvoiceTransportWithoutCustomerToInvoice"
        ),
        cannot_invoice_transport_with_non_invoiceable_customer_to_invoice: t(
            "invoiceErrors.CannotInvoiceTransportWithInvalidCustomerToInvoice"
        ),
        cannot_invoice_transport_with_line_unit_price_with_more_than_two_decimal_places: t(
            "invoiceErrors.CannotInvoiceTransportWithLineUnitPriceWithMoreThanTwoDecimalPlaces"
        ),
    };
    if (invoiceErrorCode in INVOICE_ERROR_CODES) {
        return INVOICE_ERROR_CODES[invoiceErrorCode];
    }
    return null;
}
