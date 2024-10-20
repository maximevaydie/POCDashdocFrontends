import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {
    accepted_by_charter,
    acknowledged,
    assigned,
    cancelled,
    declined,
    done,
    invoiced,
    onGoing,
    plannedAndSent,
    plannedButNotSent,
    sent_to_charter,
    unplanned,
    verified,
} from "app/features/scheduler/carrier-scheduler/components/card-content/status.constants";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {CompactTrip, SimilarActivity, Trip, TripActivity} from "app/features/trip/trip.types";

const decorations = {
    unassigned: unplanned,
    trucker_assigned: plannedButNotSent,
    mission_sent_to_trucker: plannedAndSent,
    acknowledged,
    ongoing: onGoing,
    done,
    verified,
    invoiced,
    declined,
    sent_to_charter,
    assigned,
    accepted_by_charter,
    cancelled,
};
export const getTripDecoration = (
    trip: Pick<CompactTrip, "status" | "trucker_status"> & Partial<CompactTrip | Trip>,
    viewMode: TripSchedulerView = "trucker"
): Decoration => {
    let tripStatus = trip.status || "unstarted";
    let truckerStatus = trip.trucker_status || "unassigned";
    if (
        viewMode === "vehicle" &&
        trip.status === "unstarted" &&
        trip.trucker_status === "unassigned" &&
        trip.vehicle?.license_plate
    ) {
        truckerStatus = "trucker_assigned";
    }

    if (tripStatus === "done" && trip.activities) {
        const statuses = trip.activities
            .flatMap((activity) =>
                "transport" in activity
                    ? (activity as TripActivity).transport?.invoicing_status
                    : (activity as SimilarActivity).transports.map((t) => t.invoicing_status)
            )
            .filter((s) => !!s) as string[];
        if (statuses.every((status) => ["PAID", "INVOICED"].includes(status))) {
            tripStatus = "invoiced";
        } else if (statuses.every((status) => ["VERIFIED", "PAID", "INVOICED"].includes(status))) {
            tripStatus = "verified";
        }
    }
    const status = tripStatus === "unstarted" ? truckerStatus : tripStatus;

    return decorations[status] ?? unplanned;
};
