import {
    ErrorBoundary,
    getConnectedCompany,
    getConnectedManager,
    managerService,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, LoadingWheel} from "@dashdoc/web-ui";
import {Pricing, useToggle} from "dashdoc-utils";
import React, {useMemo, useState} from "react";
import {DragDropContext, DropResult, Droppable} from "react-beautiful-dnd";
import {toast} from "react-toastify";

import {MeansCard} from "app/features/transport/transport-details/transport-details-activities/means/means-card/MeansCard";
import {SplitMeansTurnoverModalOpen} from "app/features/transport/transport-details/transport-details-activities/split-means-turnover/SplitMeansTurnoverModal";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {fetchRetrieveTransport, fetchUpdateTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {pricingService} from "app/services/invoicing";
import {isTransportRental, transportRightService} from "app/services/transport";

import {MarkActivityDoneModal} from "./activity/actions/mark-activity-done-modal";
import {
    ActivityAllowedActions,
    ActivityAndAddButtonWrapper,
} from "./activity-and-add-button-wrapper";
import {AddActivityButton} from "./add-activity-buttons/AddActivityButton";
import {SelectRequestedVehicleModal} from "./SelectRequestedVehicleModal";
import {UpdateRequestedVehicle} from "./updatable-requested-vehicle";

import type {
    Activity,
    ActivityMeans,
    Segment,
    Site,
    Transport,
    TransportStatus,
} from "app/types/transport";

type ActivityMetaData = {
    breakSite: Site;
    breakIsDone: boolean;
    resumeIsDone: boolean;
    segmentToBreakSite: Segment;
    segmentFromBreakSite: Segment;
    firstActivityOfBlock: Activity;
    firstBreakableSegmentOfBlock: Segment;
    firstSiteOfBlock: Site;
    isFirstActivityOfBlockStarted: boolean;
};
type ActivityListByMeansProps = {
    means: ActivityMeans;
    meansIndex: number;
    pricing: Pricing | null;
    activities: Activity[];
    nextActivity: Activity | null;
    isLastMeansGroup: boolean;
    metaData: ActivityMetaData;
    nextResumeIsDone?: boolean;
    allowedActions: ActivityAllowedActions;
    transport: Transport;
    isFirstActivityDone: boolean;
    reversedTransportStatusUpdates: Array<TransportStatus>;
    onClickOnActivityDistance: () => void;
    isTheOnlyTransportMean?: boolean | undefined;
};

export function ActivityListByMeans({
    means,
    pricing,
    meansIndex,
    activities,
    nextActivity,
    isLastMeansGroup,
    metaData,
    nextResumeIsDone,
    allowedActions,
    transport,
    isFirstActivityDone,
    reversedTransportStatusUpdates,
    onClickOnActivityDistance,
    isTheOnlyTransportMean,
}: ActivityListByMeansProps) {
    const dispatch = useDispatch();
    const transportListRefresher = useRefreshTransportLists();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const {isPrivateViewer, isCarrierGroup, isCreator, isCarrier, isShipper, isReadOnly} =
        useTransportViewer(transport);
    const [markActivityDoneModalOpen, setMarkActivityDoneModalOpen] =
        useState<Partial<Activity> | null>(null);
    const [isReorderLoading, setReorderLoading] = useState(false);
    const {
        breakSite,
        breakIsDone,
        resumeIsDone,
        segmentToBreakSite,
        segmentFromBreakSite,
        firstActivityOfBlock,
        firstBreakableSegmentOfBlock,
        firstSiteOfBlock,
        isFirstActivityOfBlockStarted,
    } = metaData;

    const {
        breaksAllowed,
        addingLoadingActivityAllowed,
        addingUnloadingActivityAllowed,
        meansUpdatesAllowed,
    } = allowedActions;

    const [requestedVehicleModalOpen, openRequestedVehicleModal, closeRequestedVehicleModal] =
        useToggle(false);
    const company = useSelector(getConnectedCompany);
    const manager = useSelector(getConnectedManager);
    const isStaff = managerService.isDashdocStaff(manager);
    const [splitMeanTurnoverModalOpen, openSplitMeanTurnoverModal, closeSplitMeanTurnoverModal] =
        useToggle(false);

    const transportAmendmentAllowed = transportRightService.canAmendTransport(
        transport,
        company?.pk,
        means
    );

    const assignedStatus = means.trucker?.user
        ? reversedTransportStatusUpdates.find(
              ({category, target, segment}) =>
                  category === "assigned" &&
                  target?.pk === means.trucker?.user &&
                  segment &&
                  activities[0]?.segment?.uid === segment
          )
        : null;
    const sentStatus = assignedStatus
        ? reversedTransportStatusUpdates.find(
              ({category, target, segment}) =>
                  category === "sent_to_trucker" &&
                  target?.pk === means.trucker?.user &&
                  segment &&
                  activities[0]?.segment?.uid === segment
          )
        : null;
    const acknowledgedStatus = assignedStatus
        ? reversedTransportStatusUpdates.find(
              ({category, author, segment}) =>
                  category === "acknowledged" &&
                  author?.pk === means.trucker?.user &&
                  segment &&
                  activities[0]?.segment?.uid === segment
          )
        : null;
    const assignedToTrucker = !!assignedStatus;

    const sentToTrucker =
        assignedToTrucker &&
        !!sentStatus &&
        (sentStatus.created_device || sentStatus.created) >=
            (assignedStatus.created_device || assignedStatus.created);
    const acknowledgedByTrucker =
        assignedToTrucker &&
        !!acknowledgedStatus &&
        (acknowledgedStatus.created_device || acknowledgedStatus.created) >=
            (assignedStatus.created_device || assignedStatus.created);

    const canAddLoadingActivityAsFirstActivityOfBlock =
        addingLoadingActivityAllowed && !isFirstActivityOfBlockStarted;

    const firstMean = meansIndex <= 0;

    const canAddUnloadingActivityAsFirstActivityOfBlock =
        addingUnloadingActivityAllowed && !firstMean && !isFirstActivityOfBlockStarted;
    const canAddDelivery = transportRightService.canAddDelivery(
        transport,
        company?.pk,
        hasInvoiceEntityEnabled
    );
    const canAddBreakBeforeFirstActivityOfBlock =
        breaksAllowed &&
        breakSite &&
        !isFirstActivityOfBlockStarted &&
        !nextResumeIsDone &&
        !activities[0]?.site?.trip?.is_prepared;

    const canUpdateRequestedVehicle = !isReadOnly && (isCreator || isShipper);

    const segmentsBeforeBreak = useMemo(
        () =>
            segmentFromBreakSite
                ? transport.segments
                      .slice(
                          0,
                          transport.segments.findIndex((s) => s.uid === segmentFromBreakSite.uid)
                      )
                      .map((s) => ({
                          uid: s.uid,
                          origin: {uid: s.origin.uid},
                          destination: {uid: s.destination.uid},
                      }))
                : [],
        [segmentFromBreakSite, transport.segments]
    );

    const segmentToNextBreakSite = useMemo(
        () =>
            nextActivity
                ? transport.segments[
                      transport.segments.findIndex(
                          (s) => s.destination.uid === nextActivity.site.uid
                      ) - 1
                  ]
                : null,
        [nextActivity, transport.segments]
    );

    const segmentsAfterBreak = useMemo(() => {
        return segmentToNextBreakSite
            ? transport.segments
                  .slice(
                      transport.segments.findIndex((s) => s.uid === segmentToNextBreakSite.uid) + 1
                  )
                  .map((s) => ({
                      uid: s.uid,
                      origin: {uid: s.origin.uid},
                      destination: {uid: s.destination.uid},
                  }))
            : [];
    }, [segmentToNextBreakSite, transport.segments]);

    const getScheduledDatesConsistentWithMovedActivity = (dropToIndex: number) => {
        // @ts-ignore
        const scheduledDates: Array<{start: string; end: string}> = activities.map((activity) => {
            return (
                transport.segments.find((segment) => segment.origin.uid === activity.site.uid)
                    ?.scheduled_start_range ||
                transport.segments.find((segment) => segment.destination.uid === activity.site.uid)
                    ?.scheduled_end_range
            );
        });
        const movedScheduledDate = scheduledDates[dropToIndex];
        if (movedScheduledDate) {
            const inconsistentBeforeDate = scheduledDates
                .slice(0, dropToIndex)
                .reverse()
                .find((date) => date && date.start > movedScheduledDate.end);
            if (inconsistentBeforeDate) {
                scheduledDates[dropToIndex] = inconsistentBeforeDate;
            }
            if (dropToIndex < scheduledDates.length) {
                const inconsistentAfterDate = scheduledDates
                    .slice(dropToIndex + 1)
                    .find((date) => date && date.end < movedScheduledDate.start);
                if (inconsistentAfterDate) {
                    scheduledDates[dropToIndex] = inconsistentAfterDate;
                }
            }
        }
        return scheduledDates;
    };

    const getSegmentsFromActivities = (
        dropToIndex: number
    ): Array<
        Partial<Omit<Segment, "origin" | "destination">> & {
            origin: {uid: string};
            destination: {uid: string};
        }
    > => {
        // compute segment between breaks
        const segments: Array<
            Partial<Omit<Segment, "origin" | "destination">> & {
                origin: {uid: string};
                destination: {uid: string};
            }
        > = [];
        const scheduledDates = getScheduledDatesConsistentWithMovedActivity(dropToIndex);
        activities.map((activity, index) => {
            if (index < activities.length - 1) {
                const originUid = activity.site.uid;
                const destinationUid = activities[index + 1].site.uid;

                segments.push({
                    uid: transport.segments[
                        segmentsBeforeBreak.length > 0
                            ? segmentsBeforeBreak.length + 1 + index
                            : index
                    ].uid,
                    origin: {uid: originUid},
                    destination: {uid: destinationUid},
                    scheduled_start_range: scheduledDates[index],
                    scheduled_end_range: scheduledDates[index + 1],
                });
            }
        });

        // compute segments linked to breaks
        if (segmentFromBreakSite) {
            const updatedSegmentFromBreakSite = {
                uid: segmentFromBreakSite.uid,
                origin: {uid: segmentFromBreakSite.origin.uid},
                destination: {uid: segments[0].origin.uid},
                scheduled_start_range: segmentFromBreakSite.scheduled_start_range ?? undefined,
                scheduled_end_range: segments[0].scheduled_start_range ?? undefined,
            };
            segments.unshift(updatedSegmentFromBreakSite);
        }

        if (segmentToNextBreakSite) {
            const updatedSegmentToBreakSite = {
                uid: segmentToNextBreakSite.uid,
                origin: {uid: segments[segments.length - 1].destination.uid},
                destination: {uid: segmentToNextBreakSite.destination.uid},
                scheduled_start_range:
                    segments[segments.length - 1].scheduled_end_range ?? undefined,
                scheduled_end_range: segmentToNextBreakSite.scheduled_end_range ?? undefined,
            };
            segments.push(updatedSegmentToBreakSite);
        }
        return [...segmentsBeforeBreak, ...segments, ...segmentsAfterBreak];
    };

    const canMoveActivityToIndex = (
        movedActivity: Activity,
        dropFromIndex: number,
        dropToIndex: number
    ): boolean => {
        const filteredActivities = [...activities];
        filteredActivities.splice(dropFromIndex, 1);
        if (
            movedActivity.type === "unloading" &&
            filteredActivities
                .slice(dropToIndex)
                .findIndex((activity) =>
                    movedActivity.deliveries.find(
                        (delivery) => delivery.origin.uid === activity.site.uid
                    )
                ) >= 0
        ) {
            toast.error(t("transportDetails.unloadingCannotBeMovedBeforeLoading"));
            return false;
        }
        if (
            movedActivity.type === "loading" &&
            filteredActivities
                .slice(0, dropToIndex)
                .findIndex((activity) =>
                    movedActivity.deliveries.find(
                        (delivery) => delivery.destination.uid === activity.site.uid
                    )
                ) >= 0
        ) {
            toast.error(t("transportDetails.loadingCannotBeMovedAfterUnloading"));
            return false;
        }
        return true;
    };

    const moveActivity = async (dropResult: DropResult) => {
        // drop cancel or put back in same place
        if (!dropResult.destination || dropResult.destination.index === dropResult.source.index) {
            return;
        }
        const movedActivity = activities[dropResult.source.index];

        // prevent from moving loading activity after unloading activity and vice versa
        if (
            !canMoveActivityToIndex(
                movedActivity,
                dropResult.source.index,
                dropResult.destination.index
            )
        ) {
            return;
        }
        // update activities list order
        activities.splice(dropResult.source.index, 1);
        activities.splice(dropResult.destination.index, 0, movedActivity);
        // compute new segments of all transport form new activity order
        setReorderLoading(true);
        try {
            await dispatch(
                fetchUpdateTransport(
                    {
                        segments: getSegmentsFromActivities(
                            dropResult.destination.index
                        ) as Array<Segment>,
                    },
                    transport.uid
                )
            );
            setReorderLoading(false);
        } catch (e) {
            setReorderLoading(false);
            dispatch(fetchRetrieveTransport(transport.uid));
        }
    };

    const priceWithoutPurchaseCosts = useMemo(() => {
        return pricingService.computePriceWithoutPurchaseCosts(pricing, transport.purchase_costs);
    }, [pricing?.final_price_with_gas_indexed, transport.purchase_costs?.total_without_tax]);

    return (
        <>
            <Flex alignItems="stretch" style={{gap: "8px"}}>
                {(isPrivateViewer || isCarrierGroup || isStaff) && (
                    <>
                        <ErrorBoundary>
                            <MeansCard
                                means={means}
                                activities={activities}
                                transport={transport}
                                pricing={pricing}
                                meansUpdatesAllowed={
                                    meansUpdatesAllowed &&
                                    (!isFirstActivityOfBlockStarted || transportAmendmentAllowed)
                                }
                                addressUpdatesAllowed={
                                    meansUpdatesAllowed &&
                                    (!isFirstActivityOfBlockStarted || transportAmendmentAllowed)
                                }
                                assignedToTrucker={assignedToTrucker}
                                sentToTrucker={sentToTrucker}
                                acknowledgedByTrucker={acknowledgedByTrucker}
                                breakSite={breakSite}
                                breakIsDone={breakIsDone}
                                resumeIsDone={resumeIsDone}
                                segmentToUpdate={
                                    firstActivityOfBlock?.segment || segmentFromBreakSite
                                }
                                segmentToBreakSite={segmentToBreakSite}
                                segmentFromBreakSite={segmentFromBreakSite}
                                isTheOnlyTransportMean={isTheOnlyTransportMean}
                                onMarkBreakDone={setMarkActivityDoneModalOpen}
                                onSplitMeansTurnover={openSplitMeanTurnoverModal}
                            />
                        </ErrorBoundary>
                    </>
                )}
                {firstMean && (
                    <UpdateRequestedVehicle
                        updateAllowed={canUpdateRequestedVehicle}
                        onClick={openRequestedVehicleModal}
                        requested_vehicle={transport.requested_vehicle}
                    />
                )}
            </Flex>
            {(canAddBreakBeforeFirstActivityOfBlock ||
                canAddLoadingActivityAsFirstActivityOfBlock ||
                canAddUnloadingActivityAsFirstActivityOfBlock ||
                canAddDelivery) && (
                <>
                    <Box
                        borderRight="2px solid"
                        borderColor="grey.light"
                        width={0}
                        pt={5}
                        pl={4}
                        ml="-1px"
                    />
                    <AddActivityButton
                        transport={transport}
                        segmentToBreak={firstBreakableSegmentOfBlock}
                        siteBeforeWhichToInsertNewActivity={firstSiteOfBlock}
                        canAddBreak={canAddBreakBeforeFirstActivityOfBlock}
                        canAddLoadingActivity={canAddLoadingActivityAsFirstActivityOfBlock}
                        canAddUnloadingActivity={canAddUnloadingActivityAsFirstActivityOfBlock}
                    />
                </>
            )}
            {activities.length > 0 ? (
                <DragDropContext onDragEnd={moveActivity}>
                    <Droppable droppableId={"activities-" + meansIndex}>
                        {(provided, snapshot) => (
                            <Box
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                position="relative"
                                bg={snapshot.isDraggingOver ? "grey.light" : undefined}
                            >
                                {activities.map((activity, activityIndex) => (
                                    <ActivityAndAddButtonWrapper
                                        key={activityIndex}
                                        activity={activity}
                                        activityIndexInMeans={activityIndex}
                                        followingTripActivities={activities.filter(
                                            (a) => activities.indexOf(a) > activityIndex
                                        )}
                                        isLastActivity={
                                            isLastMeansGroup &&
                                            activityIndex === activities.length - 1
                                        }
                                        transport={transport}
                                        isDragDisabled={
                                            activities.length <= 1 ||
                                            activity.status !== "not_started" ||
                                            activity.site?.trip?.is_prepared
                                        }
                                        allowedActions={{
                                            ...allowedActions,
                                            transportAmendmentAllowed,
                                        }}
                                        nextResumeIsDone={nextResumeIsDone}
                                        isFirstActivityDone={isFirstActivityDone}
                                        onMarkActivityDone={setMarkActivityDoneModalOpen}
                                        onClickOnActivityDistance={onClickOnActivityDistance}
                                    />
                                ))}
                                {isReorderLoading && (
                                    <Flex
                                        bg="grey.white"
                                        style={{opacity: 0.5}}
                                        position="absolute"
                                        top={0}
                                        bottom={0}
                                        right={0}
                                        left={0}
                                        zIndex="level1"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <LoadingWheel />
                                    </Flex>
                                )}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <Box
                    borderRight="2px solid"
                    borderColor="grey.light"
                    width={0}
                    pt={5}
                    pl={4}
                    ml="-1px"
                />
            )}
            {markActivityDoneModalOpen && (
                <MarkActivityDoneModal
                    onClose={() => {
                        setMarkActivityDoneModalOpen(null);
                        dispatch(fetchRetrieveTransport(transport.uid));
                        transportListRefresher();
                    }}
                    isOnlyCreator={isCreator && !isCarrier}
                    activity={markActivityDoneModalOpen as Activity}
                    resumeIsDone={resumeIsDone}
                />
            )}
            {requestedVehicleModalOpen && (
                <SelectRequestedVehicleModal
                    transportUid={transport.uid}
                    isModifyingFinalInfo={
                        transport.status == "done" && isTransportRental(transport) // requested vehicle is only displayed on rental pdf
                    }
                    requestedVehicle={transport.requested_vehicle}
                    onClose={closeRequestedVehicleModal}
                />
            )}
            {splitMeanTurnoverModalOpen && transport.split_turnover && (
                <SplitMeansTurnoverModalOpen
                    transportUid={transport.uid}
                    splitTurnover={transport.split_turnover}
                    priceWithoutPurchaseCosts={priceWithoutPurchaseCosts}
                    onClose={closeSplitMeanTurnoverModal}
                    openDistanceModal={onClickOnActivityDistance}
                />
            )}
        </>
    );
}
