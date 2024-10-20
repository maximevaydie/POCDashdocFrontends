import {useDispatch, useSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ReorderableListWithMergedItems} from "@dashdoc/web-ui";
import {isEqual} from "date-fns";
import {intersectionBy} from "lodash";
import React from "react";

import {ActivitiesHeader} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/components/trip-activities/ActivitiesHeader";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getTripDecoration} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tripStatus.constants";
import {transportBadgeVariants} from "app/features/trip/trip-edition/trip-activity-list/TripActivityList";
import {
    areActivitiesSimilar,
    getMergedActivityWithTransportData,
} from "app/features/trip/trip.service";
import {Trip, TripActivity, TransportBadgeVariant} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {
    updateTripActivitiesOrder,
    fetchReorderActivityIntoTrip,
    fetchRetrieveTrip,
} from "app/redux/actions/trips";
import {RootState} from "app/redux/reducers/index";
import {getTripByUid} from "app/redux/selectors";

import {ActivityRow} from "./activity-row/ActivityRow";

type Props = {tripUid: string | null; editable: boolean; view: TripSchedulerView};
export function TripActivities({tripUid, view, editable}: Props) {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const trip: Trip | null = useSelector(
        (state: RootState) => getTripByUid(state, tripUid),
        isEqual
    );
    const badgeVariantByUid = useBadgeVariant(trip);
    if (!trip) {
        return null;
    }

    const decoration = getTripDecoration(trip, view);
    const isComplexTransport =
        trip.activities.filter((a) => a.category === "loading").length > 1 &&
        trip.activities.filter((a) => a.category === "unloading").length > 1;
    return (
        <Box width="100%" height="100%" overflow="auto">
            <Box minWidth="100%" width="fit-content">
                <ActivitiesHeader
                    isPreparedTrip={trip?.is_prepared ?? false}
                    isTripStarted={trip?.status !== "unstarted"}
                    isComplexTransport={isComplexTransport}
                />
                <ReorderableListWithMergedItems<TripActivity>
                    items={trip.activities}
                    getItemId={(activity) => activity.uid ?? ""}
                    areItemsSimilar={areActivitiesSimilar}
                    onReorderItems={reorderActivities}
                    getOrderError={getOrderError}
                    getItemContent={getItemContent}
                    getMergedItemContent={getMergedItemContent}
                    displayMode="table"
                    collapsedByDefault
                    isItemDraggable={isItemDraggable}
                />
            </Box>
        </Box>
    );

    function reorderActivities(
        movedActivities: Array<TripActivity>,
        oldIndex: number,
        newIndex: number
    ) {
        if (!trip || !tripUid) {
            return;
        }
        const reorderedActivities = [...trip.activities];
        const removed = reorderedActivities.splice(oldIndex, movedActivities.length);
        reorderedActivities.splice(newIndex, 0, ...removed);
        const reorderedActivitiesUids = reorderedActivities.map((a) => a.uid);
        const movedActivityUids = movedActivities.map((a) => a.uid);
        const minIndex = trip.activities.findIndex(
            (activity) => activity.uid === movedActivityUids[0]
        );
        const targetIndex = reorderedActivitiesUids.findIndex(
            (uid) => uid === movedActivityUids[0]
        );

        // early update activities order in redux store
        dispatch(updateTripActivitiesOrder(tripUid, reorderedActivitiesUids));

        // update activities order in db
        fetchReorderActivityIntoTrip({
            tripUid,
            movedActivityUids,
            minIndex,
            maxIndex: minIndex + movedActivityUids.length - 1,
            targetIndex,
            extendedView,
        })(dispatch)
            // eslint-disable-next-line github/no-then
            .catch(() =>
                // refetch trip if any error to get the last version
                dispatch(fetchRetrieveTrip(tripUid, extendedView))
            );
    }

    function getOrderError(
        movedActivity: TripActivity,
        beforeActivities: TripActivity[],
        afterActivities: TripActivity[]
    ) {
        if (beforeActivities.some((activity) => activity.category === "trip_end")) {
            return t("trip.cannotMoveActivityAfterTripEnd");
        }
        const linkedBeforeActivities = beforeActivities.filter((activity) =>
            isActivityRelatedTo(activity, movedActivity)
        );
        if (
            movedActivity.category === "loading" &&
            linkedBeforeActivities.findIndex((activity) => activity.category === "unloading") !==
                -1
        ) {
            return t("transportDetails.loadingCannotBeMovedAfterUnloading");
        } else if (
            ["breaking", "resuming"].some((c) => c === movedActivity.category) &&
            linkedBeforeActivities.length !== 0
        ) {
            return t("transportDetails.breakCannotBeMovedHere");
        } else if (
            ["loading", "unloading"].some((v) => v === movedActivity.category) &&
            linkedBeforeActivities.findIndex(
                (act) => act.category === "breaking" || act.category === "resuming"
            ) !== -1
        ) {
            return t("transportDetails.activityCannotBeMovedAfterBreak");
        }

        if (afterActivities.some((activity) => activity.category === "trip_start")) {
            return t("trip.cannotMoveActivityBeforeTripStart");
        }
        const linkedAfterActivities = afterActivities.filter((activity) =>
            isActivityRelatedTo(activity, movedActivity)
        );
        if (
            movedActivity.category === "unloading" &&
            linkedAfterActivities.findIndex((activity) => activity.category === "loading") !== -1
        ) {
            return t("transportDetails.unloadingCannotBeMovedBeforeLoading");
        } else if (
            ["breaking", "resuming"].some((c) => c === movedActivity.category) &&
            linkedAfterActivities.length !== 0
        ) {
            return t("transportDetails.breakCannotBeMovedHere");
        } else if (
            ["loading", "unloading"].some((v) => v === movedActivity.category) &&
            linkedAfterActivities.findIndex(
                (act) => act.category === "breaking" || act.category === "resuming"
            ) !== -1
        ) {
            return t("transportDetails.activityCannotBeMovedBeforeBreak");
        }

        return null;
    }

    function getItemContent(
        activity: TripActivity,
        index: number | "similar",
        _: boolean,
        isLastItemOfGroup: boolean
    ) {
        const formattedActivity = getMergedActivityWithTransportData([activity]);
        return (
            <ActivityRow
                activity={formattedActivity}
                index={index}
                decoration={decoration}
                isPreparedTrip={trip?.is_prepared ?? false}
                isTripStarted={trip?.status !== "unstarted"}
                isComplexTransport={isComplexTransport}
                badgeVariantByUid={badgeVariantByUid}
                isLastItemOfGroup={isLastItemOfGroup}
                isCollapsed={false}
                editable={editable}
                draggable={isItemDraggable(activity)}
                tripUid={tripUid as string}
            />
        );
    }

    function getMergedItemContent(
        activities: TripActivity[],
        index: number,
        isCollapsed: boolean,
        onExpandCollapse?: () => void
    ) {
        const formattedActivity = getMergedActivityWithTransportData(activities);
        return (
            <ActivityRow
                activity={formattedActivity}
                index={index}
                decoration={decoration}
                isPreparedTrip={trip?.is_prepared ?? false}
                isTripStarted={trip?.status !== "unstarted"}
                isComplexTransport={isComplexTransport}
                badgeVariantByUid={badgeVariantByUid}
                isLastItemOfGroup={false}
                isCollapsed={isCollapsed}
                onExpandCollapse={onExpandCollapse}
                editable={editable}
                draggable={isItemDraggable(activities[0])}
                tripUid={tripUid as string}
            />
        );
    }

    function isItemDraggable(activity: TripActivity) {
        return Boolean(
            editable &&
                activity.category !== "trip_start" &&
                activity.category !== "trip_end" &&
                trip &&
                trip.activities.length > 2 &&
                ["unstarted", "ongoing"].includes(trip.status as string)
        );
    }
}

function isActivityRelatedTo(activity: TripActivity, movedActivity: TripActivity) {
    return (
        activity.transport?.uid &&
        activity.transport?.uid === movedActivity.transport?.uid &&
        (["breaking", "resuming"].includes(movedActivity.category as string) ||
            ["breaking", "resuming"].includes(activity.category as string) ||
            intersectionBy(movedActivity.deliveries_from, activity.deliveries_to, "uid").length >
                0 ||
            intersectionBy(movedActivity.deliveries_to, activity.deliveries_from, "uid").length >
                0)
    );
}

function useBadgeVariant(trip: Trip | null) {
    const badgeVariantsMap: Record<string, TransportBadgeVariant> = {};
    if (!trip) {
        return {};
    }
    let uids: string[];
    if (trip.is_prepared) {
        uids = Array.from(new Set(trip.activities.map((activity) => activity.transport?.uid)))
            .filter((uid) => !!uid)
            .sort() as string[];
    } else {
        uids = Array.from(
            new Set(
                trip.activities.flatMap((activity) =>
                    [...activity.deliveries_from, ...activity.deliveries_to].map((d) => d.uid)
                )
            )
        )
            .filter((uid) => !!uid)
            .sort() as string[];
    }
    uids.forEach((uid) => {
        badgeVariantsMap[uid] =
            transportBadgeVariants[uids.indexOf(uid) % transportBadgeVariants.length];
    });

    return badgeVariantsMap;
}
