import {t} from "@dashdoc/web-core";
import {Box, Callout, ClickableBox, Flex, Icon, NoWrap, Text, theme} from "@dashdoc/web-ui";
import React from "react";

import {useTripConflictWithUnavailability} from "app/features/fleet/unavailabilities/hooks/useConflictWithUnavailability";
import {TripWithTransportData} from "app/features/trip/trip.types";

type Props = {
    trip: TripWithTransportData;
    cannotEditMeans?: boolean;
};

export function TripMeansOverview({trip, cannotEditMeans}: Props) {
    const MeansBox = cannotEditMeans ? Box : ClickableBox;

    const {
        hasTruckerAvailabilityConflict,
        hasVehicleAvailabilityConflict,
        hasTrailerAvailabilityConflict,
    } = useTripConflictWithUnavailability(trip);

    const {trucker, trailer, vehicle} = trip;

    return (
        <>
            <Flex>
                <MeansBox
                    px={4}
                    py={3}
                    border={"1px solid"}
                    borderColor="grey.light"
                    flex={1}
                    data-testid="trip-means-overview"
                >
                    {trucker && (
                        <Text variant="h2" color="grey.ultradark" data-testid="trip-means-trucker">
                            {trucker.display_name}
                        </Text>
                    )}
                    <Flex style={{gap: theme.space[2]}}>
                        {vehicle?.license_plate && (
                            <NoWrap
                                display="flex"
                                fontSize={2}
                                color="grey.dark"
                                mt={2}
                                data-testid="trip-means-vehicle"
                            >
                                <Icon color="grey.dark" name="truck" mr={1} />
                                {vehicle.license_plate}
                            </NoWrap>
                        )}

                        {trailer?.license_plate && (
                            <NoWrap
                                display="flex"
                                fontSize={2}
                                color="grey.dark"
                                mt={2}
                                data-testid="trip-means-trailer"
                                alignContent="center"
                            >
                                <Icon name="trailer" color="grey.dark" mr={1} />
                                {trailer.license_plate}
                            </NoWrap>
                        )}
                    </Flex>
                </MeansBox>
            </Flex>
            {hasTruckerAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-availability-trucker">
                    <Text>{t("unavailability.truckerUnavailableOnPeriod")}</Text>
                </Callout>
            )}
            {hasVehicleAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-availability-vehicle">
                    <Text>{t("unavailability.vehicleUnavailableOnPeriod")}</Text>
                </Callout>
            )}
            {hasTrailerAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-availability-trailer">
                    <Text>{t("unavailability.trailerUnavailableOnPeriod")}</Text>
                </Callout>
            )}
        </>
    );
}
