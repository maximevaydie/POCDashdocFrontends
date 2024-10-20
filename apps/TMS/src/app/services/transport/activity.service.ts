import {LOCALE_FOR_JS_UTILS_I18N_FUNCS} from "@dashdoc/web-core";
import {
    ActivitySiteType,
    ActivityStatus,
    ActivityType,
    DeliveryDocument,
    isActivityRental,
    isTransportAmended,
    isTransportVerified,
    TransportMessage,
    TransportStatusCategory,
    Trucker,
    Locale,
    bindToLocale,
} from "dashdoc-utils";
import {intersectionBy} from "lodash";
import memoize from "lodash.memoize";
import sortBy from "lodash.sortby";

import {
    getTransportDeliveriesBySiteUid,
    getTransportDeliveryDocumentsBySiteUid,
    getTransportMessageDocumentsBySiteUid,
    getTransportSegmentsBySiteUid,
    getTransportSortedSites,
} from "app/services/transport/transport.service";

import type {
    Segment,
    Site,
    Activity,
    Transport,
    Delivery,
    TransportStatus,
} from "app/types/transport";

const isBreak = (site: Site): boolean => ["breaking", "resuming"].includes(site.category);

const getDateRangeToMarkDone = (
    segment: Segment | undefined,
    type: Extract<ActivityType, "loading" | "unloading">
): {
    start: Date | string;
    end: Date | string;
} => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);

    const defaultDateRange = {start: new Date(now), end: new Date(now)};

    const plannedDateRange =
        type === "loading" ? segment?.scheduled_start_range : segment?.scheduled_end_range;

    const activityType = type === "loading" ? "origin" : "destination";

    const askedDateRange =
        segment && segment[activityType]?.slots?.length > 0
            ? segment[activityType].slots[0]
            : null;

    return plannedDateRange || askedDateRange || defaultDateRange;
};

function getActivityStatus(
    statusUpdates: TransportStatus[],
    completeStatus: TransportStatus | null,
    activityType: ActivityType,
    site: Site,
    isMultipleRounds?: boolean
): ActivityStatus {
    if (completeStatus) {
        return "done";
    }

    if (statusUpdates.find((status) => status.category === "cancelled")) {
        return "cancelled";
    }

    const onSiteStatus = statusUpdates.find(
        (update: TransportStatus) =>
            update.category === `on_${activityType}_site` || update.category === "rounds_started"
    );
    const onTheWayStatus = statusUpdates.find(
        (update: TransportStatus) => update.category === "on_the_way"
    );
    if (isMultipleRounds) {
        return onSiteStatus ? "rounds_started" : "not_started";
    } else if (onSiteStatus) {
        return "on_site";
    } else if (onTheWayStatus) {
        return "on_the_way";
    }

    // Handle trucker change
    if (activityType === "bulkingBreakStart" || activityType === "bulkingBreakEnd") {
        const breakStatus = statusUpdates.find(
            (update: TransportStatus) =>
                site.uid === update.site &&
                update.category ===
                    (activityType === "bulkingBreakStart"
                        ? "bulking_break_started"
                        : "bulking_break_complete")
        );
        if (breakStatus) {
            return "done";
        }
    }

    return "not_started";
}

type BreakStatus = Extract<ActivityType, "bulkingBreakStart" | "bulkingBreakEnd">;
function getSiteActivity({
    index,
    site,
    deliveries,
    siteType,
    transport,
    previousActivities,
    segment,
    previousSegment,
    nextSegment,
    bulkingBreakStatus,
    deliveryDocuments,
    messageDocuments,
    forTrucker,
}: {
    index: number;
    site: Site;
    deliveries: Delivery[];
    siteType: ActivitySiteType;
    transport: Transport;
    previousActivities: Activity[];
    segment: Segment;
    previousSegment: Segment | null;
    nextSegment: Segment | null;
    bulkingBreakStatus?: BreakStatus;
    deliveryDocuments: DeliveryDocument[];
    messageDocuments: TransportMessage[];
    forTrucker: boolean;
}): Activity {
    const isMultipleRounds = transport.deliveries?.[0]?.multiple_rounds ?? false;

    const type = getActivityTypeFromSiteType(siteType, {bulkingBreakStatus});

    let statusUpdates: TransportStatus[];
    if (isMultipleRounds) {
        statusUpdates = transport.status_updates;
    } else {
        statusUpdates = transport.status_updates.filter(
            (statusUpdate: TransportStatus) => !statusUpdate.site || statusUpdate.site === site.uid
        );
    }

    const completeStatus = statusUpdates.find((update: TransportStatus) =>
        ["loading_complete", "unloading_complete", "rounds_complete", "departed"].includes(
            update.category
        )
    ) as TransportStatus | null;

    const electronicSignatureRequired =
        ["sms", "email", "contactless_email"].includes(
            completeStatus?.signature?.signature_method ?? ""
        ) && !completeStatus?.signature?.signatory_signed_at;

    const activityStatus = getActivityStatus(
        statusUpdates,
        completeStatus,
        type,
        site,
        isMultipleRounds
    );
    const requiresWashing: boolean = type === "loading" && transport.requires_washing;
    const truckWashed: boolean = transport.status_updates.some(
        ({category}) => category === "truck_wash"
    );

    const canBeDone = computeActivityCanBeDone(
        transport,
        activityStatus,
        previousActivities,
        isMultipleRounds,
        type,
        segment?.trucker?.pk,
        forTrucker,
        deliveries
    );

    const isCancelled =
        transport.global_status !== "cancelled" &&
        ["loading", "unloading"].includes(type) &&
        site.is_cancelled;

    return {
        index,
        instructions: type === "loading" ? site.loading_instructions : site.unloading_instructions,
        site,
        segment,
        previousSegment,
        nextSegment,
        deliveries,
        transportUid: transport.uid,
        type,
        siteType,
        statusUpdates,
        status: activityStatus,
        canBeDone,
        createdBy: transport.created_by,
        isMultipleRounds,
        requiresWashing,
        truckWashed,
        electronicSignatureRequired,
        volumeDisplayUnit: transport.volume_display_unit,
        isTransportUnderBusinessPrivacy: transport.business_privacy,
        deliveryDocuments,
        messageDocuments,
        canBeUndone: false,
        isCancelled,
    };
}

/*
 * Transport must be denormalized
 */
type GetTransportActivitiesOptions = {
    activityTypesToOmit?: ActivityType[];
    forTrucker?: boolean;
};
function getTransportActivities(
    transport: Transport,
    {activityTypesToOmit = [], forTrucker = false}: GetTransportActivitiesOptions = {}
) {
    const activities: Activity[] = [];
    const sortedSites = getTransportSortedSites(transport);
    const segmentsBySite = getTransportSegmentsBySiteUid(transport);
    const deliveriesBySite = getTransportDeliveriesBySiteUid(transport);
    const deliveryDocumentsBySite = getTransportDeliveryDocumentsBySiteUid(transport);
    const messageDocumentsBySite = getTransportMessageDocumentsBySiteUid(transport);

    sortedSites.forEach((site) => {
        const nextSegment = segmentsBySite?.[site.uid]?.origin;
        const previousSegment = segmentsBySite?.[site.uid]?.destination;

        const originDeliveries = deliveriesBySite?.[site.uid]?.origin || [];
        const destinationDeliveries = deliveriesBySite?.[site.uid]?.destination || [];
        const siteIsOriginOfDelivery = originDeliveries.length > 0;
        const siteIsDestinationOfDelivery = destinationDeliveries.length > 0;

        const deliveries = originDeliveries.concat(destinationDeliveries);
        const deliveryDocuments =
            site.uid in deliveryDocumentsBySite
                ? sortBy(deliveryDocumentsBySite[site.uid], "file_updated_date")
                : [];
        const messageDocuments =
            site.uid in messageDocumentsBySite
                ? sortBy(messageDocumentsBySite[site.uid], "created")
                : [];

        const action = site.action;

        if (siteIsDestinationOfDelivery) {
            const siteType = "destination";
            if (!activityTypesToOmit.includes(getActivityTypeFromSiteType(siteType))) {
                activities.push(
                    getSiteActivity({
                        index: activities.length,
                        site,
                        deliveries,
                        siteType,
                        transport,
                        previousActivities: activities,
                        segment: previousSegment as Segment,
                        previousSegment,
                        nextSegment,
                        deliveryDocuments,
                        messageDocuments,
                        forTrucker,
                    })
                );
            }
        }
        if (siteIsOriginOfDelivery) {
            const siteType = "origin";
            if (!activityTypesToOmit.includes(getActivityTypeFromSiteType(siteType))) {
                activities.push(
                    getSiteActivity({
                        index: activities.length,
                        site,
                        deliveries,
                        siteType,
                        transport,
                        previousActivities: activities,
                        segment: nextSegment as Segment,
                        previousSegment,
                        nextSegment,
                        deliveryDocuments,
                        messageDocuments,
                        forTrucker,
                    })
                );
            }
        }

        // if no delivery and no actions on this site, it's a trucker change
        if (!siteIsOriginOfDelivery && !siteIsDestinationOfDelivery && !action) {
            const siteType = "bulkingBreak";
            if (
                !activityTypesToOmit.includes(
                    getActivityTypeFromSiteType(siteType, {
                        bulkingBreakStatus: "bulkingBreakStart",
                    })
                )
            ) {
                activities.push(
                    getSiteActivity({
                        index: activities.length,
                        site,
                        deliveries,
                        siteType,
                        transport,
                        previousActivities: activities,
                        bulkingBreakStatus: "bulkingBreakStart",
                        segment: previousSegment as Segment,
                        previousSegment,
                        nextSegment,
                        deliveryDocuments,
                        messageDocuments,
                        forTrucker,
                    })
                );
            }
            if (
                !activityTypesToOmit.includes(
                    getActivityTypeFromSiteType(siteType, {
                        bulkingBreakStatus: "bulkingBreakEnd",
                    })
                )
            ) {
                activities.push(
                    getSiteActivity({
                        index: activities.length,
                        site,
                        deliveries,
                        siteType,
                        transport,
                        previousActivities: activities,
                        bulkingBreakStatus: "bulkingBreakEnd",
                        segment: nextSegment as Segment,
                        previousSegment,
                        nextSegment,
                        deliveryDocuments,
                        messageDocuments,
                        forTrucker,
                    })
                );
            }
        }
    });

    activities.forEach((activity, index) => {
        const nextActivities = activities.slice(index + 1);
        const canBeUndone = computeActivityCanBeUndone(transport, activity, nextActivities);
        activity.canBeUndone = canBeUndone;
    });

    return activities;
}
const memoizedGetTransportActivities = memoize(getTransportActivities);
export {memoizedGetTransportActivities as getTransportActivities};

export type ActivityMeans = Pick<
    Segment,
    "vehicle" | "trailers" | "trucker" | "child_transport"
> & {
    breakSite?: Site | null;
};

export type TransportActivitiesByMeans = Map<ActivityMeans, Activity[]>;

function getTransportActivitiesByMeans(
    transport: Transport,
    {activityTypesToOmit = [], ...options}: GetTransportActivitiesOptions = {}
): TransportActivitiesByMeans {
    const activities = getTransportActivities(transport, options);
    const activitiesByMeans = new Map<ActivityMeans, Activity[]>();

    let currentMeans: ActivityMeans;
    let currentStringifiedMeans = "";
    let currentMeansActivities: Activity[] = [];
    let index = -1;

    activities.forEach((activity) => {
        const isBreak = activity.type === "bulkingBreakEnd";
        const breakSite = isBreak ? activity.site : null;
        const activityMeans = {
            vehicle: activity.segment?.vehicle ?? null,
            trailers: activity.segment?.trailers ?? [],
            trucker: activity.segment?.trucker ?? null,
            child_transport: activity.segment?.child_transport,
            breakSite,
        };

        const stringifiedActivityMeans = `${
            activity.segment?.vehicle?.license_plate
        }-${activity.segment?.trailers?.map(
            ({license_plate}) => license_plate
        )}-${activity.segment?.trucker?.pk}-${activity.segment?.child_transport}`;

        const activityShouldBeOmitted = activityTypesToOmit.includes(activity.type);

        // start a new array of activities on breaks and new means
        if (isBreak || currentStringifiedMeans !== stringifiedActivityMeans) {
            currentMeans = activityMeans;
            currentStringifiedMeans = stringifiedActivityMeans;
            currentMeansActivities = [];
        }

        if (!activityShouldBeOmitted) {
            currentMeansActivities.push({...activity, index: (index += 1)});
        }

        activitiesByMeans.set(currentMeans!, currentMeansActivities);
    });

    return activitiesByMeans;
}
const memoizedGetTransportActivitiesByMeans = memoize(getTransportActivitiesByMeans);

const getActivityTypeFromSiteType = (
    siteType: ActivitySiteType,
    {bulkingBreakStatus}: {bulkingBreakStatus?: BreakStatus} = {}
): ActivityType => {
    switch (siteType) {
        case "origin":
            return "loading";
        case "destination":
            return "unloading";
        case "bulkingBreak":
            return bulkingBreakStatus === "bulkingBreakStart"
                ? "bulkingBreakStart"
                : "bulkingBreakEnd";
        default:
            throw `Unexpected siteType provided in getSiteActivity: ${siteType}`;
    }
};

const getActivityFirstStatusUpdateMatching = (
    activity: Activity,
    categories: TransportStatusCategory[]
) => activity.statusUpdates.find(({category}) => categories.includes(category));

const getActivityOnSiteStatus = (activity: Activity) => {
    if (activity.siteType === "bulkingBreak") {
        return getActivityFirstStatusUpdateMatching(activity, ["bulking_break_started"]);
    } else {
        if (activity.isMultipleRounds) {
            if (activity.siteType == "origin") {
                return getActivityFirstStatusUpdateMatching(activity, ["rounds_started"]);
            }
            if (activity.siteType == "destination") {
                return getActivityFirstStatusUpdateMatching(activity, ["rounds_complete"]);
            }
            return undefined;
        } else {
            return getActivityFirstStatusUpdateMatching(activity, [
                "on_loading_site",
                "rounds_started",
                "on_unloading_site",
            ]);
        }
    }
};

const isActivityOnSite = (activity: Activity): boolean => !!getActivityOnSiteStatus(activity);

const isActivityStarted = (activity: Activity): boolean =>
    !["not_started", "on_the_way"].includes(activity.status);

const isActivityComplete = (activity: Activity): boolean =>
    ["rounds_complete", "done"].includes(activity.status);

const getActivityCompleteStatus = (activity: Activity) => {
    if (activity.siteType === "bulkingBreak") {
        return getActivityFirstStatusUpdateMatching(activity, ["bulking_break_complete"]);
    } else {
        if (activity.isMultipleRounds) {
            if (activity.siteType == "origin") {
                return getActivityFirstStatusUpdateMatching(activity, ["rounds_started"]);
            }
            if (activity.siteType == "destination") {
                return getActivityFirstStatusUpdateMatching(activity, ["rounds_complete"]);
            }
            return undefined;
        } else {
            return getActivityFirstStatusUpdateMatching(activity, [
                "loading_complete",
                "unloading_complete",
                "rounds_complete",
                "departed",
            ]);
        }
    }
};

function computeActivityCanBeDone(
    transport: Transport,
    activityStatus: ActivityStatus,
    previousActivities: Activity[],
    isMultipleRounds: boolean,
    type: ActivityType,
    activityTruckerId: Trucker["pk"] | undefined,
    forTrucker: boolean,
    deliveries: Array<Delivery>
) {
    if (activityStatus === "done" || activityStatus === "cancelled") {
        return false;
    }

    if (forTrucker) {
        // A trucker cannot finish an activity on a done transport
        const transportIsDone = transport.status_updates.find(
            (statusUpdate) => statusUpdate.category === "done"
        );
        if (transportIsDone) {
            return false;
        }
    }

    if (isMultipleRounds || !previousActivities || previousActivities.length === 0) {
        return true;
    }

    // Same activities types in a row can be done in any order.
    // Loading need to be done before unloading from the same delivery
    // So we go back to the previous activity with another type. If it's done and it is a break or from the same delivery, this one can be done.
    // For truckers, if there was a trucker change before this activity or other activities with the same type and same trucker, this activity can be done too
    for (let i = previousActivities.length - 1; i >= 0; i--) {
        const previousActivity = previousActivities[i];

        if (forTrucker && activityTruckerId !== previousActivity.segment?.trucker?.pk) {
            return true;
        }

        if (
            (["bulkingBreakEnd", "bulkingBreakStart"].includes(previousActivity.type) ||
                ["bulkingBreakEnd", "bulkingBreakStart"].includes(type) ||
                intersectionBy(previousActivity.deliveries, deliveries, "uid")?.length > 0) &&
            (previousActivity.type !== type || previousActivity.status === "done")
        ) {
            // If this activity or previous activity is a break
            // OR
            // If they have a delivery in common
            // THEN,
            // If previous activity has the same type and is done, it means this activity can be done too
            // If previous activity has different type, it means this activity can be done only if the previous activity is done
            return previousActivity.status === "done";
            // Otherwise we continue the loop to the activity before
        }
    }
    // No activity before was another type and, or, if forTrucker is true, done by another trucker
    // Thus, this activity can be done
    return true;
}

function computeActivityCanBeUndone(
    transport: Transport,
    activity: Activity,
    nextActivities: Activity[]
) {
    const transportIsVerified = isTransportVerified(transport);
    const transportWasAmended = isTransportAmended(transport);

    const activityComplete = isActivityCompleteForUndone(activity);

    if (transportIsVerified || transportWasAmended || !activityComplete) {
        return false;
    }

    for (const nextActivity of nextActivities) {
        if (
            nextActivity.type !== activity.type &&
            (transport.shape !== "complex" ||
                nextActivity.type == "bulkingBreakStart" ||
                intersectionBy(nextActivity.deliveries, activity.deliveries, "uid")?.length > 0) &&
            isActivityCompleteOrOngoingForUndone(nextActivity)
        ) {
            return false;
        }
    }

    return true;
}

function isActivityCompleteForUndone(activity: Activity) {
    if (activity.isMultipleRounds) {
        if (activity.type === "loading" && activity.status === "rounds_started") {
            return true;
        }

        if (activity.type === "unloading" && activity.status === "rounds_complete") {
            return true;
        }
    }

    return activity.status === "done";
}

function isActivityCompleteOrOngoingForUndone(activity: Activity) {
    return (
        ["loading_complete", "unloading_complete", "on_site", "on_the_way", "done"].includes(
            activity.status
        ) || isActivityCompleteForUndone(activity)
    );
}

const getActivityOnSiteStatusTextI18N = ({translate: t}: Locale, activity: Activity): string => {
    if (activity.siteType === "bulkingBreak") {
        return t("activityStatus.bulkingBreakStartConfirmed");
    }

    return t("activityStatus.onSite");
};
const getActivityOnSiteStatusText = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getActivityOnSiteStatusTextI18N
);

const getActivityTitleI18N = ({translate: t}: Locale, activity: Activity): string => {
    const isRental = isActivityRental(activity);

    if (activity.type === "loading") {
        if (isRental) {
            return t("activityStatus.startOfRental");
        }
        return t("common.pickup");
    }

    if (activity.type === "unloading") {
        if (isRental) {
            return t("activityStatus.endOfRental");
        }
        return t("common.delivery");
    }

    if (activity.siteType === "bulkingBreak") {
        return t("components.driverChange");
    }

    return "";
};
const getActivityTitle = bindToLocale(LOCALE_FOR_JS_UTILS_I18N_FUNCS, getActivityTitleI18N);

const getActivityCompleteStatusTextI18N = ({translate: t}: Locale, activity: Activity): string => {
    if (activity.isMultipleRounds) {
        if (
            activity.type === "loading" &&
            ["rounds_started", "rounds_complete", "done"].includes(activity.status)
        ) {
            return t("components.roundsStarted");
        }

        if (
            activity.type === "unloading" &&
            ["rounds_complete", "done"].includes(activity.status)
        ) {
            return t("components.roundsComplete");
        }
    }

    if (activity.siteType === "bulkingBreak") {
        return t("activityStatus.bulkingBreakEndConfirmed");
    }

    if (activity.electronicSignatureRequired) {
        return t("components.awaitingSignature");
    }

    return t("activityStatus.done");
};

const getActivityCompleteStatusText = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getActivityCompleteStatusTextI18N
);

export const activityService = {
    isBreak,
    getDateRangeToMarkDone,
    getTransportActivities: memoizedGetTransportActivities,
    getTransportActivitiesByMeans: memoizedGetTransportActivitiesByMeans,
    getActivityTypeFromSiteType,
    isActivityOnSite,
    isActivityStarted,
    isActivityComplete,
    getActivityCompleteStatus,
    getActivityOnSiteStatusText,
    getActivityTitle,
    getActivityCompleteStatusText,
};
