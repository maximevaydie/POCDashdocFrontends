// addPusherEventLegacy (tms) is deprecated. Use addPusherEvent (common) instead
export function addPusherEventLegacy(payload: {
    entities:
        | "transports"
        | "schedulerTrips"
        | "truckers"
        | "bulkDeleteTransports"
        | "bulkConfirmTransports"
        | "bulkDeclineTransports"
        | "inviteCodes"
        | "exports"
        | "quotationUpdated"
        | "pricingUpdated"
        | "shipperFinalPriceUpdated"
        | "invoiceOrFreeTransports"
        | "reloadInvoices"
        | "reloadCreditNotes";
    data: unknown;
    timestamp: number;
}) {
    return {
        type: `ADD_PUSHER_EVENT`,
        payload,
    };
}
