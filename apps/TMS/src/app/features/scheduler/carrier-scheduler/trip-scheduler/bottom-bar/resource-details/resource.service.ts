import {t} from "@dashdoc/web-core";

import {getActivityDatesDisplay} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/by-day/SiteDate";
import {SimilarActivity, Trip} from "app/features/trip/trip.types";

function getResourceLabel(trip: Trip, resourceKey: "trucker" | "vehicle" | "trailer") {
    switch (resourceKey) {
        case "trucker":
            return trip.trucker ? trip.trucker.display_name : t("scheduler.noTrucker");
        case "vehicle":
            return trip.vehicle ? trip.vehicle.license_plate : t("scheduler.noVehicle");
        case "trailer":
            return trip.trailer ? trip.trailer.license_plate : t("scheduler.noTrailer");
    }
}
function getActivitiesInRange(
    activities: SimilarActivity[],
    startDate: Date,
    endDate: Date,
    timezone: string
) {
    return activities.filter((activity) => {
        const activityStartDate = getActivityDatesDisplay(activity, timezone).start;
        return activityStartDate > startDate && activityStartDate < endDate;
    });
}
export const resourceService = {
    getResourceLabel,
    getActivitiesInRange,
};
