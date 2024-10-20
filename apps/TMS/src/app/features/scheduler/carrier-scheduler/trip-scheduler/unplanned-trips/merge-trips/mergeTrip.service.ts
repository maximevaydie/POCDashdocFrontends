import {Company, parseAndZoneDate, formatDate} from "dashdoc-utils";
import {isSameDay} from "date-fns";
import sumBy from "lodash.sumby";
import uniq from "lodash.uniq";

import {START_HOUR, ACTIVITY_DURATION_IN_MINUTES} from "app/features/optimization/constants";
import {SimilarActivity, CompactTrip} from "app/features/trip/trip.types";
import {Coordinates} from "app/redux/actions/scheduler-trip";
import {MergeTripParameters} from "app/redux/actions/scheduler-trip";

import {getAddressOptions} from "./trip-optimization-modal/RouteFormSection";
import {getDefaultVehicleCapacity} from "./trip-optimization-modal/VehicleFormSection";

function getTripCreatedAnalyticsEventData({
    company,
    today,
    timezone,
    tripUid,
    validTrips,
    tripOptimizationError,
    fill_scheduled_dates,
    optimize_distance,
    vehicle_capacity_in_lm,
    start_coordinates,
    end_coordinates,
    start_datetime,
    activity_duration,
}: {
    company: Company | null;
    today: Date;
    timezone: string;
    tripUid: string;
    validTrips: CompactTrip[];
    tripOptimizationError: string | null;
} & MergeTripParameters) {
    let hasChangedVehicleCapacity = null;
    let defaultAddress;
    let routeModeType = null;
    let hasChangedLoopStartAndEnd = null;
    let withoutStart = null;
    let withoutEnd = null;
    let hasChangedSingleJourneyStart = null;
    let hasChangedSingleJourneyEnd = null;
    let withScheduledDates = null;
    let hasChangedStartDay = null;
    let hasChangedStartTime = null;
    let hasChangedActivityDuration = null;
    if (optimize_distance) {
        hasChangedVehicleCapacity = vehicle_capacity_in_lm !== getDefaultVehicleCapacity(company);

        defaultAddress = getAddressOptions(validTrips)[0];

        // if no address we do not display route section so we do not send any info about route
        if (defaultAddress) {
            routeModeType =
                start_coordinates === end_coordinates && start_coordinates !== undefined
                    ? "loop"
                    : "single journey";

            if (routeModeType === "loop") {
                hasChangedLoopStartAndEnd =
                    (start_coordinates as Coordinates).latitude !== defaultAddress.latitude ||
                    (start_coordinates as Coordinates).longitude !== defaultAddress.longitude;
            } else {
                withoutStart = start_coordinates === undefined;
                withoutEnd = end_coordinates === undefined;
                hasChangedSingleJourneyStart =
                    start_coordinates !== undefined &&
                    (start_coordinates.latitude !== defaultAddress.latitude ||
                        start_coordinates.longitude !== defaultAddress.longitude);
                hasChangedSingleJourneyEnd =
                    end_coordinates !== undefined &&
                    (end_coordinates.latitude !== defaultAddress.latitude ||
                        end_coordinates.longitude !== defaultAddress.longitude);
            }
        }

        withScheduledDates = fill_scheduled_dates;
        if (withScheduledDates) {
            const startDatetime = parseAndZoneDate(start_datetime as string, timezone); // if optimize_distance and withScheduledDates it means start_datetime is a string
            if (startDatetime) {
                hasChangedStartDay = !isSameDay(today, startDatetime);
                hasChangedStartTime = formatDate(startDatetime, "HH:mm") != `0${START_HOUR}:00`;
            }

            hasChangedActivityDuration = activity_duration != ACTIVITY_DURATION_IN_MINUTES;
        }
    }
    return {
        "company id": company?.pk,
        "trip uid": tripUid,
        "loading sites count": sumBy(
            validTrips,
            (trip) =>
                (trip.activities as Array<SimilarActivity>).filter(
                    (activity) => activity.category === "loading"
                ).length || 0
        ),
        "unloading sites count": sumBy(
            validTrips,
            (trip) =>
                (trip.activities as Array<SimilarActivity>).filter(
                    (activity) => activity.category === "unloading"
                ).length || 0
        ),
        "break sites count": sumBy(
            validTrips,
            (trip) =>
                (trip.activities as Array<SimilarActivity>).filter(
                    (activity) =>
                        activity.category && ["breaking", "resuming"].includes(activity.category)
                ).length || 0
        ),
        "number of OT": uniq(
            validTrips.flatMap((trip) =>
                (trip.activities as Array<SimilarActivity>).map((activity) =>
                    activity.transports.map((t) => t.id)
                )
            )
        ).length,
        "asked for optim": optimize_distance,
        "is actually optimized": optimize_distance && tripOptimizationError === null,
        "optim error": tripOptimizationError,
        "has changed vehicle capacity": hasChangedVehicleCapacity,
        "route mode type": routeModeType,
        "has changed loop start and end": hasChangedLoopStartAndEnd,
        "without start": withoutStart,
        "without end": withoutEnd,
        "has changed single journey start": hasChangedSingleJourneyStart,
        "has changed single journey end": hasChangedSingleJourneyEnd,
        "with scheduled dates": withScheduledDates,
        "has changed start day": hasChangedStartDay,
        "has changed start time": hasChangedStartTime,
        "has changed activity duration": hasChangedActivityDuration,
    };
}

export const mergeTripService = {
    getTripCreatedAnalyticsEventData,
};
