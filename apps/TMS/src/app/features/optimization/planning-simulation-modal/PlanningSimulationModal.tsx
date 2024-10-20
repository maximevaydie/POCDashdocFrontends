import {
    AnalyticsEvent,
    analyticsService,
    apiService,
    getConnectedCompany,
    getConnectedManager,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickableFlex,
    DatePicker,
    Flex,
    Icon,
    LoadingWheel,
    Modal,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React, {FunctionComponent, useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {ErrorBanner} from "app/features/optimization/planning-simulation-modal/ErrorBanner";
import {
    getTruckerName,
    hasNoPlannedActivity,
    missingDistanceOrDrivingTime,
} from "app/features/optimization/planning-simulation-modal/planning-simulation-modal.service";
import {SelectedTruckerPanel} from "app/features/optimization/planning-simulation-modal/selected-trucker-panel/SelectedTruckerPanel";
import {TruckerTotalDistanceAndDrivingTimeBoxes} from "app/features/optimization/planning-simulation-modal/TruckerTotalDistanceAndDrivingTimeBoxes";
import {
    LastActivity,
    TruckerIndicators,
} from "app/features/optimization/planning-simulation.types";
import {PlanningSimulationBannerFrom} from "app/features/optimization/PlanningSimulationBanner";
import {CardAddressText} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/CardAddressText";
import {CompactTrip, TripWithTransportData} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";

type PlanningSimulationModalFrom = "scheduler" | PlanningSimulationBannerFrom;

const ExplanationBanner = ({isPreparedTrip}: {isPreparedTrip: boolean}) => {
    return (
        <Flex
            backgroundColor="grey.light"
            px={3}
            py={2}
            borderRadius={1}
            marginBottom={3}
            marginTop={-3}
        >
            <Icon name="robot" color="grey.ultradark" mr={3} />
            <Text>
                {t("optimization.planningSimulationExplanationBanner", {
                    transport: t(isPreparedTrip ? "common.trips" : "common.transports", {
                        smart_count: 1,
                    }),
                })}
            </Text>
        </Flex>
    );
};

const TruckerDetails = ({lastActivity}: {lastActivity: LastActivity | null}) => {
    const noPlannedActivity = lastActivity === null;

    const maxLength = 25;

    return (
        <Flex>
            <Icon
                name="address"
                size={12}
                marginRight={1}
                color={noPlannedActivity ? "yellow.dark" : "grey.dark"}
            />
            <Text variant="caption" color={noPlannedActivity ? "yellow.dark" : "grey.dark"}>
                {noPlannedActivity ? (
                    t("optimization.noPlannedActivity")
                ) : (
                    <CardAddressText address={lastActivity.address} maxLength={maxLength} />
                )}
            </Text>
        </Flex>
    );
};

const TruckerRow = ({
    truckerId,
    selectedTruckerId,
    onClick,
    truckerIndicators,
}: {
    truckerId: string;
    selectedTruckerId: string | null;
    onClick: () => void;
    truckerIndicators: TruckerIndicators;
}) => {
    return (
        <ClickableFlex
            border={selectedTruckerId === truckerId ? "2px solid" : "1px solid"}
            borderColor={selectedTruckerId === truckerId ? "grey.default" : "grey.light"}
            backgroundColor={selectedTruckerId === truckerId ? "grey.ultralight" : "white"}
            marginBottom={2}
            paddingY={2}
            paddingX={3}
            hoverStyle={{bg: "grey.ultralight"}}
            onClick={onClick}
            data-testid="planning-simulation-modal-trucker-row"
        >
            <Box flex={1}>
                <Text fontWeight="bold" marginBottom={3}>
                    {getTruckerName(truckerIndicators)}
                </Text>
                <TruckerDetails lastActivity={truckerIndicators.last_activity} />
            </Box>
            <TruckerTotalDistanceAndDrivingTimeBoxes
                truckerIndicators={truckerIndicators}
                color="grey.dark"
                alignItems="center"
                paddingX={1}
                backgroundColor="grey.light"
                flex={1}
            />
            {missingDistanceOrDrivingTime(truckerIndicators) ? (
                <Flex backgroundColor="red.ultralight" ml={1} my={-2} mr={-3}>
                    <Icon name="alert" color="red.dark" size={12} p={0.5} />
                </Flex>
            ) : (
                hasNoPlannedActivity(truckerIndicators) && (
                    <Flex backgroundColor="yellow.ultralight" ml={1} my={-2} mr={-3}>
                        <Icon name="alert" color="yellow.dark" size={12} p={0.5} />
                    </Flex>
                )
            )}
        </ClickableFlex>
    );
};

const TripMissingStartCoordinatesBanner = ({isPreparedTrip}: {isPreparedTrip: boolean}) => {
    const errors = [
        t("optimization.tripMissingStartCoordinates", {
            transport: t(isPreparedTrip ? "common.trips" : "common.transports", {
                smart_count: 1,
            }),
        }),
    ];
    return <ErrorBanner color="red" errors={errors} />;
};

interface PlanningSimulationModalProps {
    trip: CompactTrip | TripWithTransportData;
    onClose: () => void;
    onChooseTruckerClick: (
        truckerId: string,
        truckerIndicators: TruckerIndicators,
        date: Date
    ) => void;
    chooseTruckerText: string;
    chooseTruckerDisabled: boolean;
    from: PlanningSimulationModalFrom;
}

export const PlanningSimulationModal: FunctionComponent<PlanningSimulationModalProps> = ({
    trip,
    onClose,
    onChooseTruckerClick,
    chooseTruckerText,
    chooseTruckerDisabled,
    from,
}) => {
    const {extendedView} = useExtendedView();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);

    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [truckersIndicators, setTruckersIndicators] = useState<{
        [truckerId: string]: TruckerIndicators;
    } | null>(null);
    const [selectedTruckerId, setSelectedTruckerId] = useState<string | null>(null);

    const tripMissingStartCoordinates =
        isNil(trip.activities[0]?.address?.latitude) ||
        isNil(trip.activities[0]?.address?.longitude);

    useEffect(() => {
        setTruckersIndicators(null);
        setSelectedTruckerId(null);
        planningSimulation();
    }, [date]);

    return (
        <Modal
            title={t("optimization.planningSimulation")}
            onClose={onClose}
            mainButton={null}
            size={selectedTruckerId !== null ? "large" : "medium"}
            data-testid="planning-simulation-modal"
        >
            <ExplanationBanner isPreparedTrip={trip.is_prepared} />
            {tripMissingStartCoordinates ? (
                <Flex flexDirection="column" alignItems="center">
                    <Icon name="robotWithWarning" size={200} />
                    <Text variant="h1" mb={3}>
                        {t("optimization.missingDataForSimulation")}
                    </Text>
                    <TripMissingStartCoordinatesBanner isPreparedTrip={trip.is_prepared} />
                </Flex>
            ) : (
                <Flex mb={-1}>
                    <Box flex={1}>
                        <DatePicker
                            date={date}
                            onChange={(date) => {
                                setDate(date);
                            }}
                            label={t("optimization.dayToSimulate")}
                            data-testid="planning-simulation-modal-date-picker"
                            rootId="react-app-modal-root"
                        />
                        {isLoading && (
                            <Flex flexDirection="column" alignItems="center" marginTop={3}>
                                <Text variant="h1">
                                    {t("optimization.simulationInProgress", {
                                        date: formatDate(date, "P"),
                                    })}
                                </Text>
                                <LoadingWheel />
                                <Text color="grey.dark">
                                    {t("optimization.simulationCanTakeTime")}
                                </Text>
                            </Flex>
                        )}
                        {date === null && (
                            <Flex flexDirection="column" alignItems="center" marginTop={3}>
                                <Text variant="h1">{t("optimization.selectADay")}</Text>
                                <Icon name="robotWithBook" size={200} />
                            </Flex>
                        )}
                        {truckersIndicators !== null && (
                            <Box height="400px" overflowY="auto" marginTop={3} pr={4} mr={-4}>
                                {Object.entries(truckersIndicators)
                                    .sort(compareTruckers)
                                    .map(([truckerId, truckerIndicators]) => (
                                        <TruckerRow
                                            key={truckerId}
                                            truckerId={truckerId}
                                            selectedTruckerId={selectedTruckerId}
                                            onClick={() => setSelectedTruckerId(truckerId)}
                                            truckerIndicators={truckerIndicators}
                                        />
                                    ))}
                            </Box>
                        )}
                    </Box>
                    {date !== null &&
                        truckersIndicators !== null &&
                        selectedTruckerId !== null && (
                            <SelectedTruckerPanel
                                trip={trip}
                                truckerIndicators={truckersIndicators[selectedTruckerId]}
                                onClick={() =>
                                    onChooseTruckerClick(
                                        selectedTruckerId,
                                        truckersIndicators[selectedTruckerId],
                                        date
                                    )
                                }
                                chooseTruckerText={chooseTruckerText}
                                chooseTruckerDisabled={chooseTruckerDisabled}
                            />
                        )}
                </Flex>
            )}
        </Modal>
    );

    async function planningSimulation() {
        if (date === null) {
            setTruckersIndicators(null);
            return;
        }
        const dateStr = formatDate(date, "yyyy-MM-dd");
        try {
            setIsLoading(true);
            setTruckersIndicators(
                await apiService.get(
                    `/trips/${trip.uid}/planning-simulation/?date=${dateStr}&extended_view=${extendedView}`,
                    {
                        apiVersion: "web",
                    }
                )
            );
            setIsLoading(false);
            sendTripSimulatedAnalyticsEvent();
        } catch {
            setIsLoading(false);
            setDate(null);
            toast.error(t("common.error"));
        }
    }

    function sendTripSimulatedAnalyticsEvent() {
        analyticsService.sendEvent(AnalyticsEvent.tripSimulated, {
            "is staff": manager?.user.is_staff,
            "company id": company?.pk,
            "trip uid": trip.uid,
            date: date,
            from: from,
        });
    }
};

function compareTruckers(a: [string, TruckerIndicators], b: [string, TruckerIndicators]) {
    const firstDistanceToTrip = a[1].distance_to_trip;
    const secondDistanceToTrip = b[1].distance_to_trip;

    if (firstDistanceToTrip === secondDistanceToTrip) {
        return getTruckerName(a[1]).localeCompare(getTruckerName(b[1]));
    }

    return (firstDistanceToTrip ?? Infinity) - (secondDistanceToTrip ?? Infinity);
}
