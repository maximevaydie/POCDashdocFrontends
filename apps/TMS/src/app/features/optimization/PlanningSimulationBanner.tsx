import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Checkbox, Flex, Icon, SelectOption, Text} from "@dashdoc/web-ui";
import {Trucker, formatDate, parseAndZoneDate, useToggle} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import React, {FunctionComponent, useEffect} from "react";
import {useDispatch} from "react-redux";

import {PlanningSimulationModal} from "app/features/optimization/planning-simulation-modal/PlanningSimulationModal";
import {TruckerIndicators} from "app/features/optimization/planning-simulation.types";
import {CompactTrip, TripWithTransportData} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {usePlanningSimulation} from "app/hooks/usePlanningSimulation";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {fetchRetrieveTrip} from "app/redux/actions/trips";
import {useSelector} from "app/redux/hooks";
import {getCompactTripByUid} from "app/redux/selectors";

export interface ScheduledDateParams {
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
    scheduledOrder: number | null;
    useScheduledStart: boolean;
}

export type PlanningSimulationBannerFrom = "transport means" | "trip means";

type PlanningSimulationBannerProps = {
    onSelectTrucker: (
        option: SelectOption<Pick<Trucker, "pk" | "display_name" | "means_combination">>
    ) => void;
    scheduledDateParams: ScheduledDateParams;
    setScheduledDateParams: (scheduledDateParams: ScheduledDateParams) => void;
    from: PlanningSimulationBannerFrom;
} & ({tripUid: string} | {trip: TripWithTransportData});

export const PlanningSimulationBanner: FunctionComponent<PlanningSimulationBannerProps> = ({
    onSelectTrucker,
    scheduledDateParams,
    setScheduledDateParams,
    from,
    ...props
}) => {
    const canUsePlanningSimulation = usePlanningSimulation();
    const {extendedView} = useExtendedView();

    let trip: TripWithTransportData | CompactTrip | null = null;
    let tripUid: string | null = null;
    if ("trip" in props) {
        trip = props.trip;
    } else {
        tripUid = props.tripUid;
    }

    // In case of a tripUid is passed, we have to fetch the trip and get it from the state
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    useEffect(() => {
        if (tripUid !== null && canUsePlanningSimulation) {
            try {
                dispatch(fetchRetrieveTrip(tripUid, extendedView));
                // eslint-disable-next-line no-empty
            } catch {}
        }
    }, [dispatch, canUsePlanningSimulation, tripUid, extendedView]);
    const compactTrip: CompactTrip | null = useSelector(
        (state) => getCompactTripByUid(state, tripUid),
        isEqual
    );
    if (tripUid !== null) {
        trip = compactTrip;
    }

    const [
        isPlanningSimulationModalOpen,
        openPlanningSimulationModal,
        closePlanningSimulationModal,
    ] = useToggle();

    if (!canUsePlanningSimulation || trip === null) {
        return null;
    }

    const onChooseTruckerClick = (
        truckerId: string,
        truckerIndicators: TruckerIndicators,
        date: Date
    ) => {
        onSelectTrucker({
            value: {
                pk: parseInt(truckerId),
                display_name: truckerIndicators.display_name,
                means_combination: null,
            },
        });
        setScheduledDateParams({
            scheduledStart:
                hasSchedulerByTimeEnabled && truckerIndicators.simulated_scheduled_start
                    ? parseAndZoneDate(truckerIndicators.simulated_scheduled_start, timezone)
                    : date,
            scheduledEnd: null,
            scheduledOrder:
                hasSchedulerByTimeEnabled || truckerIndicators.last_trip_scheduled_order === null
                    ? 0
                    : truckerIndicators.last_trip_scheduled_order + 1,
            useScheduledStart: true,
        });
        closePlanningSimulationModal();
    };

    return (
        <>
            <Flex backgroundColor="grey.light" borderRadius={1} mt={2} px={3} alignItems="center">
                <Icon name="robot" mr={3} color="grey.dark" flexShrink={0} />
                <Text>
                    {t("optimization.dashdocCanSimulatePlanning", {
                        transport: t(!trip.is_prepared ? "common.transports" : "common.trips", {
                            smart_count: 1,
                        }),
                    })}
                </Text>
                <Button
                    variant="plain"
                    onClick={openPlanningSimulationModal}
                    data-testid="planning-simulation-button"
                >
                    {t("optimization.simulatePlanning")}
                </Button>
            </Flex>

            {!hasSchedulerByTimeEnabled && scheduledDateParams.scheduledStart !== null && (
                <Box pt={3} data-testid="scheduled-date-box">
                    <Checkbox
                        data-testid="scheduled-date-checkbox"
                        checked={scheduledDateParams.useScheduledStart}
                        onChange={(checked) =>
                            setScheduledDateParams({
                                ...scheduledDateParams,
                                useScheduledStart: checked,
                            })
                        }
                        label={t("optimization.planOn", {
                            date: formatDate(scheduledDateParams.scheduledStart, "P"),
                            transport: t(
                                !trip.is_prepared ? "common.transports" : "common.trips",
                                {
                                    smart_count: 1,
                                }
                            ),
                        })}
                    />
                </Box>
            )}
            {isPlanningSimulationModalOpen && (
                <PlanningSimulationModal
                    trip={trip}
                    onClose={closePlanningSimulationModal}
                    onChooseTruckerClick={onChooseTruckerClick}
                    chooseTruckerText={t("common.select")}
                    chooseTruckerDisabled={false}
                    from={from}
                />
            )}
        </>
    );
};
