import {useTimezone} from "@dashdoc/web-common";
import {parseAndZoneDate} from "dashdoc-utils";
import {endOfDay, startOfDay} from "date-fns";
import React from "react";

import {getTripResourceUid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getPlannedTripsForCurrentQuery} from "app/redux/selectors";

import {SendInstructionStatus} from "./SendInstructionsStatus";

export function DayActionButton({
    day,
    currentDate,
    view,
    allResourceLoaded,
    size,
}: {
    day: Date;
    currentDate: Date;
    view: TripSchedulerView;
    allResourceLoaded: boolean;
    size?: "small" | "medium";
}) {
    const hasTripsToSend = useHasTripsToPlan(day, view);
    return (
        <SendInstructionStatus
            day={day}
            currentDate={currentDate}
            hasTripsToSend={hasTripsToSend}
            allRowsLoaded={allResourceLoaded}
            viewMode={view}
            size={size}
        />
    );
}

function useHasTripsToPlan(day: Date, view: TripSchedulerView) {
    const timezone = useTimezone();
    const hasTripsToSend = useSelector((state) => {
        const trips = getPlannedTripsForCurrentQuery(state);

        const filteredTrips = trips.filter(
            (trip) =>
                trip.status === "unstarted" &&
                (trip.trucker_status === "trucker_assigned" ||
                    (trip.trucker_status === "unassigned" && view === "vehicle" && trip.vehicle) ||
                    (trip.trucker_status === "unassigned" && view === "trailer" && trip.trailer))
        );
        return filteredTrips.some((trip) => {
            return isDuringDay(trip, day, timezone) && getTripResourceUid(trip, view);
        });
    });
    return hasTripsToSend;
}

function isDuringDay(trip: CompactTrip, day: Date, timezone: string) {
    const tripStartDate = parseAndZoneDate(trip.scheduler_datetime_range.start, timezone);
    const tripEndDate = parseAndZoneDate(trip.scheduler_datetime_range.end, timezone);
    const startDay = startOfDay(day);
    const endDay = endOfDay(day);

    return tripStartDate && tripEndDate && startDay <= tripEndDate && tripStartDate <= endDay;
}
