import {AnalyticsEvent, analyticsService, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Droppable,
    Flex,
    Icon,
    DndSchedulerPayload,
    DropEvent,
    Text,
    theme,
    toast,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {CSSProperties, FunctionComponent, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {PlanningSimulationModal} from "app/features/optimization/planning-simulation-modal/PlanningSimulationModal";
import {TruckerIndicators} from "app/features/optimization/planning-simulation.types";
import {CompactTrip} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {usePlanningSimulation} from "app/hooks/usePlanningSimulation";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {
    fetchBulkAssignTripToTrucker,
    fetchBulkAssignTripToTruckerAndTime,
} from "app/redux/actions/scheduler-trip";

const targetPayload: DndSchedulerPayload = {
    resourceUid: "planning-simulation",
    day: null,
    index: 0,
};

const planningSimulationStyleProvider = (_isDragging: boolean, isOver: boolean): CSSProperties => {
    return {
        backgroundColor: isOver ? theme.colors.blue.light : theme.colors.grey.light,
        top: `0px`,
    };
};

const PlanningSimulationDropLayer = (trip: CompactTrip | undefined) => {
    return (
        <Flex
            border="1px dashed"
            borderColor="grey.dark"
            p={5}
            height="100%"
            flexGrow={1}
            borderRadius={1}
            alignItems="center"
        >
            <Icon name="robot" color="grey.dark" size={40} mr={5} />
            <Box>
                <Flex>
                    <Text variant="h1">{t("optimization.planningSimulation")}</Text>
                    <Text color="grey.dark" ml={5}>
                        {t("optimization.drop", {
                            transport: t(
                                trip?.is_prepared ? "common.trips" : "common.transports",
                                {
                                    smart_count: 1,
                                }
                            ),
                        })}
                    </Text>
                </Flex>
                <Text>
                    {t("optimization.dashdocSimulatesChooseBestOption", {
                        transport: t(trip?.is_prepared ? "common.trips" : "common.transports", {
                            smart_count: 1,
                        }),
                    })}
                </Text>
            </Box>
        </Flex>
    );
};

export const PlanningSimulationDroppable: FunctionComponent = () => {
    const canUsePlanningSimulation = usePlanningSimulation();
    const dispatch = useDispatch();
    const company = useSelector(getConnectedCompany);
    const {extendedView} = useExtendedView();

    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();

    const [
        isPlanningSimulationModalOpen,
        openPlanningSimulationModal,
        closePlanningSimulationModal,
    ] = useToggle();
    const [planningSimulationTrip, setPlanningSimulationTrip] = useState<null | CompactTrip>(null);
    const [chooseTruckerDisabled, setChooseTruckerDisabled] = useState(false);

    if (!canUsePlanningSimulation) {
        return null;
    }

    const onDropToPlanningSimulation = (drop: DropEvent) => {
        const trip = drop.entity as CompactTrip;
        if (trip.status === "done") {
            toast.error(t("scheduler.moveTripDone"));
        } else if (trip.status === "ongoing") {
            toast.error(t("scheduler.moveTripOnGoing"));
        } else {
            setPlanningSimulationTrip(trip);
            openPlanningSimulationModal();
        }
    };

    const sendTripMovedFromSimulationAnalyticsEvent = () => {
        if (planningSimulationTrip === null) {
            return;
        }

        const activities = planningSimulationTrip.activities;

        analyticsService.sendEvent(AnalyticsEvent.tripMovedInScheduler, {
            "company id": company?.pk,
            "movement type": !planningSimulationTrip.trucker
                ? "planned"
                : "reordered to other mean", // in case of a planned trip we know it is "reordered to other mean" since the trip trucker is excluded from the simulation
            "trip uid": planningSimulationTrip.uid,
            "is prepared": planningSimulationTrip.is_prepared,
            "scheduler view": "trucker", // because PlanningSimulationModal is only displayed in trucker view (see PlanningSimulationDroppable)
            "extended view": extendedView,
            "loading sites count":
                activities.filter((activity) => {
                    activity.category === "loading";
                }).length || 0,
            "unloading sites count":
                activities.filter((activity) => {
                    activity.category === "unloading";
                }).length || 0,
            "break sites count":
                activities.filter((activity) => {
                    activity.category && ["breaking", "resuming"].includes(activity.category);
                }).length || 0,
            "from simulation": true,
        });
    };

    const onChooseTruckerClick = async (
        truckerId: string,
        truckerIndicators: TruckerIndicators,
        date: Date
    ) => {
        if (planningSimulationTrip === null) {
            return;
        }

        setChooseTruckerDisabled(true);
        try {
            if (hasSchedulerByTimeEnabled) {
                await dispatch(
                    fetchBulkAssignTripToTruckerAndTime(
                        [planningSimulationTrip.uid],
                        parseInt(truckerId),
                        truckerIndicators.simulated_scheduled_start ?? date,
                        extendedView
                    )
                );
            } else {
                await dispatch(
                    fetchBulkAssignTripToTrucker(
                        [planningSimulationTrip.uid],
                        parseInt(truckerId),
                        date,
                        truckerIndicators.last_trip_scheduled_order === null
                            ? 0
                            : truckerIndicators.last_trip_scheduled_order + 1,
                        false,
                        extendedView
                    )
                );
            }
            closePlanningSimulationModal();
            sendTripMovedFromSimulationAnalyticsEvent();
        } catch {
            toast.error(t("common.error"));
        } finally {
            setChooseTruckerDisabled(false);
        }
    };

    return (
        <>
            <Droppable
                onDrop={onDropToPlanningSimulation}
                kind="planning-simulation"
                id="planning-simulation"
                payload={targetPayload}
                acceptedType={["*", "planned"]}
                styleProvider={planningSimulationStyleProvider}
                whenDrag={PlanningSimulationDropLayer}
                data-testid="planning-simulation-droppable"
                zIndex="level1"
            />
            {planningSimulationTrip !== null && isPlanningSimulationModalOpen && (
                <PlanningSimulationModal
                    trip={planningSimulationTrip}
                    onClose={closePlanningSimulationModal}
                    onChooseTruckerClick={onChooseTruckerClick}
                    chooseTruckerText={t("components.plan")}
                    chooseTruckerDisabled={chooseTruckerDisabled}
                    from="scheduler"
                />
            )}
        </>
    );
};
