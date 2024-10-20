import {transportBadgeVariants} from "app/features/trip/trip-edition/trip-activity-list/TripActivityList";
import {
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "app/features/trip/trip.types";

export function useTransportBadgeVariant(activities: SimilarActivityWithTransportData[]) {
    const transportBadgeVariantsMap: Record<string, TransportBadgeVariant> = {};
    const transportUids = Array.from(
        new Set(activities.flatMap((activity) => activity.transports.map((t) => t.uid)))
    ).sort();
    transportUids.forEach((uid) => {
        transportBadgeVariantsMap[uid] =
            transportBadgeVariants[transportUids.indexOf(uid) % transportBadgeVariants.length];
    });

    const getBadgeVariantByTransportUid = (transportUid: string) => {
        return transportBadgeVariantsMap[transportUid];
    };

    return getBadgeVariantByTransportUid;
}
