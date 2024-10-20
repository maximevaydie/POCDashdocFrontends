import {t} from "@dashdoc/web-core";
import {Button, Flex, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {ActivityMap} from "app/features/maps/ActivityMap";
import {ErrorBanner} from "app/features/optimization/planning-simulation-modal/ErrorBanner";
import {
    getTruckerName,
    hasNoPlannedActivity,
    missingDistanceOrDrivingTime,
} from "app/features/optimization/planning-simulation-modal/planning-simulation-modal.service";
import {DistanceAndDrivingTimeSchema} from "app/features/optimization/planning-simulation-modal/selected-trucker-panel/DistanceAndDrivingTimeSchema";
import {TruckerTotalDistanceAndDrivingTimeBoxes} from "app/features/optimization/planning-simulation-modal/TruckerTotalDistanceAndDrivingTimeBoxes";
import {TruckerIndicators} from "app/features/optimization/planning-simulation.types";
import {getPositions} from "app/features/trip/trip.service";
import {CompactTrip, TripWithTransportData} from "app/features/trip/trip.types";

const MissingDistanceOrDrivingTimeBanner = ({noPlannedActivity}: {noPlannedActivity: boolean}) => {
    const errors = [t("optimization.missingDistanceOrDrivingTime")];
    if (noPlannedActivity) {
        errors.push(t("optimization.truckerHasNoPlannedActivity"));
    }
    return <ErrorBanner color="red" errors={errors} />;
};

const NoPlannedActivityBanner = () => {
    const errors = [t("optimization.truckerHasNoPlannedActivity")];
    return <ErrorBanner color="yellow" errors={errors} />;
};

interface SelectedTruckerPanelProps {
    trip: CompactTrip | TripWithTransportData;
    truckerIndicators: TruckerIndicators;
    onClick: () => void;
    chooseTruckerText: string;
    chooseTruckerDisabled: boolean;
}

export const SelectedTruckerPanel: FunctionComponent<SelectedTruckerPanelProps> = ({
    trip,
    truckerIndicators,
    onClick,
    chooseTruckerText,
    chooseTruckerDisabled,
}) => {
    // We will display trip activities.
    // In case of a TripWithTransportData, some activities are duplicated.
    // eg: if the trip activities are L1, L2, U1, U2 where L1 and L2 are similars,
    // the TripWithTransportData activities are Lmerged, L1, L2, U1, U2.
    // So here we delete L1 and L2 from the TripWithTransportData activities.
    // N.B: In case of a CompactTrip, it will keep all the activities.
    // (since for the L1, L2, U1, U2 trip, the CompactTrip is already merged, U1, U2)
    const activities = trip.activities.filter((a) => a.fakeMerged || a.similarUids.length === 0);

    const noPlannedActivity = hasNoPlannedActivity(truckerIndicators);

    const positions = getPositions(activities);

    return (
        <Flex
            flexDirection="column"
            flex={1}
            marginLeft={4}
            backgroundColor="grey.ultralight"
            border="1px solid"
            borderColor="grey.light"
            px={3}
            py={2}
            data-testid="planning-simulation-modal-selected-trucker-panel"
        >
            <Text fontWeight="bold" mb={2}>
                {trip.is_prepared ? t("common.trip") : t("common.transport")}{" "}
                {t("optimization.toPlan")}
            </Text>
            <ActivityMap positions={positions} />
            <Text color="grey.dark" mb={2} mt={3}>
                {`${t("optimization.impactsFor")} ${getTruckerName(truckerIndicators)} :`}
            </Text>
            <DistanceAndDrivingTimeSchema
                truckerIndicators={truckerIndicators}
                activities={activities}
            />
            <Text variant="caption" color="grey.dark">{`${t("optimization.total")} :`}</Text>
            {missingDistanceOrDrivingTime(truckerIndicators) ? (
                <MissingDistanceOrDrivingTimeBanner noPlannedActivity={noPlannedActivity} />
            ) : (
                noPlannedActivity && <NoPlannedActivityBanner />
            )}
            <TruckerTotalDistanceAndDrivingTimeBoxes
                truckerIndicators={truckerIndicators}
                color="grey.ultradark"
                paddingX={4}
                backgroundColor="grey.light"
                withTitle={true}
            />
            <Button
                marginTop={2}
                disabled={chooseTruckerDisabled}
                alignSelf="flex-end"
                onClick={onClick}
                paddingY={1}
                paddingX={3}
                data-testid="planning-simulation-modal-choose-trucker-button"
            >
                {chooseTruckerText}
            </Button>
        </Flex>
    );
};
