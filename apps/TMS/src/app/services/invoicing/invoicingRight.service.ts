import {isTransportInvoiced} from "dashdoc-utils";

import {carrierApprovalService} from "app/features/transportation-plan/services/carrierApproval.service";

import {transportStateService} from "../transport/transportState.service";
import {transportViewerService} from "../transport/transportViewer.service";

import type {Transport} from "app/types/transport";

function canEditInvoicedPrice(
    transport: Transport,
    companyPk: number | undefined,
    hasCarrierAndShipperPriceEnabled: boolean,
    companiesFromConnectedGroupView: number[]
) {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }
    const isInCarrierGroup = transportViewerService.isCarrierGroupOf(
        transport,
        companiesFromConnectedGroupView
    );
    const hasPendingOrDeclinedOrder = transportStateService.hasPendingOrDeclinedOrder(
        transport,
        companyPk
    );

    const baseConditions =
        isInCarrierGroup &&
        !hasPendingOrDeclinedOrder &&
        !["INVOICED", "PAID"].includes(transport.invoicing_status);

    if (hasCarrierAndShipperPriceEnabled) {
        return baseConditions;
    } else {
        return baseConditions && transportStateService.hasStarted(transport);
    }
}

/**
 * This function tells if, an invoice number can be set (i.e added, removed or updated) to a transport.
 * Must be in synced with the backend `_check_can_edit_transport_invoice_number` as much as possible.
 */
function canSetInvoiceNumber(
    transport: Transport,
    companyPk: number | undefined,
    pksOfSameGroupCompanies: number[],
    hasDashdocInvoicingEnabled: boolean,
    hasInvoicingEntityEnabled: boolean
) {
    const isShipper = transportViewerService.isShipperOf(transport, companyPk);
    const isInCarrierGroup = transportViewerService.isCarrierGroupOf(
        transport,
        pksOfSameGroupCompanies
    );
    if (!isShipper && !isInCarrierGroup) {
        return false;
    }
    // We don't statically check if the transport's carrier has an active invoicing method
    // (we have a backend check in the corresponding modal)
    // Still if the company is the carrier we prevent it to set an invoice number if it has
    // the Dashdoc Invoicing or the `invoicingEntity`FF enabled.
    if (isInCarrierGroup && (hasDashdocInvoicingEnabled || hasInvoicingEntityEnabled)) {
        return false;
    }
    // The carrier cannot set an invoice number if the transport is not finished
    if (isInCarrierGroup && !["done", "cancelled"].includes(transport.global_status)) {
        return false;
    }
    return true;
}

function canMarkInvoiceATransport(
    transport: Transport,
    companyPk: number | undefined,
    hasInvoiceEntityEnabled: boolean
) {
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    return isCarrier && !hasInvoiceEntityEnabled && !isTransportInvoiced(transport);
}

function canReadInvoicedPrice(
    transport: Transport,
    companyPk: number | undefined,
    hasCarrierAndShipperPriceEnabled: boolean,
    companiesFromConnectedGroupView: number[]
) {
    const carrierApprovalStatus = carrierApprovalService.getStatus(transport);
    if (!canReadPrices(transport, companiesFromConnectedGroupView)) {
        return false;
    }
    if (!hasCarrierAndShipperPriceEnabled) {
        return true;
    }
    if (transport.carrier === null) {
        return false;
    }
    if (transportStateService.hasPendingOrDeclinedOrder(transport, companyPk)) {
        return false;
    }
    if (
        carrierApprovalStatus === "declined" ||
        carrierApprovalStatus === "ordered" ||
        carrierApprovalStatus === "requested"
    ) {
        return false;
    }
    return true;
}

function canEditAgreedPrice(
    transport: Transport,
    companyPk: number | undefined,
    hasShipperFinalPriceEnabled: boolean
) {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }

    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isCreatorNotCarrier = isCreator && !isCarrier;
    const isShipper = transportViewerService.isShipperOf(transport, companyPk);
    const isCustomerToInvoice = transportViewerService.isCustomerToInvoiceOf(transport, companyPk);

    // Shipper, customer to invoice and creator not carrier
    // can update the agreed price at any time.
    if (isShipper || isCustomerToInvoice || isCreatorNotCarrier) {
        return true;
    }

    // Carrier cannot update the agreed price once the transport is verified.
    // When `carrierAndShipperPrice` and `shipperFinalPrice` FF are removed,
    // the carrier won't be able to update the agreed price at all.
    if (isCarrier && !hasShipperFinalPriceEnabled) {
        const hasPendingOrDeclinedOrder = transportStateService.hasPendingOrDeclinedOrder(
            transport,
            companyPk
        );

        return (
            !hasPendingOrDeclinedOrder &&
            !["VERIFIED", "INVOICED", "PAID"].includes(transport.invoicing_status)
        );
    }

    return false;
}

function canReadPrices(transport: Transport, companiesFromConnectedGroupView: number[]) {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }
    return (
        transportViewerService.isPrivateViewerGroupOf(
            transport,
            companiesFromConnectedGroupView
        ) ||
        transportViewerService.isCustomerToInvoiceGroupOf(
            transport,
            companiesFromConnectedGroupView
        )
    );
}

function canEditShipperFinalPrice(
    transport: Transport,
    companyPk: number | undefined,
    hasShipperFinalPriceEnabled: boolean
) {
    return canReadShipperFinalPrice(transport, companyPk, hasShipperFinalPriceEnabled);
}

function canReadShipperFinalPrice(
    transport: Transport,
    companyPk: number | undefined,
    hasShipperFinalPriceEnabled: boolean
) {
    if (!hasShipperFinalPriceEnabled) {
        return false;
    }

    const isShipper = transportViewerService.isShipperOf(transport, companyPk);
    const isCustomerToInvoice = transportViewerService.isCustomerToInvoiceOf(transport, companyPk);
    if (isShipper || isCustomerToInvoice) {
        return true;
    }

    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isCreatorNotCarrier = isCreator && !isCarrier;
    return isCreatorNotCarrier;
}

export const invoicingRightService = {
    canMarkInvoiceATransport,
    canSetInvoiceNumber,
    canReadPrices,
    canEditAgreedPrice,

    canEditInvoicedPrice,
    canReadInvoicedPrice,

    canEditShipperFinalPrice,
    canReadShipperFinalPrice,
};
