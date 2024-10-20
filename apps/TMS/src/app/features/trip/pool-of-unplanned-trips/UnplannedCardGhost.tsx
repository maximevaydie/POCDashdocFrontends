import {Box, Flex} from "@dashdoc/web-ui";
import React from "react";

import {TripSchedulerCard} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/card/TripSchedulerCard";
import {CompactTrip} from "app/features/trip/trip.types";

export function UnplannedCardGhost({
    trip,
    dragItemsCount,
}: {
    trip: CompactTrip;
    dragItemsCount: number;
}) {
    return (
        <Box pl="calc(50% - 115px)">
            <TripSchedulerCard trip={trip} width="230px">
                {dragItemsCount > 1 && (
                    <Flex
                        position="absolute"
                        top="-6px"
                        right="-6px"
                        width="30px"
                        height="30px"
                        borderRadius="50%"
                        backgroundColor="yellow.default"
                        fontWeight="bold"
                        fontSize={2}
                        p={1}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {dragItemsCount}
                    </Flex>
                )}
            </TripSchedulerCard>
        </Box>
    );
}
