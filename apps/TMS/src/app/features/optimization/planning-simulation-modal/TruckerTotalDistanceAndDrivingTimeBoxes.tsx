import {t} from "@dashdoc/web-core";
import {Flex, Icon, IconNames, BoxProps, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {TruckerIndicators} from "app/features/optimization/planning-simulation.types";
import {formatEstimatedDrivingTime} from "app/features/trip/trip.service";

const TruckerTotalIndicatorBox = ({
    color,
    iconName,
    value,
    title,
    ...props
}: {color: string; iconName: IconNames; title: string | null; value: string} & BoxProps) => {
    return (
        <Flex flexDirection="column" borderRadius={2} paddingY={2} color={color} {...props}>
            <Flex mb={1}>
                <Icon name={iconName} />
                {title !== null && (
                    <Text color="inherit" ml={2}>
                        {title}
                    </Text>
                )}
            </Flex>
            <Text color="inherit" variant="h2">
                {value}
            </Text>
        </Flex>
    );
};

type TruckerTotalDistanceAndDrivingTimeBoxesProps = {
    truckerIndicators: TruckerIndicators;
    color: string;
    withTitle?: boolean;
    flex?: number;
} & BoxProps;

export const TruckerTotalDistanceAndDrivingTimeBoxes: FunctionComponent<
    TruckerTotalDistanceAndDrivingTimeBoxesProps
> = ({truckerIndicators, color, withTitle, flex, ...props}) => {
    return (
        <Flex flex={flex}>
            <TruckerTotalIndicatorBox
                iconName="truck"
                value={getTotalDistance(truckerIndicators)}
                color={color}
                mr={2}
                title={withTitle ? t("trip.estimatedDistance") : null}
                flex={1}
                {...props}
            ></TruckerTotalIndicatorBox>
            <TruckerTotalIndicatorBox
                iconName="clock"
                value={getTotalDrivingTime(truckerIndicators)}
                color={color}
                title={withTitle ? t("trip.estimatedDrivingTime") : null}
                flex={1}
                {...props}
            ></TruckerTotalIndicatorBox>
        </Flex>
    );
};

function getTotalDistance(truckerIndicators: TruckerIndicators) {
    if (truckerIndicators.distance_to_trip === null && truckerIndicators.trip_distance === null) {
        return "--";
    }

    const distanceToTrip =
        truckerIndicators.distance_to_trip === null ? 0 : truckerIndicators.distance_to_trip;
    const tripDistance =
        truckerIndicators.trip_distance === null ? 0 : truckerIndicators.trip_distance;

    return `+ ${distanceToTrip + tripDistance}  ${t("pricingMetrics.unit.distance.short")}`;
}

function getTotalDrivingTime(truckerIndicators: TruckerIndicators) {
    if (
        truckerIndicators.driving_time_to_trip === null &&
        truckerIndicators.trip_driving_time === null
    ) {
        return "--";
    }

    const drivingTimeToTrip =
        truckerIndicators.driving_time_to_trip === null
            ? 0
            : truckerIndicators.driving_time_to_trip;
    const tripDrivingTime =
        truckerIndicators.trip_driving_time === null ? 0 : truckerIndicators.trip_driving_time;

    return `+ ${formatEstimatedDrivingTime(drivingTimeToTrip + tripDrivingTime)}`;
}
