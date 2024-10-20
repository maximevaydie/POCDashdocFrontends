import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, ReorderEditableItemList, Text} from "@dashdoc/web-ui";
import {intersectionBy} from "lodash";
import React, {FunctionComponent, useState} from "react";
import {useDispatch} from "react-redux";
import createPersistedState from "use-persisted-state";

import {DeleteActivityFromTripModal} from "app/features/trip/trip-edition/trip-activity-list/DeleteActivityFromTripModal";
import {useExtendedView} from "app/hooks/useExtendedView";
import {
    fetchReorderActivityIntoTrip,
    fetchRetrieveTrip,
    updateTripActivitiesOrder,
} from "app/redux/actions/trips";

import {
    getActivityIndexWithoutSimilarCount,
    getTransportRelatedActivities,
    isTripActivityStarted,
    canAddBreak,
} from "../../trip.service";
import {SimilarActivityWithTransportData, TransportBadgeVariant} from "../../trip.types";
import TripAddActivity from "../TripAddActivity";

import {ActivityContent} from "./activity-content";
import {DistanceBetweenActivities} from "./DistanceBetweenActivities";
import {MergedActivity} from "./merged-activity";

type TripActivityListProps = {
    tripUid: string;
    activities: SimilarActivityWithTransportData[];
    readOnly: boolean;
    enableSubmitShortcut: () => void;
    disableSubmitShortcut: () => void;
    editingActivityIndex: number | null;
    setEditingActivityIndex: (index: number | null) => void;
    transportUids: any;
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
    isSubcontracted: boolean;
};

export const transportBadgeVariants: Array<TransportBadgeVariant> = [
    "blue",
    "success",
    "warning",
    "error",
    "purple",
    "turquoise",
];
const useDisplayTripDistances = createPersistedState("display-trip-distances");

export const TripActivityList: FunctionComponent<TripActivityListProps> = ({
    tripUid,
    readOnly,
    enableSubmitShortcut,
    disableSubmitShortcut,
    editingActivityIndex,
    setEditingActivityIndex,
    activities,
    getBadgeVariantByTransportUid,
    isSubcontracted,
}) => {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();

    // Initialize collapsedActivities with all activities collapsed
    const [collapsedActivities, setCollapsedActivities] = useState<Record<string, boolean>>(() => {
        const initialCollapsedState: Record<string, boolean> = {};
        activities.forEach((activity) => {
            if (activity.similarUids && activity.similarUids.length > 0) {
                initialCollapsedState[activity.similarUids[0]] = true;
            }
        });
        return initialCollapsedState;
    });

    const [isDistancesDisplayed, setShowDistances] = useDisplayTripDistances(true);

    const [activityToDelete, setActivityToDelete] =
        useState<SimilarActivityWithTransportData | null>(null);

    const editActivity = (index: number | null) => {
        setEditingActivityIndex(index);
        if (index === null) {
            disableSubmitShortcut();
        } else {
            enableSubmitShortcut();
        }
    };

    const canDeleteActivity = (activity: SimilarActivityWithTransportData): boolean => {
        return (
            !isSubcontracted &&
            !readOnly &&
            !activity.fakeMerged &&
            activity.category !== "trip_start" &&
            activity.category !== "trip_end" &&
            !isTripActivityStarted(activity) &&
            getTransportRelatedActivities(activities, activity).every(
                (a) => !isTripActivityStarted(a)
            )
        );
    };

    const canAddActivity = !readOnly && !isSubcontracted;

    const isItemCollapsed = (activity: SimilarActivityWithTransportData) => {
        return collapsedActivities[activity.similarUids[0]];
    };

    const getItemContentToDisplay = (
        activity: SimilarActivityWithTransportData,
        index: number
    ) => {
        // exclude fake activities in the count of index
        const activityIndex = getActivityIndexWithoutSimilarCount(index, activity, activities);

        if (activity.fakeMerged) {
            return (
                <MergedActivity
                    mergedActivity={activity}
                    index={activityIndex}
                    isCollapsed={isItemCollapsed(activity)}
                    setCollapsedActivities={() =>
                        setCollapsedActivities((prev) => ({
                            ...prev,
                            [activity.similarUids[0]]: !prev[activity.similarUids[0]],
                        }))
                    }
                    getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                />
            );
        }

        const activityUids = activity.similarUids;
        const isSimilar = activityUids?.length > 0;
        const isLastSimilarActivity =
            isSimilar && activityUids[activityUids.length - 1] === activity.uid;
        const linkedTorSimilarMode = isLastSimilarActivity ? "last" : "middle";

        return (
            <>
                <ActivityContent
                    activity={activity}
                    index={activityIndex}
                    numberOfActivities={1}
                    linkedToSimilar={
                        !isItemCollapsed(activity) && isSimilar ? linkedTorSimilarMode : null
                    }
                    getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                />
            </>
        );
    };
    const getItemContentUnder = (activity: SimilarActivityWithTransportData, index: number) => {
        const similarActivitiesUids = activity.similarUids;
        const isSimilar = similarActivitiesUids?.length > 1;
        const isLastSimilarActivity =
            isSimilar && similarActivitiesUids[similarActivitiesUids.length - 1] === activity.uid;
        const isLastActivity = index === activities.length - 1;
        const nextActivityUid = isLastActivity
            ? null
            : activities[index + 1].fakeMerged
              ? activities[index + 1].similarUids[0]
              : activities[index + 1].uid;

        const distance =
            isDistancesDisplayed && !isLastActivity && (!isSimilar || isLastSimilarActivity) ? (
                <DistanceBetweenActivities
                    activity={activity}
                    tripUid={tripUid}
                    canAddBreak={canAddBreak(activities, index)}
                    nextActivityUid={nextActivityUid}
                />
            ) : null;

        const space =
            !isItemCollapsed(activity) && isSimilar && !isLastSimilarActivity ? (
                <Box mb={-3} />
            ) : null;

        return (
            <>
                {distance}
                {space}
            </>
        );
    };

    const onBeforeDragStart = (sourceIndex: number) => {
        const draggedActivity = activities[sourceIndex];
        if (draggedActivity.fakeMerged && draggedActivity.similarUids.length > 0) {
            setCollapsedActivities((prev) => ({
                ...prev,
                [draggedActivity.similarUids[0]]: true,
            }));
        }
    };

    const reorderActivities = async (
        _: Array<SimilarActivityWithTransportData>,
        movedItem: SimilarActivityWithTransportData,
        newIndex: number,
        oldIndex: number,
        previousActivities: Array<SimilarActivityWithTransportData>
    ) => {
        // When drop just after a fakedMerge collapsed activity, adjust target index to be sure it is drop after the all group of similar activities
        if (newIndex > 0) {
            const previousActivity = activities[newIndex - 1];
            if (previousActivity.fakeMerged && isItemCollapsed(previousActivity)) {
                newIndex = newIndex + previousActivity.similarUids.length;
            }
        }

        let movedActivityUids: string[] = [];
        let numberOfItemsToMove: number = 1;
        if (movedItem.fakeMerged) {
            // if move a fake merged (resume of similar activities),
            // we need to move all similar activities
            movedActivityUids = movedItem.similarUids;
            numberOfItemsToMove = movedActivityUids.length + 1;
            if (oldIndex < newIndex) {
                newIndex = newIndex - numberOfItemsToMove + 1;
            }
        } else {
            movedActivityUids = [movedItem.uid];
            numberOfItemsToMove = 1;
        }

        // Compute new ordered list
        const orderedActivities = [...previousActivities];
        const removedActivities = orderedActivities.splice(oldIndex, numberOfItemsToMove);
        orderedActivities.splice(newIndex, 0, ...removedActivities);
        const orderedActivitiesUids = orderedActivities
            .filter((a) => !a.fakeMerged)
            .map((a) => a.uid);
        const minIndex = previousActivities
            .filter((activity) => !activity.fakeMerged)
            .findIndex((activity) => activity.uid === movedActivityUids[0]);
        const targetIndex = orderedActivitiesUids.findIndex((uid) => uid === movedActivityUids[0]);

        // early update activities order in redux store
        dispatch(updateTripActivitiesOrder(tripUid, orderedActivitiesUids));

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

        setEditingActivityIndex(null);
    };

    const getDropPositionError = (
        sourceIndex: number,
        destinationIndex: number
    ): string | null => {
        const movedActivity = activities[sourceIndex];
        const transportUids = movedActivity.transports.map((t) => t.uid);
        let filteredActivities = [...activities];
        filteredActivities.splice(sourceIndex, 1);

        if (destinationIndex > sourceIndex) {
            // dropped down in the list
            filteredActivities = filteredActivities.slice(sourceIndex, destinationIndex);

            if (filteredActivities.some((activity) => activity.category === "trip_end")) {
                return t("trip.cannotMoveActivityAfterTripEnd");
            }
            filteredActivities = filteredActivities.filter((activity) =>
                isActivityRelatedTo(activity, movedActivity, transportUids)
            );
            if (
                movedActivity.category === "loading" &&
                filteredActivities.findIndex((activity) => activity.category === "unloading") !==
                    -1
            ) {
                return t("transportDetails.loadingCannotBeMovedAfterUnloading");
            } else if (
                ["breaking", "resuming"].some((c) => c === movedActivity.category) &&
                filteredActivities.length !== 0
            ) {
                return t("transportDetails.breakCannotBeMovedHere");
            } else if (
                ["loading", "unloading"].some((v) => v === movedActivity.category) &&
                filteredActivities.findIndex(
                    (act) => act.category === "breaking" || act.category === "resuming"
                ) !== -1
            ) {
                return t("transportDetails.activityCannotBeMovedAfterBreak");
            } else if (
                movedActivity.fakeMerged &&
                destinationIndex - sourceIndex <= movedActivity.similarUids.length
            ) {
                // moved fakeMerged in between similar activities
                return "";
            }
        } else {
            // dropped up in the list
            filteredActivities = filteredActivities.slice(destinationIndex, sourceIndex);
            if (filteredActivities.some((activity) => activity.category === "trip_start")) {
                return t("trip.cannotMoveActivityBeforeTripStart");
            }
            filteredActivities = filteredActivities.filter((activity) =>
                isActivityRelatedTo(activity, movedActivity, transportUids)
            );
            if (
                movedActivity.category === "unloading" &&
                filteredActivities.findIndex((activity) => activity.category === "loading") !== -1
            ) {
                return t("transportDetails.unloadingCannotBeMovedBeforeLoading");
            } else if (
                ["breaking", "resuming"].some((c) => c === movedActivity.category) &&
                filteredActivities.length !== 0
            ) {
                return t("transportDetails.breakCannotBeMovedHere");
            } else if (
                ["loading", "unloading"].some((v) => v === movedActivity.category) &&
                filteredActivities.findIndex(
                    (act) => act.category === "breaking" || act.category === "resuming"
                ) !== -1
            ) {
                return t("transportDetails.activityCannotBeMovedBeforeBreak");
            }
        }

        return null;
    };

    const getDraggingItemWarning = (
        index: number,
        draggingState?: {
            sourceIndex?: number;
            destinationIndex?: number;
        }
    ) => {
        if (
            draggingState?.sourceIndex != null &&
            draggingState?.destinationIndex != null &&
            index === draggingState.sourceIndex
        ) {
            return getDropPositionError(draggingState.sourceIndex, draggingState.destinationIndex);
        }
        return null;
    };

    let editingActivityIndexes = undefined;
    if (editingActivityIndex != null && activities[editingActivityIndex].fakeMerged) {
        editingActivityIndexes = [
            editingActivityIndex,
            ...activities[editingActivityIndex].similarUids.map((uid) =>
                activities.findIndex((a) => a.uid === uid)
            ),
        ];
    }

    return (
        <>
            <Flex justifyContent="space-between" alignItems="center" mt={4}>
                <Text variant="h1">{t("common.activities")}</Text>
                <Button variant="plain" onClick={() => setShowDistances(!isDistancesDisplayed)}>
                    {isDistancesDisplayed ? t("trip.hideDistances") : t("trip.showDistances")}
                </Button>
            </Flex>
            <ReorderEditableItemList
                items={activities}
                isItemHidden={(activity) => isItemCollapsed(activity) && !activity.fakeMerged}
                getItemContentToDisplay={getItemContentToDisplay}
                getItemContentUnder={getItemContentUnder}
                getItemWarning={getDraggingItemWarning}
                getItemDataTestId={(activity: SimilarActivityWithTransportData) =>
                    "trip-activity-editable-item-" + activities.indexOf(activity)
                }
                getDraggableItemId={(activity) => activity.uid}
                droppableId={`activities`}
                onBeforeDragStart={onBeforeDragStart}
                onReorderItems={reorderActivities}
                getDropPositionError={getDropPositionError}
                editingIndex={editingActivityIndex}
                editingIndexes={editingActivityIndexes}
                onClickItem={editActivity}
                outsideDelete
                canDeleteItem={canDeleteActivity}
                onDeleteItem={setActivityToDelete}
                addingItemPlaceholderLabel={t("trip.addActivity")}
                isItemDraggable={(activity: SimilarActivityWithTransportData) =>
                    !isSubcontracted &&
                    !readOnly &&
                    activity.category !== "trip_start" &&
                    activity.category !== "trip_end"
                }
            />
            {canAddActivity && <TripAddActivity tripUid={tripUid} />}
            {activityToDelete && (
                <DeleteActivityFromTripModal
                    tripUid={tripUid}
                    activities={activities}
                    activityToDelete={activityToDelete}
                    onClose={() => setActivityToDelete(null)}
                    onDelete={() => {
                        setEditingActivityIndex(null);
                    }}
                />
            )}
        </>
    );
};

function isActivityRelatedTo(
    activity: SimilarActivityWithTransportData,
    movedActivity: SimilarActivityWithTransportData,
    transportUids: string[]
) {
    return (
        !activity.fakeMerged &&
        activity.transports.length > 0 &&
        transportUids.includes(activity.transports[0].uid) &&
        (["breaking", "resuming"].includes(movedActivity.category as string) ||
            ["breaking", "resuming"].includes(activity.category as string) ||
            intersectionBy(movedActivity.deliveries_from, activity.deliveries_to, "uid").length >
                0 ||
            intersectionBy(movedActivity.deliveries_to, activity.deliveries_from, "uid").length >
                0)
    );
}
