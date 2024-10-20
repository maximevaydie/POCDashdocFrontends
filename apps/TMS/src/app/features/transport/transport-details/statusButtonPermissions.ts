import {TransportGlobalStatus, TransportInvoicingStatus} from "dashdoc-utils";

export type StatusButtonName =
    | "mark-done-button"
    | "mark-verified-button"
    | "invoice-transport-button"
    | "mark-transport-invoiced-button"
    | "mark-not-verified-button"
    | "mark-not-billed-button"
    | "mark-paid-button"
    | "mark-not-paid-button";

/**
 * This function tells which status button should be displayed on a transport detail page
 * based on the transport status and the company status.
 */
export const getTransportStatusButton = ({
    isCarrier,
    isCreator,
    transportGlobalStatus,
    transportInvoicingStatus,
    hasInvoiceEntityEnabled,
}: {
    isCarrier: boolean;
    isCreator: boolean;
    transportGlobalStatus: TransportGlobalStatus;
    transportInvoicingStatus: TransportInvoicingStatus;
    hasInvoiceEntityEnabled: boolean;
}): StatusButtonName[] => {
    /** The shipper not carrier should be able to mark a transport invoiced for any status,
     * excepted when already invoiced or paid */

    /** Without any invoice entity the carrier, similar to the shipper, can simply marked a transport invoiced.
     * Otherwise, the carrier should be able to create an invoice for the transport, or add it to an existing one.
     */
    const carrierInvoiceButton = hasInvoiceEntityEnabled
        ? "invoice-transport-button"
        : "mark-transport-invoiced-button";

    // None of the buttons should be displayed if the user is not the carrier or the creator
    if (!isCarrier && !isCreator) {
        return [];
    }

    let buttons: StatusButtonName[] = [];

    // We'll switch on the transport global and invoicing status to determine which buttons to show

    // UNFINISHED STATUS
    if (transportGlobalStatus !== "done" && transportGlobalStatus !== "cancelled") {
        if (isCreator || isCarrier) {
            buttons.push("mark-done-button");
        }
        return buttons;
    }

    // UNVERIFIED STATUS
    if (transportInvoicingStatus === "UNVERIFIED") {
        if (isCarrier) {
            buttons.push("mark-verified-button");
        }
        return buttons;
    }

    // VERIFIED STATUS
    if (transportInvoicingStatus === "VERIFIED") {
        if (isCarrier) {
            buttons.push("mark-not-verified-button");
            buttons.push(carrierInvoiceButton);
        }
        return buttons;
    }

    // INVOICED STATUS
    if (transportInvoicingStatus === "INVOICED") {
        if (isCarrier && !hasInvoiceEntityEnabled) {
            buttons.push("mark-not-billed-button");
            buttons.push("mark-paid-button");
        }
        return buttons;
    }

    // PAID STATUS
    if (transportInvoicingStatus === "PAID") {
        if (isCarrier && !hasInvoiceEntityEnabled) {
            buttons.push("mark-not-paid-button");
        }
        return buttons;
    }

    // Should not happen
    return buttons;
};
