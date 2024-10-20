import {createCachedSelector, createSelector} from "@dashdoc/web-common";

import {RootState} from "../reducers";
import {PusherEvent} from "../reducers/realtime";

const getLastTransportEventSelector = ({
    realtimeLegacy: {
        lastEvents: {transports: event},
    },
}: RootState) => event;

export const getLastTransportEvent = createSelector(
    getLastTransportEventSelector,
    (event) => event
);

export const getLastTransportEventByUid = createCachedSelector(
    getLastTransportEventSelector,
    (_: RootState, uid: string) => uid,
    (event: PusherEvent, uid: string) => (event?.data?.uid === uid ? event : null)
)((_, uid) => uid);

const getLastTripEventSelector = ({
    realtimeLegacy: {
        lastEvents: {schedulerTrips: event},
    },
}: RootState) => event;

export const getLastTripEvent = createSelector(getLastTripEventSelector, (event) => event);

const getLastInviteCodeEventSelector = ({
    realtimeLegacy: {
        lastEvents: {inviteCodes: event},
    },
}: RootState) => event;

export const getLastInviteCodeEvent = createSelector(
    getLastInviteCodeEventSelector,
    (event) => event
);

const getLastBulkConfirmTransportsEventSelector = ({
    realtimeLegacy: {
        lastEvents: {bulkConfirmTransports: event},
    },
}: RootState) => event;

export const getLastBulkConfirmTransportsEvent = createSelector(
    getLastBulkConfirmTransportsEventSelector,
    (event) => event
);

const getLastBulkDeclineTransportsEventSelector = ({
    realtimeLegacy: {
        lastEvents: {bulkDeclineTransports: event},
    },
}: RootState) => event;

export const getLastBulkDeclineTransportsEvent = createSelector(
    getLastBulkDeclineTransportsEventSelector,
    (event) => event
);

const getLastBulkDeleteTransportsEventSelector = ({
    realtimeLegacy: {
        lastEvents: {bulkDeleteTransports: event},
    },
}: RootState) => event;

export const getLastBulkDeleteTransportsEvent = createSelector(
    getLastBulkDeleteTransportsEventSelector,
    (event) => event
);

const getLastTruckerEventSelector = ({
    realtimeLegacy: {
        lastEvents: {truckers: event},
    },
}: RootState) => event;

export const getLastTruckerEvent = createSelector(getLastTruckerEventSelector, (event) => event);

export const getLastTruckerEventByPk = createCachedSelector(
    getLastTruckerEventSelector,
    (_: RootState, pk: number) => pk,
    (event: PusherEvent, pk: number) => (event?.data?.pk === pk ? event : null)
)((_, pk) => pk);

const getLastExportEventSelector = ({
    realtimeLegacy: {
        lastEvents: {exports: event},
    },
}: RootState) => event;

export const getLastExportEvent = createSelector(getLastExportEventSelector, (event) => event);

const getLastQuotationUpdatedEventSelector = ({
    realtimeLegacy: {
        lastEvents: {quotationUpdated: event},
    },
}: RootState) => event;

export const getLastQuotationUpdatedEvent = createSelector(
    getLastQuotationUpdatedEventSelector,
    (event) => event
);

const getLastPricingUpdatedSelector = ({
    realtimeLegacy: {
        lastEvents: {pricingUpdated: event},
    },
}: RootState) => event;

export const getLastPricingUpdatedEvent = createSelector(
    getLastPricingUpdatedSelector,
    (event) => event
);

const getLastShipperFinalPriceUpdatedSelector = ({
    realtimeLegacy: {
        lastEvents: {shipperFinalPriceUpdated: event},
    },
}: RootState) => event;
export const getLastShipperFinalPriceUpdatedEvent = createSelector(
    getLastShipperFinalPriceUpdatedSelector,
    (event) => event
);
const getLastAddOrDeleteInvoiceSelector = ({
    realtimeLegacy: {
        lastEvents: {reloadInvoices: event},
    },
}: RootState) => event;

const getLastReloadCreditNotesSelector = ({
    realtimeLegacy: {
        lastEvents: {reloadCreditNotes: event},
    },
}: RootState) => event;

export const getLastAddOrDeleteInvoiceEvent = createSelector(
    getLastAddOrDeleteInvoiceSelector,
    (event) => event
);

export const getLastReloadCreditNoteEvent = createSelector(
    getLastReloadCreditNotesSelector,
    (event) => event
);

const getLastInvoiceOrFreeTransportsSelector = ({
    realtimeLegacy: {
        lastEvents: {invoiceOrFreeTransports: event},
    },
}: RootState) => event;
export const getLastInvoiceOrFreeTransportsEvent = createSelector(
    getLastInvoiceOrFreeTransportsSelector,
    (event) => event
);
