import {isTransportVerified, isTransportInvoiced} from "dashdoc-utils";

import {isTransportPartOfAPreparedTrip} from "app/features/trip/trip.service";
import {isTransportRental} from "app/services/transport/transport.service";

import {transportStateService} from "./transportState.service";
import {transportViewerService} from "./transportViewer.service";

import type {ActivityMeans, Transport} from "app/types/transport";
import type {TransportWithCarrierPk} from "app/types/transport";

function canEditTransport(
    transport: Pick<
        Transport,
        | "carrier"
        | "carrier_quotation_request"
        | "shipper"
        | "customer_to_invoice"
        | "created_by"
        | "external_transport"
        | "invoicing_status"
        | "requires_acceptance"
        | "global_status"
        | "deleted"
    >,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean,
    companiesInGroupViews: number[] = []
) {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }
    const isPrivate = transportViewerService.isPrivateViewerOf(transport, companyPk);
    const isCarrierGroup = transportViewerService.isCarrierGroupOf(
        transport,
        companiesInGroupViews
    );
    const hasPendingOrDeclinedOrder = transportStateService.hasPendingOrDeclinedOrder(
        transport,
        companyPk
    );

    const isInvoiced = hasInvoiceEntityEnabled && isTransportInvoiced(transport);

    return (
        (isPrivate || isCarrierGroup) &&
        !hasPendingOrDeclinedOrder &&
        !transport.deleted &&
        !isInvoiced
    );
}

function canReadCustomerToInvoice(
    transport: Pick<
        Transport,
        "carrier" | "customer_to_invoice" | "created_by" | "external_transport"
    >,
    companyPk: number | undefined,
    companiesInGroupViewPks: Array<number>
) {
    const isCustomerToInvoice = transportViewerService.isCustomerToInvoiceOf(transport, companyPk);
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrierOfTransport = transportViewerService.isCarrierOf(transport, companyPk);
    const isCarrierGroupOfTransport = companiesInGroupViewPks
        ? transportViewerService.isCarrierGroupOf(transport, companiesInGroupViewPks)
        : true;
    return isCarrierOfTransport || isCarrierGroupOfTransport || isCreator || isCustomerToInvoice;
}

function canEditCustomerToInvoice(
    transport: Pick<
        Transport,
        | "carrier"
        | "carrier_quotation_request"
        | "shipper"
        | "customer_to_invoice"
        | "created_by"
        | "external_transport"
        | "invoicing_status"
        | "requires_acceptance"
        | "global_status"
        | "deleted"
    >,
    companyPk: number | undefined,
    companiesInGroupViewPks: Array<number>,
    hasInvoiceEntityEnabled: boolean
) {
    const isCarrierOfTransport = transportViewerService.isCarrierOf(transport, companyPk);
    const isCarrierGroupOfTransport = companiesInGroupViewPks
        ? transportViewerService.isCarrierGroupOf(transport, companiesInGroupViewPks)
        : true;
    return (
        canEditTransport(transport, companyPk, hasInvoiceEntityEnabled, companiesInGroupViewPks) &&
        (isCarrierOfTransport || isCarrierGroupOfTransport)
    );
}

function canCreateCustomerToInvoice(
    transport: TransportWithCarrierPk,
    companyPk: number | undefined,
    companiesInGroupViewPks: Array<number>
) {
    const isCarrierOfTransport = transportViewerService.isCarrierOf(transport, companyPk);
    const isCarrierGroupOfTransport = companiesInGroupViewPks
        ? transportViewerService.isCarrierGroupOf(transport, companiesInGroupViewPks)
        : true;
    return isCarrierOfTransport || isCarrierGroupOfTransport;
}

/**
 * Tells wether a given company can set the customer to invoice (or the invoicing address)
 * when marking a transport as invoiced.
 *
 * To keep in sync with the backend `can_set_customer_to_invoice_when_marking_invoiced`
 */
function canSetCustomerToInvoiceWhenMarkingInvoiced(
    transport: Transport,
    companyPk: number | undefined,
    companiesInGroupViewPks: Array<number>
) {
    const isCarrierOfTransport = transportViewerService.isCarrierOf(transport, companyPk);
    const isCarrierGroupOfTransport = transportViewerService.isCarrierGroupOf(
        transport,
        companiesInGroupViewPks
    );
    return isCarrierOfTransport || isCarrierGroupOfTransport;
}

/*
@deprecated
*/
function canReadInvoicingAddress(transport: Transport, companyPk: number | undefined) {
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    return isCarrier || isCreator;
}
/*
@deprecated
*/
function canEditInvoicingAddress(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    return (
        canEditTransport(transport, companyPk, hasInvoiceEntityEnabled) &&
        canReadInvoicingAddress(transport, companyPk)
    );
}

function canEditShipperAddress(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    let result = false;
    if (canEditTransport(transport, companyPk, hasInvoiceEntityEnabled)) {
        if (transportViewerService.isCreatorOf(transport, companyPk)) {
            // the creator of the transport can always update the shipper
            result = true;
        } else if (transportViewerService.isCarrierOf(transport, companyPk)) {
            // the carrier of the transport and can update the shipper when the transport is not finished or done.
            result = !transportStateService.isFinished(transport) || transport.status === "done";
        }
    }
    return result;
}

function canEditShipperReference(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    let result = canEditTransport(transport, companyPk, hasInvoiceEntityEnabled);
    if (transport.created_by.settings_constrain_reference_edition) {
        result = result && transportViewerService.isCreatorOf(transport, companyPk);
    }
    return result;
}

function canEditCarrierReference(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    let result = canEditTransport(transport, companyPk, hasInvoiceEntityEnabled);
    if (transport.created_by.settings_constrain_reference_edition) {
        result = result && transportViewerService.isCarrierOf(transport, companyPk);
    }
    return result;
}

function canEditMeans(
    transport: Transport,
    companyPk: number | undefined,
    companiesInGroupViews: number[],
    hasInvoiceEntityEnabled: boolean
) {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }

    if (companyPk === undefined) {
        return false;
    }

    if (canEditTransport(transport, companyPk, hasInvoiceEntityEnabled, companiesInGroupViews)) {
        return (
            transportViewerService.isCarrierOf(transport, companyPk) ||
            transportViewerService.isCarrierGroupOf(transport, companiesInGroupViews)
        );
    }

    return false;
}

function canEditBreaks(
    transport: Transport,
    companyPk: number | undefined,
    companiesInGroupViews: number[],
    hasInvoiceEntityEnabled: boolean
) {
    return (
        canEditMeans(transport, companyPk, companiesInGroupViews, hasInvoiceEntityEnabled) &&
        !transportStateService.isMultipleRounds(transport) &&
        transport.status !== "done"
    );
}
function canAddDelivery(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    if (
        !canEditTransportStructure(transport, companyPk, hasInvoiceEntityEnabled) ||
        transport.status === "done"
    ) {
        return false;
    }
    const activities = transport.deliveries.flatMap((d) => [d.origin.uid, d.destination.uid]);
    const duplicatesInActivities = activities.find(
        (activity, index) => activities.indexOf(activity) !== index
    );
    return !duplicatesInActivities;
}

function canEditTransportStructure(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    return (
        !transportStateService.isMultipleRounds(transport) &&
        !isTransportRental(transport) &&
        canEditTransport(transport, companyPk, hasInvoiceEntityEnabled) &&
        transportViewerService.isCreatorOf(transport, companyPk)
    );
}

function canAmendTransport(
    transport: Transport,
    companyPk: number | undefined,
    means: ActivityMeans
) {
    let result = false;
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }

    if (
        transportViewerService.isCarrierOf(transport, companyPk) ||
        transportViewerService.isCreatorOf(transport, companyPk)
    ) {
        const hasPendingOrDeclinedOrder = transportStateService.hasPendingOrDeclinedOrder(
            transport,
            companyPk
        );
        result =
            !hasPendingOrDeclinedOrder &&
            !isTransportVerified(transport) &&
            transport.status === "done" &&
            !means.child_transport;
    }
    return result;
}

function canEditTransportDistance(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    return (
        canEditTransport(transport, companyPk, hasInvoiceEntityEnabled) &&
        transportViewerService.isCarrierOf(transport, companyPk) &&
        !isTransportPartOfAPreparedTrip(transport)
    );
}

function canEditCarbonFootprint(transport: Transport, companyPk: number | undefined) {
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isReadOnlyTransport = transportViewerService.isReadOnly(transport);
    const isReadOnlyUser = transportViewerService.isReadOnly(transport);
    return isCreator && !isReadOnlyTransport && !isReadOnlyUser;
}

function canEditTransportOperationCategory(
    transport: Transport,
    companyPk: number | undefined,
    companiesInGroupViews: number[]
) {
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isCarrierGroup = transportViewerService.isCarrierGroupOf(
        transport,
        companiesInGroupViews
    );
    const isReadOnlyTransport = transportViewerService.isReadOnly(transport);
    const isReadOnlyUser = transportViewerService.isReadOnly(transport);
    return (isCarrier || isCarrierGroup) && !isReadOnlyTransport && !isReadOnlyUser;
}

export const transportRightService = {
    canEditTransport,
    canReadCustomerToInvoice,
    canSetCustomerToInvoiceWhenMarkingInvoiced,
    canEditCustomerToInvoice,
    canCreateCustomerToInvoice,
    canReadInvoicingAddress,
    canEditInvoicingAddress,
    canEditShipperAddress,
    canEditShipperReference,
    canEditCarrierReference,
    canEditMeans,
    canEditBreaks,
    canEditTransportStructure,
    canAmendTransport,
    canEditTransportDistance,
    canEditCarbonFootprint,
    canEditTransportOperationCategory,
    canAddDelivery,
};
