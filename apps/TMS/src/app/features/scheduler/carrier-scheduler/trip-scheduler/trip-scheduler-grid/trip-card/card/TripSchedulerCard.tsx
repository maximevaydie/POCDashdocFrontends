import {Manager} from "dashdoc-utils";
import React, {useMemo} from "react";

import {SchedulerCardContent} from "app/features/scheduler/carrier-scheduler/components/card-content/SchedulerCardContent";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getTripDecoration} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tripStatus.constants";
import {
    getTripInstructions,
    getTripRequestedVehicle,
    getTripTags,
    isTripActivityDeletedOrCancelled,
    isTripActivityComplete,
    isTripActivityOnSite,
} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

/**
 * Base presentational component for all cards displayed on the scheduler
 */
type SchedulerCardProps = {
    trip: CompactTrip;
    height?: number;
    schedulerStartDate?: Date;
    schedulerEndDate?: Date;
    viewMode?: TripSchedulerView;
    isSelected?: boolean;
    isFiltered?: boolean;
    width?: string;
    "data-testid"?: string;
    children?: React.ReactNode;
    settings?: Manager["scheduler_card_display_settings"];
    inconsistentOrder?: boolean;
    stickyContent?: boolean;
    minutesScale?: number;
    onActivityHovered?: (value: {uid: string; count: number} | null) => void;
};

export function TripSchedulerCard({
    trip,
    height,
    schedulerStartDate,
    schedulerEndDate,
    viewMode,
    isSelected,
    isFiltered,
    width,
    "data-testid": dataTestId,
    settings,
    inconsistentOrder,
    stickyContent,
    minutesScale,
    onActivityHovered,
}: SchedulerCardProps) {
    const activities = useMemo(() => {
        return trip.activities.map((activity) => ({
            ...activity,
            onSite: isTripActivityOnSite(activity),
            siteDone: isTripActivityComplete(activity),
            isDeletedOrCancelled: isTripActivityDeletedOrCancelled(activity),
        }));
    }, [trip.activities]);
    const means = {trucker: trip.trucker, vehicle: trip.vehicle, trailer: trip.trailer};
    const isPlanningByTime = useSchedulerByTimeEnabled();

    return (
        <SchedulerCardContent
            name={
                trip.is_prepared
                    ? trip.name
                    : trip.activities.find((activity) => activity.transports.length > 0)
                          ?.transports[0]?.shipper?.name
            }
            decoration={getTripDecoration(trip, viewMode)}
            activities={activities}
            means={means}
            requestedVehicles={getTripRequestedVehicle(trip)}
            instructions={getTripInstructions(trip)}
            cardDateRange={trip.scheduler_datetime_range}
            schedulerStartDate={schedulerStartDate}
            schedulerEndDate={schedulerEndDate}
            isPreparedTrip={trip.is_prepared}
            height={height}
            viewMode={viewMode}
            isSelected={isSelected}
            isFiltered={isFiltered}
            width={width}
            data-testid={dataTestId}
            settings={settings}
            inconsistentOrder={inconsistentOrder}
            tags={getTripTags(trip)}
            stickyContent={stickyContent}
            displayInTimeLine={isPlanningByTime}
            minutesScale={minutesScale}
            onActivityHovered={onActivityHovered}
        />
    );
}
