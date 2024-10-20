import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {Box} from "@dashdoc/web-ui";
import {companyIsQualimat} from "dashdoc-utils";
import React from "react";
import {Draggable} from "react-beautiful-dnd";
import {useSelector} from "react-redux";

import {transportRightService} from "app/services/transport";
import {activityService} from "app/services/transport/activity.service";

import {Activity} from "./activity/activity";
import {AddActivityButton} from "./add-activity-buttons/AddActivityButton";

import type {Transport, Activity as ActivityData} from "app/types/transport";

export type ActivityAllowedActions = {
    breaksAllowed: boolean;
    addingLoadingActivityAllowed: boolean;
    addingUnloadingActivityAllowed: boolean;
    deletingLoadingActivityAllowed: boolean;
    deletingUnloadingActivityAllowed: boolean;
    updatesAllowed: boolean;
    meansUpdatesAllowed: boolean;
};
type ActivityAndAddNButtonWrapperProps = {
    activity: ActivityData;
    activityIndexInMeans: number;
    followingTripActivities: ActivityData[];
    transport: Transport;
    isDragDisabled?: boolean;
    isLastActivity: boolean;
    isFirstActivityDone: boolean;
    nextResumeIsDone?: boolean;
    allowedActions: ActivityAllowedActions & {transportAmendmentAllowed: boolean};
    onMarkActivityDone: (activity: Partial<ActivityData>) => void;
    onClickOnActivityDistance: () => void;
};
export function ActivityAndAddButtonWrapper({
    activity,
    activityIndexInMeans,
    followingTripActivities,
    isLastActivity,
    transport,
    isDragDisabled,
    allowedActions,
    nextResumeIsDone,
    isFirstActivityDone,
    onMarkActivityDone,
    onClickOnActivityDistance,
}: ActivityAndAddNButtonWrapperProps) {
    const company = useSelector(getConnectedCompany);
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    const doQualimat = companyIsQualimat(company);
    const {
        breaksAllowed,
        addingLoadingActivityAllowed,
        addingUnloadingActivityAllowed,
        deletingLoadingActivityAllowed,
        deletingUnloadingActivityAllowed,
        updatesAllowed,
        transportAmendmentAllowed,
    } = allowedActions;
    const isFirstActivity = activity.index === 0;
    const isLastActivityOfBlock = followingTripActivities.length === 0;

    const isStarted = activityService.isActivityStarted(activity);
    const isComplete = activityService.isActivityComplete(activity);

    const isNextActivityStarted =
        followingTripActivities.length > 0 &&
        activityService.isActivityStarted(followingTripActivities[0]);
    const isFollowingActivitiesStarted = followingTripActivities.some((a) =>
        activityService.isActivityStarted(a)
    );

    const canAddBreakAfterThisActivity =
        breaksAllowed && !isLastActivity && !isFollowingActivitiesStarted && !nextResumeIsDone;

    const canAddLoadingActivityAfterThisActivity =
        addingLoadingActivityAllowed && !isLastActivity && !isNextActivityStarted;

    const canAddUnloadingActivityAfterThisActivity =
        addingUnloadingActivityAllowed && !isNextActivityStarted;
    const canAddDelivery = transportRightService.canAddDelivery(
        transport,
        company?.pk,
        hasInvoiceEntityEnabled
    );

    const canUpdateActivity = updatesAllowed && (!isComplete || transportAmendmentAllowed);

    const canUpdatePlannedLoads =
        !isComplete &&
        updatesAllowed &&
        !(
            activity.type === "unloading" &&
            (transport.shape === "grouping" || isFirstActivityDone)
        ) &&
        !["done", "invoiced", "verified", "cancelled", "paid"].includes(transport.status);

    return (
        <Draggable
            key={activity.site.uid}
            draggableId={`${activity.site.uid}`}
            index={activityIndexInMeans}
            isDragDisabled={isDragDisabled}
        >
            {(provided, snapshot) => (
                <Box ref={provided.innerRef} {...provided.draggableProps}>
                    <Activity
                        isFirstActivity={isFirstActivity}
                        isLastActivity={isLastActivity}
                        isLastActivityOfBlock={isLastActivityOfBlock}
                        activity={activity}
                        transport={transport}
                        isQualimat={doQualimat}
                        updatesAllowed={canUpdateActivity}
                        plannedLoadsUpdatesAllowed={canUpdatePlannedLoads}
                        realLoadsUpdatesAllowed={isComplete && transportAmendmentAllowed}
                        onMarkActivityDone={onMarkActivityDone}
                        canBeDeleted={
                            !isStarted &&
                            !activity.isCancelled &&
                            !(activity.type === "loading" && !deletingLoadingActivityAllowed) &&
                            !(activity.type === "unloading" && !deletingUnloadingActivityAllowed)
                        }
                        onDistanceClick={onClickOnActivityDistance}
                        dragHandleProps={provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                    />

                    {(canAddBreakAfterThisActivity ||
                        canAddLoadingActivityAfterThisActivity ||
                        canAddUnloadingActivityAfterThisActivity ||
                        canAddDelivery) &&
                        !snapshot.isDragging && (
                            <>
                                <AddActivityButton
                                    transport={transport}
                                    // @ts-ignore
                                    segmentToBreak={activity.nextSegment}
                                    siteBeforeWhichToInsertNewActivity={
                                        activity.nextSegment?.destination ?? null
                                    }
                                    canAddBreak={canAddBreakAfterThisActivity}
                                    canAddLoadingActivity={canAddLoadingActivityAfterThisActivity}
                                    canAddUnloadingActivity={
                                        canAddUnloadingActivityAfterThisActivity
                                    }
                                />
                                {isLastActivityOfBlock && !isLastActivity && (
                                    <Box
                                        borderRight="2px solid"
                                        borderColor="grey.light"
                                        width={0}
                                        pt={5}
                                        pl={4}
                                        ml="-1px"
                                    />
                                )}
                            </>
                        )}
                </Box>
            )}
        </Draggable>
    );
}
