import {apiService} from "@dashdoc/web-common";
import {
    fetchDetailAction,
    fetchListAction,
    fetchSearch,
    fetchSearchByUids,
    resetSearchAction,
    searchErrorAction,
    searchPartialAction,
    searchPartialSuccessAction,
    successAction,
} from "@dashdoc/web-common";
import {Logger, queryService} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, zoneDateToISO} from "dashdoc-utils";
import chunk from "lodash.chunk";
import flatten from "lodash.flatten";
import {normalize, schema} from "normalizr";

import {schedulerPlanPreviewService} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/schedulerPlanPreview.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {TripType} from "app/features/trip/pool-of-unplanned-trips/types";
import {Trip, CompactTrip} from "app/features/trip/trip.types";
import {
    SCHEDULER_PLANNED_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME,
} from "app/types/constants";

import {schedulerTripSchema} from "../schemas";

function getQueryName(poolType: TripType) {
    return poolType === "prepared"
        ? SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME
        : SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME;
}

export function fetchSearchUnplannedTrips(
    query: any,
    poolType: TripType,
    fromPage: number,
    toPage?: number
) {
    return fetchSearch(
        `scheduler/unplanned-${poolType}-trips`,
        "scheduler-trip",
        schedulerTripSchema,
        getQueryName(poolType),
        query,
        toPage ? {fromPage: fromPage, toPage: toPage} : fromPage,
        "v4",
        (error) => {
            Logger.error(error);
            toast.error(
                t(
                    poolType === "basic"
                        ? "poolOfUnplanned.basicTrips.failedToRetrieve"
                        : "poolOfUnplanned.preparedTrips.failedToRetrieve"
                )
            );
        }
    );
}

export function resetSearchPlannedTrips(query: any) {
    return function (dispatch: Function) {
        dispatch(resetSearchAction(SCHEDULER_PLANNED_TRIPS_QUERY_NAME, query));
    };
}

export function fetchSearchPlannedTrips(
    query: any,
    row_ids: number[],
    view?: TripSchedulerView,
    withoutCurrentQueryUpdate?: boolean
) {
    return function (dispatch: Function) {
        if (!withoutCurrentQueryUpdate) {
            dispatch(searchPartialAction(SCHEDULER_PLANNED_TRIPS_QUERY_NAME, query));
        }
        // recent browsers allow very long url length but in IE11, url length is
        //  limited to 2083 bytes. We may have to launch several requests.
        Promise.all(
            chunk(row_ids, 50).map((uids_chunk) => {
                const partialQuery = {[view + "_id__in"]: uids_chunk};
                return apiService.get(
                    `scheduler/trips/?${queryService.toQueryString({...query, ...partialQuery})}`,
                    {
                        apiVersion: "v4",
                    }
                );
            })
        )
            .then((results: Array<Array<Trip>>) => {
                const items = flatten(results);
                const response = normalize(items, new schema.Array(schedulerTripSchema));
                dispatch(
                    searchPartialSuccessAction(SCHEDULER_PLANNED_TRIPS_QUERY_NAME, query, response)
                );
            })
            .catch((error) => {
                dispatch(searchErrorAction(SCHEDULER_PLANNED_TRIPS_QUERY_NAME, query, error));
            });
    };
}
export function fetchSearchPlannedTripsByUids(query: any, uids: string[]) {
    return fetchSearchByUids(
        "scheduler/trips",
        "scheduler-trip",
        schedulerTripSchema,
        SCHEDULER_PLANNED_TRIPS_QUERY_NAME,
        query,
        uids,
        "v4"
    );
}

export function removeUnplannedTrip(query: any, poolType: TripType, itemIdToRemove: string) {
    return {
        type: `REMOVE_SEARCH_ITEM`,
        queryName: getQueryName(poolType),
        query,
        itemIdToRemove,
    };
}
export function removePlannedTrip(query: any, itemIdToRemove: string) {
    return {
        type: `REMOVE_SEARCH_ITEM`,
        queryName: SCHEDULER_PLANNED_TRIPS_QUERY_NAME,
        query,
        itemIdToRemove,
    };
}
export function addToPlannedTrip(query: any, tripUidToAdd: string) {
    return {
        type: `ADD_SEARCH_ITEM`,
        queryName: SCHEDULER_PLANNED_TRIPS_QUERY_NAME,
        query,
        itemIdToAdd: tripUidToAdd,
    };
}
export function addToUnplannedTrip(query: any, tripToAdd: CompactTrip) {
    return {
        type: `ADD_SEARCH_ITEM`,
        queryName: getQueryName(tripToAdd.is_prepared ? "prepared" : "basic"),
        query,
        itemIdToAdd: tripToAdd.uid,
    };
}

export function updateTripMeansAndDate(
    trip: CompactTrip,
    newMeans:
        | {trucker: {pk: number} | null}
        | {vehicle: {pk: number} | null}
        | {trailer: {pk: number} | null},
    newDay: string | null,
    newIndex: number,
    isPlanningByTime: boolean,
    timezone: string
) {
    let schedulerData = {};
    if (!isPlanningByTime) {
        schedulerData = {
            scheduler_datetime_range: {start: newDay, end: newDay},
            scheduled_order: newIndex - 0.5,
        };
    } else if (newDay) {
        schedulerData = {
            scheduler_datetime_range: schedulerPlanPreviewService.computeTripScheduledRange(
                trip,
                timezone,
                parseAndZoneDate(newDay, timezone) as Date
            ),
        };
    }
    return successAction("UPDATE", {
        result: trip.uid,
        entities: {
            schedulerTrips: {
                [trip.uid]: {
                    uid: trip.uid,
                    ...newMeans,
                    ...schedulerData,
                    _localMoveTo: newDay + JSON.stringify(newMeans),
                },
            },
        },
    });
}

export function fetchBulkAssignTripToTrucker(
    uids: string[],
    truckerId?: number,
    newDay?: Date | string,
    newIndex?: number,
    onlyReorder?: boolean,
    extendedView?: boolean
) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-assign-to-trucker",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {
            trucker: truckerId ? {pk: truckerId} : null,
            scheduled_start: formatDate(newDay, "yyyy-MM-dd"),
            scheduled_order: newIndex,
            only_reorder: onlyReorder,
        },
        t("common.updateSaved"),
        undefined,
        "v4",
        new schema.Array(schedulerTripSchema),
        true,
        {moveTo: newDay + JSON.stringify({trucker: {pk: truckerId}})}
    );
}
export function fetchBulkAssignTripToTruckerAndTime(
    uids: string[],
    truckerId?: number,
    newDay?: Date | string,
    extendedView?: boolean
) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-assign-to-trucker-and-time",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {
            trucker: truckerId ? {pk: truckerId} : null,
            scheduled_start: newDay ? new Date(newDay).toISOString() : undefined,
        },
        t("common.updateSaved"),
        undefined,
        "web",
        new schema.Array(schedulerTripSchema),
        true,
        {moveTo: newDay + JSON.stringify({trucker: {pk: truckerId}})}
    );
}

export function fetchBulkAssignTripToVehicle(
    uids: string[],
    vehicleId?: number,
    newDay?: Date | string,
    newIndex?: number,
    onlyReorder?: boolean,
    extendedView?: boolean
) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-assign-to-vehicle",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {
            vehicle: vehicleId ? {pk: vehicleId} : null,
            scheduled_start: formatDate(newDay, "yyyy-MM-dd"),
            scheduled_order: newIndex,
            only_reorder: onlyReorder,
        },
        t("common.updateSaved"),
        undefined,
        "v4",
        new schema.Array(schedulerTripSchema),
        true,
        {moveTo: newDay + JSON.stringify({vehicle: {pk: vehicleId}})}
    );
}
export function fetchBulkAssignTripToVehicleAndTime(
    uids: string[],
    vehicleId?: number,
    newDay?: Date | string,
    extendedView?: boolean
) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-assign-to-vehicle-and-time",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {
            vehicle: vehicleId ? {pk: vehicleId} : null,
            scheduled_start: newDay ? new Date(newDay).toISOString() : undefined,
        },
        t("common.updateSaved"),
        undefined,
        "web",
        new schema.Array(schedulerTripSchema),
        true,
        {moveTo: newDay + JSON.stringify({vehicle: {pk: vehicleId}})}
    );
}

export function fetchBulkAssignTripToTrailer(
    uids: string[],
    trailerId?: number,
    newDay?: Date | string,
    newIndex?: number,
    onlyReorder?: boolean,
    extendedView?: boolean
) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-assign-to-trailer",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {
            trailer: trailerId ? {pk: trailerId} : null,
            scheduled_start: formatDate(newDay, "yyyy-MM-dd"),
            scheduled_order: newIndex,
            only_reorder: onlyReorder,
        },
        t("common.updateSaved"),
        undefined,
        "v4",
        new schema.Array(schedulerTripSchema),
        true,
        {moveTo: newDay + JSON.stringify({trailer: {pk: trailerId}})}
    );
}
export function fetchBulkAssignTripToTrailerAndTime(
    uids: string[],
    trailerId?: number,
    newDay?: Date | string,
    extendedView?: boolean
) {
    return fetchListAction(
        "scheduler/trips",
        "scheduler-trip",
        "bulk-assign-to-trailer-and-time",
        "POST",
        {uid__in: uids, extended_view: extendedView},
        {
            trailer: trailerId ? {pk: trailerId} : null,
            scheduled_start: newDay ? new Date(newDay).toISOString() : undefined,
        },
        t("common.updateSaved"),
        undefined,
        "web",
        new schema.Array(schedulerTripSchema),
        true,
        {moveTo: newDay + JSON.stringify({trailer: {pk: trailerId}})}
    );
}

export type Coordinates = {latitude: number; longitude: number};

export type MergeTripParameters = {
    fill_scheduled_dates?: boolean;
    optimize_distance?: boolean;
    vehicle_capacity_in_lm?: number;
    start_coordinates?: Coordinates;
    end_coordinates?: Coordinates;
    start_datetime?: string;
    activity_duration?: number;
};

type MergeTripPayload = {
    trip_uids: string[];
} & MergeTripParameters;

export function fetchMergeTripsIntoTrip(
    tripUid: string,
    extendedView: boolean = false,
    payload: MergeTripPayload
) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "merge",
        "POST",
        {extended_view: extendedView},
        tripUid,
        payload,
        schedulerTripSchema,
        t("common.updateSaved"),
        undefined,
        "v4"
    );
}

export function updateTripEndDate(
    tripUid: string,
    endDate: Date,
    timezone: string,
    extendedView = false
) {
    return fetchDetailAction(
        "scheduler/trips",
        "scheduler-trip",
        "update-trip-duration",
        "PATCH",
        {extended_view: extendedView},
        tripUid,
        {end_date: zoneDateToISO(endDate, timezone)},
        schedulerTripSchema,
        t("common.updateSaved"),
        undefined,
        "web"
    );
}
