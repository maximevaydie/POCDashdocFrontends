import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
    useSelector,
    useTimezone,
    useToday,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {DropEvent, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {useCallback, useEffect, useState} from "react";
import {useDragDropManager} from "react-dnd";
import {useDispatch} from "react-redux";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {
    canMove,
    getPayload,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/dndTripScheduler.service";
import {FormattedDropResult} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {CompactTrip} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {
    addToPlannedTrip,
    addToUnplannedTrip,
    fetchBulkAssignTripToTrailer,
    fetchBulkAssignTripToTrucker,
    fetchBulkAssignTripToVehicle,
    fetchSearchUnplannedTrips,
    removePlannedTrip,
    removeUnplannedTrip,
    updateTripMeansAndDate,
    fetchBulkAssignTripToTruckerAndTime,
    fetchBulkAssignTripToVehicleAndTime,
    fetchBulkAssignTripToTrailerAndTime,
} from "app/redux/actions/scheduler-trip";
import {fetchUnassignTrip} from "app/redux/actions/trips";

import {
    cleanPlannedFilterQuery,
    cleanUnplannedFilterQuery,
} from "../components/filters/filters.service";

export function useDragDrop(
    currentQuery: SchedulerFilters,
    startDate: Date,
    endDate: Date,
    fetchAndRedrawTripsInTimeSpan: () => Promise<void>,
    setSelectedUnplannedRows: (
        rows: Array<CompactTrip> | ((previousRows: Array<CompactTrip>) => Array<CompactTrip>)
    ) => void
) {
    const dispatch = useDispatch();
    const today = useToday();
    const timezone = useTimezone();
    const company = useSelector(getConnectedCompany);
    const isPlanningByTime = useSchedulerByTimeEnabled();

    const {
        pool_of_unplanned_transports_initial_ordering: basicTripsInitialOrdering,
        pool_of_unplanned_trips_initial_ordering: preparedTripsInitialOrdering,
    } = useSelector(getConnectedManager)!;

    const {extendedView} = useExtendedView();

    // Display and animation
    const [isOpenConfirmOrderModal, openConfirmOrderModal, closeConfirmOrderModal] =
        useToggle(false);

    // Dragging cards
    const [draggedTripUid, setDraggedTripUid] = useState<string | null>(null); // item from which dragging started

    const [processingTripUids, setProcessingTripUids] = useState<Array<string>>([]);
    const startProcessingTrip = useCallback((tripUid: string) => {
        setProcessingTripUids((prev) => [...prev, tripUid]);
    }, []);
    const endProcessingTrip = useCallback((tripUid: string) => {
        setProcessingTripUids((prev) => prev.filter((uid) => uid !== tripUid));
    }, []);

    const [draggedElementToValidateBeforeMove, setDraggedElementToValidateBeforeMove] =
        useState<FormattedDropResult | null>(null);

    const fetchBulkAssignToResource = useCallback(
        (
            tripUids: string[],
            newResource: string,
            newDay: Date | string,
            newIndex?: number,
            reorderOnly?: boolean
        ) => {
            let assignByTimeFunction;
            let assignFunction;
            if (currentQuery.view === "trucker") {
                assignByTimeFunction = fetchBulkAssignTripToTruckerAndTime;
                assignFunction = fetchBulkAssignTripToTrucker;
            } else if (currentQuery.view === "vehicle") {
                assignByTimeFunction = fetchBulkAssignTripToVehicleAndTime;
                assignFunction = fetchBulkAssignTripToVehicle;
            } else if (currentQuery.view === "trailer") {
                assignByTimeFunction = fetchBulkAssignTripToTrailerAndTime;
                assignFunction = fetchBulkAssignTripToTrailer;
            } else {
                throw new Error("Not implemented");
            }

            return isPlanningByTime
                ? assignByTimeFunction(tripUids, parseInt(newResource), newDay, extendedView)
                : assignFunction(
                      tripUids,
                      parseInt(newResource),
                      newDay,
                      newIndex,
                      reorderOnly,
                      extendedView
                  );
        },
        [currentQuery.view, extendedView, isPlanningByTime]
    );

    const onErrorRefresh = useCallback(() => {
        fetchAndRedrawTripsInTimeSpan();
        dispatch(
            fetchSearchUnplannedTrips(
                cleanUnplannedFilterQuery(
                    today,
                    currentQuery,
                    extendedView,
                    basicTripsInitialOrdering
                ),
                "basic",
                1
            )
        );
        dispatch(
            fetchSearchUnplannedTrips(
                cleanUnplannedFilterQuery(
                    today,
                    currentQuery,
                    extendedView,
                    preparedTripsInitialOrdering
                ),
                "prepared",
                1
            )
        );
    }, [
        fetchAndRedrawTripsInTimeSpan,
        dispatch,
        today,
        currentQuery,
        extendedView,
        basicTripsInitialOrdering,
        preparedTripsInitialOrdering,
    ]);

    const sendTripMovedAnalytics = useCallback(
        ({
            trip,
            oldResource,
            newResource,
            oldDay,
            newDay,
            oldIndex,
            newIndex,
        }: FormattedDropResult) => {
            let movementType;
            if (newResource === "unplanned") {
                movementType = "unplanned";
            } else if (oldResource === "unplanned") {
                movementType = "planned";
            } else if (newResource !== oldResource) {
                movementType = "reordered to other mean";
            } else if (newDay !== oldDay) {
                movementType = "reordered to other date";
            } else if (oldIndex !== newIndex) {
                movementType = "redordered into same cell";
            }
            if (movementType) {
                const activities = trip.activities;
                analyticsService.sendEvent(AnalyticsEvent.tripMovedInScheduler, {
                    "company id": company?.pk,
                    "movement type": movementType,
                    "trip uid": trip.uid,
                    "is prepared": trip.is_prepared,
                    "scheduler view": currentQuery.view,
                    "filtered by tags": currentQuery.tags__in
                        ? currentQuery.tags__in.length > 0
                        : false,
                    "extended view": extendedView,
                    "loading sites count":
                        activities.filter((activity) => activity.category === "loading").length ||
                        0,
                    "unloading sites count":
                        activities.filter((activity) => activity.category === "unloading")
                            .length || 0,
                    "break sites count":
                        activities.filter(
                            (activity) =>
                                activity.category &&
                                ["breaking", "resuming"].includes(activity.category)
                        ).length || 0,
                });
            }
        },
        [company?.pk, currentQuery, extendedView]
    );

    const needOrderConfirmationToBeMoved = (trip: CompactTrip): Boolean => {
        if (trip.is_prepared) {
            return false;
        }
        const transport = trip.activities.filter((a) => a.category !== "trip_start")[0]
            .transports[0];
        if (!transport) {
            return false;
        }
        return (
            (transport.global_status === "ordered" && transport.is_order) ||
            transport.requires_acceptance
        );
    };

    const updateTripMap = useCallback(
        (dropResult: FormattedDropResult) => {
            const {trip, newResource, oldResource, newDay, newIndex} = dropResult;
            const newMeans =
                newResource === "unplanned"
                    ? {[currentQuery.view as "trucker" | "vehicle" | "trailer"]: null}
                    : {
                          [currentQuery.view as "trucker" | "vehicle" | "trailer"]: {
                              pk: Number(newResource),
                          },
                      };
            dispatch(
                updateTripMeansAndDate(
                    trip,
                    newMeans as
                        | {trucker: {pk: number} | null}
                        | {vehicle: {pk: number} | null}
                        | {trailer: {pk: number} | null},
                    newDay,
                    newIndex,
                    isPlanningByTime,
                    timezone
                )
            );

            if (oldResource === "unplanned" && newResource !== "unplanned") {
                dispatch(
                    removeUnplannedTrip(
                        cleanUnplannedFilterQuery(
                            today,
                            currentQuery,
                            extendedView,
                            trip.is_prepared
                                ? preparedTripsInitialOrdering
                                : basicTripsInitialOrdering
                        ),
                        trip.is_prepared ? "prepared" : "basic",
                        trip.uid
                    )
                );
                dispatch(
                    addToPlannedTrip(
                        cleanPlannedFilterQuery(currentQuery, startDate, endDate, extendedView),
                        trip.uid
                    )
                );
            } else if (oldResource !== "unplanned" && newResource === "unplanned") {
                dispatch(
                    removePlannedTrip(
                        cleanPlannedFilterQuery(currentQuery, startDate, endDate, extendedView),
                        trip.uid
                    )
                );
                dispatch(
                    addToUnplannedTrip(
                        cleanUnplannedFilterQuery(
                            today,
                            currentQuery,
                            extendedView,
                            trip.is_prepared
                                ? preparedTripsInitialOrdering
                                : basicTripsInitialOrdering
                        ),
                        trip
                    )
                );
            }
        },
        [
            currentQuery,
            dispatch,
            isPlanningByTime,
            today,
            extendedView,
            preparedTripsInitialOrdering,
            basicTripsInitialOrdering,
            startDate,
            endDate,
        ]
    );

    const abortMove = useCallback(() => {
        const tripUid = draggedElementToValidateBeforeMove?.trip.uid;
        if (tripUid) {
            endProcessingTrip(tripUid);
        }
    }, [draggedElementToValidateBeforeMove?.trip.uid, endProcessingTrip]);

    const assignResourceAndDate = useCallback(
        (dropResult: FormattedDropResult) => {
            const {trip, newResource, newDay, oldResource, oldDay, oldIndex, newIndex} =
                dropResult;
            let index;
            if (!isPlanningByTime) {
                const movedIntoSameCell = oldResource === newResource && oldDay === newDay;
                let computedNewIndex = newIndex;
                if (movedIntoSameCell && oldIndex !== undefined && newIndex > oldIndex) {
                    computedNewIndex -= 1;
                }
                index = Math.max(0, computedNewIndex);
            }
            fetchBulkAssignToResource(
                [trip.uid],
                newResource,
                newDay ?? new Date(),
                index,
                isPlanningByTime ? undefined : newResource === oldResource && oldDay === newDay
            )(dispatch)
                // eslint-disable-next-line github/no-then
                .then((response: any) => {
                    if (
                        company?.settings?.carrier_inferred_from_trucker &&
                        response?.status === 204
                    ) {
                        /**
                         * The response status notifies that this trip can't be fetch anymore.
                         * The carrier_inferred_from_trucker setting explains why :
                         * the carrier trip has been updated to the trucker's renter.
                         */
                        toast.success(t("scheduler.carrierInferredFromTrucker"));
                        onErrorRefresh();
                    }
                })
                // eslint-disable-next-line github/no-then
                .catch(onErrorRefresh)
                .finally(() => endProcessingTrip(trip.uid));
        },
        [
            company?.settings?.carrier_inferred_from_trucker,
            dispatch,
            fetchBulkAssignToResource,
            isPlanningByTime,
            onErrorRefresh,
            endProcessingTrip,
        ]
    );

    const finishDrop = useCallback(
        async (dropResult: FormattedDropResult | null) => {
            if (!dropResult) {
                return;
            }
            const {trip, newResource} = dropResult;

            // Move trip locally (to get visual feedback directly)
            updateTripMap(dropResult);
            // Call API to save trip move
            if (newResource === "unplanned") {
                fetchUnassignTrip(
                    trip.uid,
                    extendedView
                )(dispatch)
                    // eslint-disable-next-line github/no-then
                    .catch(onErrorRefresh)
                    .finally(() => endProcessingTrip(trip.uid));
            } else {
                assignResourceAndDate(dropResult);
            }

            // Analytics
            sendTripMovedAnalytics(dropResult);
        },
        [
            updateTripMap,
            sendTripMovedAnalytics,
            extendedView,
            dispatch,
            onErrorRefresh,
            assignResourceAndDate,
            endProcessingTrip,
        ]
    );

    const confirmOrder = useCallback(async () => {
        closeConfirmOrderModal();
        await finishDrop(draggedElementToValidateBeforeMove);
    }, [finishDrop, draggedElementToValidateBeforeMove, closeConfirmOrderModal]);

    const onCloseConfirmOrderModal = useCallback(async () => {
        abortMove();
        closeConfirmOrderModal();
    }, [abortMove, closeConfirmOrderModal]);

    /**
     * useEffect
     **/

    const dragDropManager = useDragDropManager();

    useEffect(() => {
        const monitor = dragDropManager.getMonitor();
        const unsubscribe = monitor.subscribeToStateChange(() => {
            if (monitor.isDragging()) {
                const uid = monitor.getItem().id;
                setDraggedTripUid(uid);
            } else {
                setDraggedTripUid(null);
            }
        });
        return unsubscribe;
    }, [dragDropManager]);

    const onDropToTable = useCallback(
        (dropEvent: DropEvent) => {
            const {entity, source, target} = dropEvent;
            if (source.kind === "scheduler" && target.kind === "table") {
                const sourcePayload = getPayload(source);
                const targetPayload = getPayload(target);
                const trip = entity as CompactTrip;
                const canMoveResult = canMove(trip, sourcePayload, targetPayload);
                if (canMoveResult.result) {
                    const {resourceUid: oldResource, day: oldDay, index: oldIndex} = sourcePayload;
                    const {resourceUid: newResource, day: newDay, index: newIndex} = targetPayload;

                    const drag: FormattedDropResult = {
                        trip,
                        newResource,
                        newDay,
                        oldResource,
                        oldDay,
                        oldIndex,
                        newIndex,
                    };
                    startProcessingTrip(trip.uid);
                    finishDrop(drag);
                } else {
                    toast.error(canMoveResult.message);
                }
            } else {
                Logger.error("Unknown drop action in onDropToTable");
            }
        },
        [finishDrop, startProcessingTrip]
    );

    const onDropToScheduler = useCallback(
        (dropEvent: DropEvent) => {
            const {entity, source, target} = dropEvent;
            if (
                (source.kind === "table" || source.kind === "scheduler") &&
                target.kind === "scheduler"
            ) {
                const sourcePayload = getPayload(source);
                const targetPayload = getPayload(target);
                const trip = entity as CompactTrip;
                const {resourceUid: oldResource, day: oldDay, index: oldIndex} = sourcePayload;
                const {resourceUid: newResource, day: newDay, index: newIndex} = targetPayload;
                let drag: FormattedDropResult = {
                    trip,
                    newResource,
                    newDay,
                    oldResource,
                    oldDay,
                    oldIndex,
                    newIndex,
                };
                const canMoveResult = canMove(trip, sourcePayload, targetPayload);
                if (canMoveResult.result) {
                    if (source.kind === "table") {
                        // unselect moved element (if not multi dnd but move only one element from unplanned pool)
                        setSelectedUnplannedRows((previousSelectedRows) => {
                            return previousSelectedRows.filter((row) => row.uid !== trip.uid);
                        });
                        if (needOrderConfirmationToBeMoved(trip)) {
                            openConfirmOrderModal();
                            setDraggedElementToValidateBeforeMove(drag);
                            return;
                        }
                    }
                    startProcessingTrip(trip.uid);
                    finishDrop(drag);
                } else {
                    toast.error(canMoveResult.message);
                }
            } else {
                Logger.error("Unknown drop action in onDropToScheduler");
            }
        },
        [setSelectedUnplannedRows, finishDrop, openConfirmOrderModal, startProcessingTrip]
    );

    return {
        isOpenConfirmOrderModal,
        draggedTripUid,
        closeConfirmOrderModal: onCloseConfirmOrderModal,
        confirmOrder,
        onDropToTable,
        onDropToScheduler,
        processingTripUids,
    };
}
