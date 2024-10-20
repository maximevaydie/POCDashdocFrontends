import {Trailer, Trucker, Vehicle, parseAndZoneDate} from "dashdoc-utils";
import {endOfDay, startOfDay} from "date-fns";
import sumBy from "lodash.sumby";

import {
    TripResource,
    TripSchedulerView,
    TruckerForScheduler,
    VehicleOrTrailerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {CompactTrip} from "app/features/trip/trip.types";

export function getResourceUid(
    resource: TripResource | Vehicle | Trailer | Trucker | undefined,
    view: TripSchedulerView
) {
    if (!resource) {
        return undefined;
    }
    switch (view) {
        case "trucker":
            return (resource as TruckerForScheduler)?.pk?.toString();
        case "vehicle":
        case "trailer": {
            const vehicle = resource as Vehicle | Trailer | VehicleOrTrailerForScheduler;
            return (
                "original" in vehicle && vehicle.original ? vehicle.original : vehicle.pk
            )?.toString();
        }
    }
}

export function getTripResourceUid(
    trip: CompactTrip,
    view: TripSchedulerView | undefined
): string | undefined {
    switch (view) {
        case "trucker":
            return getResourceUid(trip.trucker, view);
        case "vehicle":
            return getResourceUid(trip.vehicle, view);
        case "trailer":
            return getResourceUid(trip.trailer, view);
    }
    return undefined;
}

export function getTurnoverByResource(
    resourceUid: string,
    trips: CompactTrip[],
    view: TripSchedulerView,
    startDate: Date,
    endDate: Date,
    timezone: string
) {
    return sumBy(trips, (trip) => {
        if (getTripResourceUid(trip, view) === resourceUid) {
            return _getTripRevenue(trip, startDate, endDate, timezone);
        }
        return 0;
    });
}
export function getTotalTurnover(
    trips: CompactTrip[],
    view: TripSchedulerView,
    startDate: Date,
    endDate: Date,
    timezone: string
) {
    return sumBy(trips, (trip) => {
        if (getTripResourceUid(trip, view)) {
            return _getTripRevenue(trip, startDate, endDate, timezone);
        }
        return 0;
    });
}

function _getTripRevenue(trip: CompactTrip, startDate: Date, endDate: Date, timezone: string) {
    const tripStartDate = parseAndZoneDate(trip.scheduler_datetime_range.start, timezone);
    if (
        tripStartDate &&
        startOfDay(startDate) <= tripStartDate &&
        tripStartDate <= endOfDay(endDate)
    ) {
        return trip.turnover ? parseFloat(trip.turnover) : 0;
    }
    return 0;
}
