import {isTransportAmended, isTransportVerified} from "dashdoc-utils";

import {activityService} from "app/services/transport/activity.service";

import {transportStateService} from "./transportState.service";
import {transportViewerService} from "./transportViewer.service";

import type {Activity, Transport} from "app/types/transport";

function canMarkActivityAsDone(
    transport: Transport,
    activity: Activity,
    companyPk: number | undefined
) {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }
    if (activity.isCancelled) {
        return false;
    }

    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);

    const hasPendingOrDeclinedOrder = transportStateService.hasPendingOrDeclinedOrder(
        transport,
        companyPk
    );
    if (
        (!isCarrier && !isCreator) ||
        ["verified", "invoiced", "declined"].includes(transport.status) ||
        hasPendingOrDeclinedOrder
    ) {
        return false;
    }

    const activityComplete = activityService.isActivityComplete(activity);

    if (activity.isMultipleRounds) {
        return !activityComplete;
    }

    if (activity.siteType === "bulkingBreak") {
        return !activityComplete && activity.canBeDone;
    }

    return activity.canBeDone;
}

function canCancelOnSiteStatus(
    transport: Transport,
    activityCancelled: boolean,
    activityComplete: boolean,
    activityOnSite: boolean,
    companyPk: number | undefined
) {
    if (activityCancelled || activityComplete || !activityOnSite) {
        return false;
    }

    const isReadOnly = transportViewerService.isReadOnly(transport);

    if (isReadOnly) {
        return false;
    }
    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);

    if (!isCreator && !isCarrier) {
        return false;
    }

    if (isTransportVerified(transport)) {
        return false;
    }

    if (isTransportAmended(transport)) {
        return false;
    }

    return true;
}

function canMarkActivityAsUndone(
    transport: Transport,
    activity: Activity,
    companyPk: number | undefined
): boolean {
    const isReadOnly = transportViewerService.isReadOnly(transport);
    if (isReadOnly) {
        return false;
    }
    if (activity.isCancelled) {
        return false;
    }

    const isCreator = transportViewerService.isCreatorOf(transport, companyPk);
    const isCarrier = transportViewerService.isCarrierOf(transport, companyPk);

    if (!isCreator && !isCarrier) {
        return false;
    }

    return activity.canBeUndone;
}

function canMarkBreakActivityAsUndone(
    nextActivities: Activity[],
    breakIsDone?: boolean,
    resumeIsDone?: boolean
) {
    if (!breakIsDone && !resumeIsDone) {
        return false;
    }

    for (const nextActivity of nextActivities) {
        if (nextActivity.status !== "not_started") {
            return false;
        }
    }

    return true;
}

export const activityRightService = {
    canMarkActivityAsDone,
    canMarkActivityAsUndone,
    canMarkBreakActivityAsUndone,
    canCancelOnSiteStatus,
};
