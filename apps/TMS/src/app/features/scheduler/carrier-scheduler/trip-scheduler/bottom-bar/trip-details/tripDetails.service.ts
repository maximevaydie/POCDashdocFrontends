import {t} from "@dashdoc/web-core";

import {CompactTrip, Trip, TripTransport} from "app/features/trip/trip.types";

function getTripOrTransportName(trip: Trip) {
    let tripLabel: string;
    if (trip.is_prepared) {
        tripLabel = t("common.trip") + " " + trip.name;
    } else {
        const transport = trip.activities.filter(
            (activity) => activity.category !== "trip_start" && activity.category !== "trip_end"
        )[0].transport as TripTransport;
        tripLabel = t("components.transportNumber", {number: transport.sequential_id});
    }
    return tripLabel;
}
function getCompactTripOrTransportName(trip: CompactTrip) {
    let tripLabel: string;
    if (trip.is_prepared) {
        tripLabel = t("common.trip") + " " + trip.name;
    } else {
        const transport = trip.activities.filter(
            (activity) => activity.category !== "trip_start" && activity.category !== "trip_end"
        )[0].transports[0] as TripTransport;
        tripLabel = t("components.transportNumber", {number: transport.sequential_id});
    }
    return tripLabel;
}
export const tripDetailsService = {
    getTripOrTransportName,
    getCompactTripOrTransportName,
};
