import {fetchDetailAction, fetchListAction, fetchRetrieve} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {formatDate, zoneDateToISO} from "dashdoc-utils";
import isNil from "lodash.isnil";

import {schedulerTripSchema} from "../schemas";

import type {Site} from "app/types/transport";

export function fetchRetrieveTrip(uid: string, extendedView?: boolean) {
    return fetchRetrieve(
        "scheduler/trips",
        "trip",
        schedulerTripSchema,
        uid,
        undefined,
        undefined,
        undefined,
        `?extended_view=${extendedView}`
    );
}

export function fetchReorderActivityIntoTrip({
    tripUid,
    movedActivityUids,
    minIndex,
    maxIndex,
    targetIndex,
    extendedView = false,
}: {
    tripUid: string;
    movedActivityUids: string[];
    minIndex: number;
    maxIndex: number;
    targetIndex: number;
    extendedView?: boolean;
}) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "reorder-activities",
        "POST",
        {extended_view: extendedView},
        tripUid,
        {
            activity_uids: movedActivityUids,
            min_index: minIndex,
            max_index: maxIndex,
            target_index: targetIndex,
        },
        schedulerTripSchema,
        undefined,
        undefined
    );
}
export function updateTripActivitiesOrder(tripUid: string, activitiesUids: string[]) {
    return function (dispatch: Function) {
        dispatch({type: `UPDATE_TRIP_ACTIVITIES_ORDER`, payload: {tripUid, activitiesUids}});
    };
}
export function fetchRemoveActivityFromTrip(
    tripUid: string,
    removedActivityUid: string,
    extendedView = false,
    deleteScheduledDates = true
) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "remove-activity",
        "POST",
        {extended_view: extendedView},
        tripUid,
        {activity_uid: removedActivityUid, delete_scheduled_dates: deleteScheduledDates},
        schedulerTripSchema,
        undefined,
        undefined
    );
}
export function fetchSplitTrip(
    tripUid: string,
    extendedView = false,
    deleteScheduledDates = true
) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "split",
        "POST",
        {extended_view: extendedView},
        tripUid,
        {delete_scheduled_dates: deleteScheduledDates},
        schedulerTripSchema,
        undefined,
        undefined
    );
}

export function fetchSetTripName(name: string, uid: string, extendedView = false) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "set-name",
        "POST",
        {extended_view: extendedView},
        uid,
        {name},
        schedulerTripSchema,
        t("trip.successfullyEdited"),
        undefined
    );
}

export const UPDATE_PARTIAL_TRIP = "UPDATE_PARTIAL_TRIP";

export function fetchPartialTripUpdateAction(siteUids: string[], payload: Partial<Site>) {
    return {
        type: UPDATE_PARTIAL_TRIP,
        payload: {
            siteUids,
            ...payload,
        },
    };
}

export function fetchAssignTrip(
    tripUid: string,
    truckerId: number | null,
    vehicleLicensePlace: string | null,
    trailerLicensePlate: string | null,
    sendToTrucker: boolean,
    extendedView?: boolean,
    scheduledStart?: Date | null,
    scheduledOrder?: number | null,
    hasSchedulerByTimeEnabled?: boolean,
    timezone?: string,
    deleteScheduledDates?: boolean
) {
    const hasMeans = !!truckerId || !!vehicleLicensePlace || !!trailerLicensePlate;
    let scheduledStartStr: string | null = null;
    if (!isNil(scheduledStart) && hasMeans) {
        scheduledStartStr =
            hasSchedulerByTimeEnabled && timezone
                ? zoneDateToISO(scheduledStart, timezone)
                : formatDate(scheduledStart, "yyyy-MM-dd");
    }
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "assign-to-means",
        "POST",
        {extended_view: extendedView},
        tripUid,
        {
            trucker: truckerId ? {pk: truckerId} : null,
            vehicle: vehicleLicensePlace ? {license_plate: vehicleLicensePlace} : null,
            trailer: trailerLicensePlate ? {license_plate: trailerLicensePlate} : null,
            send_to_trucker: sendToTrucker,
            scheduled_start: scheduledStartStr,
            scheduled_order: hasSchedulerByTimeEnabled ? 0 : scheduledOrder,
            simulate_time: hasSchedulerByTimeEnabled,
            delete_scheduled_dates: deleteScheduledDates,
        },
        schedulerTripSchema,
        t("common.updateSaved"),
        t("trip.error.couldNotAssign")
    );
}

export function fetchUnassignTrip(tripUid: string, extendedView?: boolean) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "unassign",
        "POST",
        {extended_view: extendedView},
        tripUid,
        null,
        schedulerTripSchema,
        t("trip.successfullyUnplan"),
        t("trip.error.couldNotUnplan")
    );
}

export function fetchBulkSendTripTruckerNotification(uids: Array<string>, extendedView?: boolean) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-send-to-trucker",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {},
        undefined,
        undefined,
        "v4",
        schedulerTripSchema
    );
}

export function fetchBulkUpdateActivitites(
    tripUid: string,
    uids: Array<string>,
    data: any,
    extendedView: boolean
) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "update-activities-scheduled-range",
        "POST",
        {extended_view: extendedView, activities: uids.join(",")},
        tripUid,
        data,
        schedulerTripSchema,
        t("trip.successfullyEdited"),
        t("common.error")
    );
}
