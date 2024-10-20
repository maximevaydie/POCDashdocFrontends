import {TruckerIndicators} from "app/features/optimization/planning-simulation.types";

export function getTruckerName(truckerIndicators: TruckerIndicators) {
    return `${truckerIndicators.user_last_name} ${truckerIndicators.user_first_name}`;
}

export function hasNoPlannedActivity(truckerIndicators: TruckerIndicators) {
    return truckerIndicators.last_activity === null;
}

export function missingDistanceOrDrivingTime(truckerIndicators: TruckerIndicators) {
    const missingDistanceOrDrivingTimeToTrip =
        !hasNoPlannedActivity(truckerIndicators) &&
        (truckerIndicators.distance_to_trip === null ||
            truckerIndicators.driving_time_to_trip === null);

    const missingTripDistanceOrDrivingTime =
        truckerIndicators.trip_distance === null || truckerIndicators.trip_driving_time === null;

    return missingDistanceOrDrivingTimeToTrip || missingTripDistanceOrDrivingTime;
}
