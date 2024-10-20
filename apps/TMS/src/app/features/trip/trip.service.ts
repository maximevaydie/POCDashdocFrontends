import {t, TranslationKeys} from "@dashdoc/web-core";
import {formatNumber, RequestedVehicle, TransportAddress, SiteSlot, Tag} from "dashdoc-utils";
import {max, min} from "lodash";
import findLastIndex from "lodash.findlastindex";
import uniq from "lodash.uniq";
import uniqBy from "lodash.uniqby";

import {getEntityLatLng} from "app/features/maps/maps.service";
import {ActivityMarkerProps} from "app/features/maps/marker/activity-marker";
import {ActivityMapPosition} from "app/features/maps/marker/activity-marker";
import {getLoadCategoryAndDescription} from "app/features/transport/transport-details/transport-details-activities/activity/activity-loads/utils";
import {getLoadsCategoryAndQuantity} from "app/services/transport/load.service";

import {
    InvalidTripType,
    CompactTrip,
    TripActivity,
    TripActivityCategory,
    SimilarActivity,
    SimilarActivityWithTransportData,
    AdditionalTransportData,
    TripWithTransportData,
    TripTransport,
} from "./trip.types";

import type {Load, Transport} from "app/types/transport";

export function getTripInstructions(trip: CompactTrip): string {
    return uniq(
        trip.activities.flatMap((activity) => activity.transports.map((t) => t.instructions))
    )
        .filter((instructions) => !!instructions)
        .join(" - ");
}
export function getTripRequestedVehicle(trip: CompactTrip): RequestedVehicle[] {
    return uniqBy(
        trip.activities.flatMap(
            (activity) =>
                activity.transports
                    .map(({requested_vehicle}) => requested_vehicle)
                    .filter((requested_vehicle) => !!requested_vehicle) as RequestedVehicle[]
        ),
        ({uid}) => uid
    );
}

export function getTripTags(trip: TripWithTransportData | CompactTrip): Array<Tag> {
    return uniqBy(
        trip.activities
            .flatMap((activity) => activity.transports.flatMap((transport) => transport.tags))
            .filter((tag) => !!tag),
        "name"
    );
}
export function getActivityPlannedLoadSummary(
    activity: SimilarActivity,
    t: (key: TranslationKeys, options?: {smart_count: number}) => string
): string {
    let loads: Load[] = [];
    [...(activity.deliveries_from || []), ...(activity.deliveries_to || [])].forEach(
        (delivery) => {
            loads.push(...delivery.planned_loads);
        }
    );
    return getLoadsSummary(loads, t);
}

export function getActivityLoadsList(activity: SimilarActivity) {
    let loads: Load[] = [];
    [...(activity.deliveries_from || []), ...(activity.deliveries_to || [])].forEach(
        (delivery) => {
            const actual_loads = ["loading", "breaking", "resuming"].includes(
                activity.category as string
            )
                ? delivery.origin_loads
                : delivery.destination_loads;
            if (actual_loads?.length > 0) {
                loads.push(...actual_loads);
            } else {
                loads.push(...delivery.planned_loads);
            }
        }
    );
    return loads;
}

export function getActivityLoadSummary(
    activity: SimilarActivity,
    t: (key: TranslationKeys, options?: {smart_count: number}) => string
): string {
    const loads = getActivityLoadsList(activity);
    return getLoadsSummary(loads, t);
}

export function getLoadsSummary(
    loads: Array<Load>,
    t: (key: TranslationKeys, options?: {smart_count: number}) => string
): string {
    const totalWeight = loads.reduce((acc: number, l: Load) => acc + +(l.weight ?? 0), 0);
    const totalVolume = loads.reduce((acc: number, l: Load) => acc + +(l.volume ?? 0), 0);
    const totalLinearMeters = loads.reduce(
        (acc: number, l: Load) => acc + +(l.linear_meters ?? 0),
        0
    );
    let textParts = "";
    if (loads.length === 1) {
        textParts += getLoadCategoryAndDescription(loads[0]);
    } else {
        textParts += getLoadsCategoryAndQuantity(loads);
    }
    if (totalWeight > 0 || totalVolume > 0) {
        textParts += " /";
    }
    if (totalWeight > 0) {
        textParts +=
            ` ${formatNumber(totalWeight, {maximumFractionDigits: 0})} ` +
            t("pricingMetrics.unit.kg");
    }
    if (totalVolume > 0) {
        const volumeUnit = loads.length > 0 ? loads[0].volume_display_unit : "m3";
        const unitLabel =
            volumeUnit === "L"
                ? t("shipment.volumeUnit.L.short")
                : t("shipment.volumeUnit.m3.short");
        textParts += ` ${totalVolume} ` + unitLabel;
    }
    if (totalLinearMeters > 0) {
        textParts +=
            ` ${formatNumber(totalLinearMeters, {maximumFractionDigits: 2})} ` +
            t("pricingMetrics.unit.linearMeters.short");
    }
    return textParts;
}

export function getActivityKeyLabel(category?: TripActivityCategory): string {
    switch (category) {
        case "loading":
            return t("common.pickup");
        case "unloading":
            return t("common.delivery");
        case "breaking":
            return t("components.break");
        case "trip_start":
            return t("trip.tripStart");
        case "trip_end":
            return t("trip.tripEnd");
        default:
            // "resuming"
            return t("components.resumption");
    }
}
export function getTransportRelatedActivities(
    activities: SimilarActivity[],
    activity: SimilarActivity
): SimilarActivity[] {
    const activitiesOfSameTransport = activities.filter(
        (a) =>
            !a.fakeMerged &&
            activity.transports
                .map((t) => t.id)
                .some((id) => a.transports.map((t) => t.id).includes(id))
    );
    const indexOfActivity = activitiesOfSameTransport.findIndex((a) => a.uid === activity.uid);
    const activitiesBefore = activitiesOfSameTransport.slice(0, indexOfActivity + 1);
    const activitiesAfter = activitiesOfSameTransport.slice(indexOfActivity);

    let indexOfFirstResumeBefore = findLastIndex(
        activitiesBefore,
        (a) => a.category === "resuming"
    );
    if (indexOfFirstResumeBefore === -1) {
        indexOfFirstResumeBefore = 0;
    }

    let indexOfFirstBreakAfter = activitiesAfter.findIndex((a) => a.category === "breaking");
    if (indexOfFirstBreakAfter === -1) {
        indexOfFirstBreakAfter = activitiesAfter.length - 1;
    }
    return activitiesOfSameTransport
        .slice(indexOfFirstResumeBefore, indexOfActivity + indexOfFirstBreakAfter + 1)
        .filter((a) => a.uid !== activity.uid);
}

export function areActivitiesSimilar(activityA: TripActivity, activityB: TripActivity): boolean {
    const hasSameCategory = activityA.category === activityB.category;
    const hasSameStatus = activityA.status === activityB.status;
    const hasSameAddress =
        !!activityA.address &&
        !!activityB.address &&
        ["address", "city", "postcode", "country", "name"].findIndex(
            (key: keyof TransportAddress) => activityA.address?.[key] !== activityB.address?.[key]
        ) === -1;

    return (
        hasSameCategory &&
        hasSameStatus &&
        hasSameAddress &&
        !isTripActivityDeletedOrCancelled(activityA) &&
        !isTripActivityDeletedOrCancelled(activityB)
    );
}

export function _getActivitiesGroupedBySimilar(activities: TripActivity[]): TripActivity[][] {
    return activities.reduce((acc: TripActivity[][], activity: TripActivity) => {
        if (acc.length && areActivitiesSimilar(acc[acc.length - 1][0], activity)) {
            acc[acc.length - 1].push(activity);
        } else {
            acc.push([activity]);
        }
        return acc;
    }, []);
}

function _getMergedActivityBasics(activities: TripActivity[]) {
    const activity = activities[activities.length - 1]; // we need to take the last one that will have the good distance and driving time to next activity

    const activitiesWithScheduledRange = activities.filter((a) => a.scheduled_range);
    const scheduledRange =
        activitiesWithScheduledRange.length > 0
            ? ({
                  start: min(activitiesWithScheduledRange.map((a) => a.scheduled_range?.start)),
                  end: max(activitiesWithScheduledRange.map((a) => a.scheduled_range?.end)),
              } as SiteSlot)
            : null;

    const transports = activities
        .flatMap((a) => a.transport)
        .filter((t: TripTransport) => t !== null) as unknown as TripTransport[];

    return {
        address: activity.address,
        category: activity.category,
        status: activity.status,
        cancelled_status: activity.cancelled_status,
        fakeMerged: true,
        is_booking_needed: activities.findIndex((a) => a.is_booking_needed) >= 0,
        locked_requested_times: activities.findIndex((a) => a.locked_requested_times) >= 0,
        real_start: min(activities.map((a) => a.real_start)) || null,
        real_end: max(activities.map((a) => a.real_end)) || null,
        scheduled_range: scheduledRange,
        similarUids: activities.map((a) => a.uid),
        transports,
        uid: activities.map((a) => a.uid).join("/"),
        estimated_distance_to_next_trip_activity:
            activity.estimated_distance_to_next_trip_activity,
        estimated_driving_time_to_next_trip_activity:
            activity.estimated_driving_time_to_next_trip_activity,
        reference: activities
            .map((a) => a.reference)
            .filter((ref) => ref !== "")
            .join(" ; "),
    };
}

function _getMergedActivity(activities: TripActivity[]): SimilarActivity {
    const deliveries_from = activities.flatMap((a) => a.deliveries_from);
    const deliveries_to = activities.flatMap((a) => a.deliveries_to);
    const slots = activities.flatMap((a) => a.slots).filter((s) => s != undefined) as SiteSlot[];

    return {
        ..._getMergedActivityBasics(activities),
        deliveries_from,
        deliveries_to,
        slots: slots,
    };
}

export function getMergedActivityWithTransportData(
    activities: TripActivity[]
): SimilarActivityWithTransportData {
    const deliveries_from = activities.flatMap((a) =>
        a.deliveries_from?.map((d) => {
            return {
                ...d,
                transportUid: a.transport?.uid ?? null,
                transportId: a.transport?.sequential_id ?? null,
            };
        })
    );

    const deliveries_to = activities.flatMap((a) =>
        a.deliveries_to?.map((d) => {
            return {
                ...d,
                transportUid: a.transport?.uid ?? null,
                transportId: a.transport?.sequential_id ?? null,
            };
        })
    );
    const slots = activities
        .flatMap((a) =>
            a.slots
                ?.filter((s) => s != undefined)
                .map((s) => {
                    return {
                        ...s,
                        transportUid: a.transport?.uid ?? null,
                        transportId: a.transport?.sequential_id ?? null,
                    };
                })
        )
        .filter((s) => s != undefined) as (SiteSlot & AdditionalTransportData)[];

    return {
        ..._getMergedActivityBasics(activities),
        deliveries_from,
        deliveries_to,
        slots,
    };
}

export function getCompactActivities(activities: TripActivity[]): SimilarActivity[] {
    // return a list of activities where we merge similar activities
    // eg: L1, L2, U1, U2 where L1 and L2 are similar becomes L12, U1, U2
    return _getActivitiesGroupedBySimilar(activities).reduce(
        (acc: SimilarActivity[], activities) => {
            if (activities.length === 1) {
                const {transport, ...activity} = activities[0];
                acc.push({
                    ...activity,
                    transports: transport ? [transport] : [],
                    similarUids: [],
                    fakeMerged: false,
                });
            } else {
                const mergedActivity = _getMergedActivity(activities);
                acc.push(mergedActivity);
            }
            return acc;
        },
        []
    );
}

export function getActivitiesWithFakeMergedActivitiesAdded(
    activities: TripActivity[]
): SimilarActivityWithTransportData[] {
    // return a list of activities  where we included a fake merged activity
    // at the beginning of similar activities
    // eg: L1, L2, U1, U2 where L1 and L2 are similars becomes Lmerged, L1, L2, U1, U2
    const result = _getActivitiesGroupedBySimilar(activities).reduce(
        (acc: SimilarActivityWithTransportData[], activities: TripActivity[]) => {
            if (activities.length === 1) {
                const {transport, ...activity} = activities[0];
                acc.push({
                    ...activity,
                    transports: transport ? [transport] : [],
                    similarUids: [],
                    fakeMerged: false,
                });
            } else {
                const mergedActivity = getMergedActivityWithTransportData(activities);
                const extendedActivities: SimilarActivityWithTransportData[] = activities.map(
                    ({transport, ...activity}) => ({
                        ...activity,
                        transports: transport ? [transport] : [],
                        similarUids: activities.map((a) => a.uid),
                        fakeMerged: false,
                    })
                );
                acc.push(mergedActivity, ...extendedActivities);
            }
            return acc;
        },
        []
    );
    return result;
}

export function getActivityIndexWithoutSimilarCount(
    index: number,
    activity: SimilarActivity,
    activitiesWithFakeMergedSimilar: SimilarActivity[]
): number | "similar" {
    if (activity.similarUids.length > 0 && !activity.fakeMerged) {
        return "similar";
    }
    let numberOfSimilarActivitiesBefore = activitiesWithFakeMergedSimilar
        .slice(0, index)
        .filter((activity) => activity.similarUids.length > 0 && !activity.fakeMerged).length;
    return index - numberOfSimilarActivitiesBefore;
}

function _isRentalTrip(trip: CompactTrip): boolean {
    return getFirstActivity(trip).deliveries_from?.[0]?.planned_loads?.[0]?.category === "rental";
}
function _isRoundTrip(trip: CompactTrip): boolean {
    return getFirstActivity(trip).deliveries_from?.[0]?.multiple_rounds || false;
}
function _isMultiCompartmentTrip(trip: CompactTrip): boolean {
    return getFirstActivity(trip).transports.some((t) => t.is_multiple_compartments);
}
function _hasBusinessPrivacyTrip(trip: CompactTrip): boolean {
    return getFirstActivity(trip).transports.some((t) => t.business_privacy);
}

export function validateTripTypesForMerge(trips: CompactTrip[]): {
    invalidTripsInfo: {trip: CompactTrip; reason: InvalidTripType}[];
    validTrips: CompactTrip[];
} {
    let invalidTripsInfo: {trip: CompactTrip; reason: InvalidTripType}[] = [];
    let validTrips: CompactTrip[] = [];
    trips.map((trip) => {
        if (_isRoundTrip(trip)) {
            invalidTripsInfo.push({trip, reason: "round"});
        } else if (_isRentalTrip(trip)) {
            invalidTripsInfo.push({trip, reason: "rental"});
        } else if (_isMultiCompartmentTrip(trip)) {
            invalidTripsInfo.push({trip, reason: "multiCompartments"});
        } else if (_hasBusinessPrivacyTrip(trip)) {
            invalidTripsInfo.push({trip, reason: "businessPrivacy"});
        } else {
            validTrips.push(trip);
        }
    });
    return {invalidTripsInfo, validTrips};
}

export const isTripActivityStarted = (activity: SimilarActivity): boolean =>
    activity.status !== "created";

export const isTripActivityOnSite = (activity: SimilarActivity): boolean =>
    ["on_site", "activity_in_progress"].includes(activity.status);

export const isTripActivityComplete = (activity: SimilarActivity): boolean =>
    ["activity_done", "departed"].includes(activity.status) ||
    (activity.transports.length > 0 &&
        activity.transports.every((t) => t.global_status === "done"));

export function isTripActivityDeletedOrCancelled(activity: SimilarActivity | TripActivity) {
    return activity.cancelled_status !== null;
}
export function getActivityStatus(
    activity: SimilarActivity
): ActivityMarkerProps["activityStatus"] {
    if (activity.cancelled_status !== null) {
        return activity.cancelled_status;
    }

    return isTripActivityComplete(activity)
        ? "done"
        : isTripActivityOnSite(activity)
          ? "on_site"
          : "not_started";
}

export function isTransportPartOfAPreparedTrip(transport: Transport): boolean {
    return transport.segments.some(
        (segment) => segment.origin.trip?.is_prepared || segment.destination.trip?.is_prepared
    );
}

export function canEditTripMeans(trip: TripWithTransportData | CompactTrip): boolean {
    if (trip.status !== "unstarted") {
        return false;
    }

    return true;
}

export function formatMinutesDuration(durationInMinutes: number): string {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return (
        (hours ? formatNumber(hours, {style: "unit", unit: "hour"}) + " " : "") +
        formatNumber(minutes, {
            style: "unit",
            unit: "minute",
            minimumIntegerDigits: hours ? 2 : undefined,
        })
    );
}

export function formatEstimatedDrivingTime(estimatedDrivingTime: number): string {
    const estimatedDrivingTimeInMinutes = Math.floor(estimatedDrivingTime / 60);
    return formatMinutesDuration(estimatedDrivingTimeInMinutes);
}

export function getPositions(activities: SimilarActivity[]): ActivityMapPosition[] {
    const positions: ActivityMapPosition[] = [];
    const positionsMerged: ActivityMapPosition[] = [];

    activities.map((activity, index) => {
        const activityIndex = index + 1;

        // Position of the activity site
        const sitePosition = getEntityLatLng(activity.address);

        if (sitePosition) {
            positions.push({
                type: "activity",
                key: activity.uid,
                latlng: sitePosition,
                address: activity.address,
                activityIndex,
                activityStatus: getActivityStatus(activity),
                category: activity.category,
                activitiesOnSameLocation: [],
            });
        }
    });

    //If there is several positions with same latlng, merge them
    for (const position of positions) {
        const positionAlreadyInMerged = positionsMerged.find((predicate) =>
            position.latlng.equals(predicate.latlng)
        );

        if (positionAlreadyInMerged) {
            positionsMerged[
                positionsMerged.indexOf(positionAlreadyInMerged)
            ].activitiesOnSameLocation!.push(position);
        } else {
            positionsMerged.push({
                ...position,
            });
        }
    }
    return positionsMerged;
}

export function getFirstTransport(trip: CompactTrip) {
    return trip.activities.filter((activity) => activity.transports?.length > 0)[0].transports[0];
}

export function getFirstActivity(trip: CompactTrip) {
    return trip.activities.filter(
        (activity) => activity.category !== "trip_start" && activity.category !== "trip_end"
    )[0];
}

export function getLastActivity(trip: CompactTrip) {
    const activities = trip.activities.filter(
        (activity) => activity.category !== "trip_start" && activity.category !== "trip_end"
    );
    return activities[activities.length - 1];
}

export function getLoadQuantityFromActivity(
    activity: SimilarActivity,
    initial: number,
    selectedUnit: "weight" | "volume" | "linear_meters" | "quantity"
) {
    // Compute the quantity loaded during this activity
    // @ts-ignore
    const loaded = activity.deliveries_from.reduce<number>((acc, cur) => {
        const actualQuantity =
            cur.planned_loads?.reduce<number>(
                (total, plannedLoad: Load) => total + Number(plannedLoad[selectedUnit]),
                0
            ) ?? 0;
        acc += actualQuantity;
        return acc;
    }, 0);

    // Compute the quantity unloaded during this activity
    // @ts-ignore
    const unloaded = activity.deliveries_to.reduce<number>((acc, cur) => {
        const actualQuantity =
            cur.planned_loads?.reduce<number>(
                (total, plannedLoad) => total + Number(plannedLoad[selectedUnit]),
                0
            ) ?? 0;
        acc += actualQuantity;
        return acc;
    }, 0);

    return [initial + loaded - unloaded, loaded, unloaded];
}

export function canAddBreak(
    activities: SimilarActivityWithTransportData[],
    index: number
): boolean {
    const activitiesBeforeBreak = activities.slice(0, index + 1);
    const transportIdsBeforeBreak = activitiesBeforeBreak.flatMap(
        (activity: SimilarActivityWithTransportData) => {
            if ("transports" in activity) {
                return activity.transports.map((t: TripTransport) => t.id);
            } else {
                return null;
            }
        }
    );
    // Remove duplicates
    const uniqueTransportIdsBeforeBreak = Array.from(new Set(transportIdsBeforeBreak));

    const activitiesAfterBreak = activities.slice(index + 1);
    const transportIdsAfterBreak = activitiesAfterBreak.flatMap(
        (activity: SimilarActivityWithTransportData) => {
            if ("transports" in activity) {
                return activity.transports.map((t: TripTransport) => t.id);
            } else {
                return null;
            }
        }
    );
    // Remove duplicates
    const uniqueTransportIdsAfterBreak = Array.from(new Set(transportIdsAfterBreak));

    // If unique transport ids before and after break have a common value, then the next segment is breakable
    const canAddBreak = uniqueTransportIdsBeforeBreak.some((id) =>
        uniqueTransportIdsAfterBreak.includes(id)
    );
    return canAddBreak;
}
