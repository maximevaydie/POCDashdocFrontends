import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {hasNoPlannedActivity} from "app/features/optimization/planning-simulation-modal/planning-simulation-modal.service";
import {TruckerIndicators} from "app/features/optimization/planning-simulation.types";
import {formatEstimatedDrivingTime} from "app/features/trip/trip.service";
import {SimilarActivity} from "app/features/trip/trip.types";

const PositionLabel = ({
    children,
    borderColor,
    backgroundColor,
}: {
    children: React.ReactNode;
    borderColor: string;
    backgroundColor: string;
}) => {
    return (
        <Flex flexDirection="column" alignItems="center">
            <Flex
                width="25px"
                height="25px"
                borderRadius="50%"
                justifyContent="center"
                alignItems="center"
                border="1.55px solid"
                borderColor={borderColor}
                backgroundColor={backgroundColor}
            >
                {children}
            </Flex>
            <Box mt="3px" borderLeft="2px solid" height="10px" borderColor="grey.dark" />
        </Flex>
    );
};

const LastTripEndPositionLabel = ({noPlannedActivity}: {noPlannedActivity: boolean}) => {
    const color = noPlannedActivity ? "yellow" : "purple";

    return (
        <PositionLabel borderColor={`${color}.dark`} backgroundColor={`${color}.ultralight`}>
            <Icon name="truck" color={`${color}.dark`} size={15} />
        </PositionLabel>
    );
};

const DistanceAndDrivingTimeLabel = ({
    distance,
    drivingTime,
}: {
    distance: number | null;
    drivingTime: number | null;
}) => {
    return (
        <Flex flex={4} justifyContent="center" mx={2}>
            <Text variant="caption">
                {distance !== null
                    ? `${distance} ${t("pricingMetrics.unit.distance.short")}`
                    : `? ${t("pricingMetrics.unit.distance.short")}`}
                {" - "}
                {drivingTime !== null
                    ? formatEstimatedDrivingTime(drivingTime)
                    : `? ${t("pricingMetrics.unit.duration.short")}`}
            </Text>
        </Flex>
    );
};

interface DistanceAndDrivingTimeSchemaProps {
    truckerIndicators: TruckerIndicators;
    activities: SimilarActivity[];
}

export const DistanceAndDrivingTimeSchema: FunctionComponent<
    DistanceAndDrivingTimeSchemaProps
> = ({truckerIndicators, activities}) => {
    const noPlannedActivity = hasNoPlannedActivity(truckerIndicators);

    return (
        <Flex flexDirection="column">
            <Flex mx={4} alignItems="center">
                <LastTripEndPositionLabel noPlannedActivity={noPlannedActivity} />
                {noPlannedActivity ? (
                    <Flex flex={4} flexDirection="column" color="yellow.dark" alignItems="center">
                        <Icon name="alert" size={12} />
                        <Text color="inherit" variant="caption">
                            {t("optimization.unknownDistance")}
                        </Text>
                    </Flex>
                ) : (
                    <DistanceAndDrivingTimeLabel
                        distance={truckerIndicators.distance_to_trip}
                        drivingTime={truckerIndicators.driving_time_to_trip}
                    />
                )}
                <PositionLabel borderColor="blue.default" backgroundColor="blue.ultralight">
                    <Text color="blue.dark" variant="caption">
                        {1}
                    </Text>
                </PositionLabel>
                <DistanceAndDrivingTimeLabel
                    distance={truckerIndicators.trip_distance}
                    drivingTime={truckerIndicators.trip_driving_time}
                />
                <PositionLabel borderColor="blue.default" backgroundColor="blue.ultralight">
                    <Text color="blue.dark" variant="caption">
                        {activities.length}
                    </Text>
                </PositionLabel>
            </Flex>
            <Box borderTop="2px solid" borderColor="grey.dark" />
            <Box alignSelf="flex-end" mt="-9px" mr={-1} mb={-2}>
                <Icon name="arrowRight" color="grey.dark" />
            </Box>
        </Flex>
    );
};
