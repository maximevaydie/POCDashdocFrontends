import {managerService} from "@dashdoc/web-common";
import {Company, Manager} from "dashdoc-utils";

import {
    getTransportStatusButton,
    StatusButtonName,
} from "app/features/transport/transport-details/statusButtonPermissions";
import {
    transportViewerService,
    transportStateService,
    isTransportOrder,
} from "app/services/transport";

import type {Transport} from "app/types/transport";

export type ActionButtonType =
    | "confirmOrder"
    | "declineOrder"
    | "cancelOrder"
    | "duplicateOrder"
    | "checkOrder"
    | "uncheckOrder"
    | "delete"
    | "restore"
    | "archive"
    | "unarchive"
    | "createTemplate";

export type HeaderButton = {
    moreActions: ActionButtonType[];
    defaults: (ActionButtonType | StatusButtonName)[];
};

function getHeaderButtons({
    transport,
    company,
    connectedManager,
    publicToken,
    hasInvoiceEntityEnabled,
}: {
    transport: Transport;
    company: Company | null;
    connectedManager: Manager | null;
    publicToken: string | null;
    hasInvoiceEntityEnabled: boolean;
}) {
    let buttons: HeaderButton = {
        moreActions: [],
        defaults: [],
    };

    const isReadOnly = transportViewerService.isReadOnly(transport);
    const isArchived = transportStateService.isArchived(transport, company?.pk);
    const isCarrier = transportViewerService.isCarrierOf(transport, company?.pk);
    const isShipper = transportViewerService.isShipperOf(transport, company?.pk);
    const isCreator = transportViewerService.isCreatorOf(transport, company?.pk);
    const isPrivateViewer = transportViewerService.isPrivateViewerOf(transport, company?.pk);

    const isPendingOrder = transportStateService.hasPendingOrder(transport);
    const isDeclinedOrder = transportStateService.hasDeclinedOrder(transport, company?.pk);
    const isOrder = isTransportOrder(transport, company?.pk);

    if (publicToken && transport?.global_status === "ordered") {
        buttons.defaults = ["declineOrder", "confirmOrder"];
        return buttons;
    }

    // Read only / public viewer
    if (!isPrivateViewer) {
        return buttons;
    }

    // Deleted transport
    if (
        transport.deleted &&
        !isReadOnly &&
        isPrivateViewer &&
        managerService.hasAtLeastAdminRole(connectedManager) &&
        (isCreator || !isOrder)
    ) {
        buttons.defaults = ["restore"];
        return buttons;
    }

    // Pending acceptation
    if (isPendingOrder && !isReadOnly) {
        buttons.defaults = ["declineOrder", "confirmOrder"];
        return buttons;
    }

    // Declined transport
    if (isDeclinedOrder && !isReadOnly) {
        return buttons;
    }

    // transport buttons
    const archiveButton = isArchived ? "unarchive" : "archive";

    buttons.moreActions.push(archiveButton);
    buttons.defaults.push("duplicateOrder");

    if (isCarrier) {
        buttons.moreActions.push("createTemplate");
    }

    /**
     * CANCEL BUTTON
     *
     * Source: https://www.notion.so/dashdoc/FAQ-Permissions-and-Access-rights-6ee18b9de0de48c4b526b4673511f3af?pvs=4
     *
     */
    const canCancelTransport = !isReadOnly && transport.is_cancellable;

    if (canCancelTransport) {
        buttons.moreActions.push("cancelOrder");
    }

    /**
     * DELETE BUTTON
     *
     * Source: https://www.notion.so/dashdoc/FAQ-Permissions-and-Access-rights-6ee18b9de0de48c4b526b4673511f3af?pvs=4
     *
     */
    const canDeleteTransport = !isReadOnly && transport.is_deletable;

    if (canDeleteTransport) {
        buttons.moreActions.push("delete");
    }

    // Checked or Unchecked button for shipper
    if (isShipper) {
        if (transport.shipper_invoicing_status === "UNCHECKED") {
            buttons.defaults.push("checkOrder");
        } else {
            buttons.moreActions.push("uncheckOrder");
        }
    }

    // add "set status" buttons (e.g. "Mark as done")
    if (!isReadOnly) {
        buttons.defaults.push(
            ..._getSetStatusButtons(transport, company, hasInvoiceEntityEnabled)
        );
    }

    return buttons;
}

function _getSetStatusButtons(
    transport: Transport,
    company: Company | null,
    hasInvoiceEntityEnabled: boolean
): StatusButtonName[] {
    const isCarrier = transportViewerService.isCarrierOf(transport, company?.pk);
    const isCreator = transportViewerService.isCreatorOf(transport, company?.pk);

    return getTransportStatusButton({
        isCarrier,
        isCreator,
        transportGlobalStatus: transport.global_status,
        transportInvoicingStatus: transport.invoicing_status,
        hasInvoiceEntityEnabled: hasInvoiceEntityEnabled,
    });
}

export const transportActionButtonsService = {
    getHeaderButtons,
};
