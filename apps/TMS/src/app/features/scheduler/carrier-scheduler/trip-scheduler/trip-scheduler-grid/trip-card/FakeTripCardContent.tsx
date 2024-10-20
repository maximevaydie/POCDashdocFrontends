import {Box} from "@dashdoc/web-ui";
import {Manager} from "dashdoc-utils";
import React from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {CompactTrip} from "app/features/trip/trip.types";

import {TripSchedulerCard} from "./card/TripSchedulerCard";

type TripCardContentProps = {
    trip: CompactTrip | undefined;
    isSelected: boolean;
    view: TripSchedulerView;
    schedulerStartDate: Date;
    schedulerEndDate: Date;
    minutesScale?: number;
    settings?: Manager["scheduler_card_display_settings"];
    isCardFiltered?: boolean;
};

export function FakeTripCardContent({
    trip,
    isSelected,
    view,
    schedulerStartDate,
    schedulerEndDate,
    minutesScale,
    settings,
    isCardFiltered,
}: TripCardContentProps) {
    return trip ? (
        <Box style={{cursor: "grab"}}>
            <TripSchedulerCard
                data-testid="scheduler-card"
                trip={trip}
                schedulerStartDate={schedulerStartDate}
                schedulerEndDate={schedulerEndDate}
                viewMode={view}
                isSelected={isSelected}
                isFiltered={isCardFiltered}
                stickyContent={true}
                minutesScale={minutesScale}
                settings={settings}
            />
        </Box>
    ) : null;
}
