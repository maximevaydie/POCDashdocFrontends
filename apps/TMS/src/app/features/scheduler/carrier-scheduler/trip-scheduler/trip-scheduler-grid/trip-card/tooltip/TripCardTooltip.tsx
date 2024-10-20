import {Box} from "@dashdoc/web-ui";
import React from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getTripDecoration} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tripStatus.constants";
import {getTripTags} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";

import {SchedulerCardTooltip} from "./components/SchedulerCardTooltip";
import {TooltipStatusHeader} from "./components/TooltipStatusHeader";
import {TooltipTags} from "./components/TooltipTags";

export function TripCardTooltip({
    trip,
    view,
    inconsistentOrder,
}: {
    trip: CompactTrip;
    view: TripSchedulerView;
    inconsistentOrder: boolean;
}) {
    const decoration = getTripDecoration(trip, view);
    return (
        <Box maxWidth="300px" minWidth="150px">
            <TooltipStatusHeader
                decoration={decoration}
                trip={trip}
                inconsistentOrder={inconsistentOrder}
            />
            <Box
                borderTop="1px solid"
                borderColor="grey.light"
                py={2}
                overflowY="auto"
                maxHeight={"40vh"}
            >
                <SchedulerCardTooltip trip={trip} />
            </Box>
            <TooltipTags tags={getTripTags(trip)} />
        </Box>
    );
}
