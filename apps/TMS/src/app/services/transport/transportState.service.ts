import {transportViewerService} from "./transportViewer.service";

import type {Transport} from "app/types/transport";

function hasStarted(transport: Pick<Transport | Transport, "global_status">) {
    return !["ordered", "accepted"].includes(transport.global_status);
}
/**
 * test if the transport is finished.
 * A finished transport is a done or cancelled or declined transport.
 */
function isFinished(transport: Pick<Transport | Transport, "global_status">) {
    return ["done", "cancelled", "declined"].includes(transport.global_status);
}

/**
 * test if the transport is aborted.
 * An aborted transport is a cancelled or declined transport.
 */
function isAborted(transport: Pick<Transport | Transport, "global_status">) {
    return ["cancelled", "declined"].includes(transport.global_status);
}

function isMultipleRounds(transport: Pick<Transport | Transport, "deliveries">) {
    return transport.deliveries[0]?.multiple_rounds;
}

/**
 * Test if the company (behind companyPk) archived the given transport.
 */
function isArchived(
    transport: Pick<Transport | Transport, "archived_by">,
    companyPk: number | undefined
) {
    return companyPk !== undefined && transport.archived_by.includes(companyPk);
}

/**
 * Test if the transport has to be accepted or declined by the logged in company.
 */
function hasPendingOrder(transport: Pick<Transport | Transport, "requires_acceptance">) {
    return transport.requires_acceptance;
}

/**
 * Test if the transport was declined by the company (behind companyPk).
 */
function hasDeclinedOrder(
    transport: Pick<Transport, "carrier" | "global_status">,
    companyPk: number | undefined
) {
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    return isCarrier && transport.global_status === "declined";
}

/**
 * Test if the company (behind companyPk) has yet to accept the order, or has declined it.
 */
function hasPendingOrDeclinedOrder(
    transport: Pick<Transport, "requires_acceptance" | "carrier" | "global_status">,
    companyPk: number | undefined
) {
    const hasPendingOrder = transportStateService.hasPendingOrder(transport);
    const hasDeclinedOrder = transportStateService.hasDeclinedOrder(transport, companyPk);

    return hasPendingOrder || hasDeclinedOrder;
}

function hasAtLeastOneChildTransport(transport: Transport) {
    return transport.segments.some(({child_transport}) => {
        if (child_transport) {
            return child_transport.status !== "cancelled";
        }
        return false;
    });
}

/**
 * Test if the company (behind companyPk) is shipper and
 * the invoicing status of the shipper is checked for the given transport
 */
function isCheckedByShipper(transport: Transport, companyPk: number | undefined) {
    const isShipper = transportViewerService.isShipperOf(transport, companyPk);
    return transport.shipper_invoicing_status === "CHECKED" && isShipper;
}

export const transportStateService = {
    hasStarted,
    isFinished,
    isAborted,
    isMultipleRounds,
    isCheckedByShipper,
    isArchived,
    hasDeclinedOrder,
    hasPendingOrder,
    hasPendingOrDeclinedOrder,
    hasAtLeastOneChildTransport,
};
