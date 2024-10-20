import {t} from "@dashdoc/web-core";
import {Badge, Icon} from "@dashdoc/web-ui";
import React from "react";

import {getActivityKeyLabel} from "app/features/trip/trip.service";
import {
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "app/features/trip/trip.types";

export function DeliveryLink({
    activity,
    badgeVariantByUid,
    isCollapsed,
    onExpandCollapse,
    isPreparedTrip,
}: {
    activity: SimilarActivityWithTransportData;
    badgeVariantByUid: Record<string, TransportBadgeVariant>;
    isCollapsed?: boolean;
    onExpandCollapse?: () => void;
    isPreparedTrip: boolean;
}) {
    const transports = activity.transports;
    const deliveries = [...(activity.deliveries_from || []), ...(activity.deliveries_to || [])];
    if (transports.length === 0) {
        if (activity.category && ["trip_start", "trip_end"].includes(activity.category)) {
            return (
                <Badge shape="squared" variant="neutral" size="small">
                    {getActivityKeyLabel(activity.category)}
                </Badge>
            );
        }
        return null;
    }
    const isCancelled = activity.cancelled_status === "cancelled";
    const isDeleted = activity.cancelled_status === "deleted";

    return (
        <>
            {isCancelled && (
                <Badge variant="error" shape="squared" size="small">
                    {t("components.cancelled")}
                </Badge>
            )}
            {isDeleted && (
                <Badge variant="error" shape="squared" size="small">
                    {t("common.deleted.male")}
                </Badge>
            )}
            {!isDeleted && !isCancelled && (
                <>
                    {activity.similarUids.length === 1 ? (
                        isPreparedTrip ? (
                            <Badge
                                shape="squared"
                                variant={badgeVariantByUid[transports[0].uid]}
                                size="small"
                                onClick={handleTransportLinkClicked}
                                css={{cursor: "pointer"}}
                            >
                                {getActivityKeyLabel(activity.category)}
                                {` # ${transports[0].sequential_id.toString().slice(-3)}`}
                            </Badge>
                        ) : (
                            deliveries.map((delivery) => (
                                <Badge
                                    key={delivery.uid}
                                    shape="squared"
                                    variant={badgeVariantByUid[delivery.uid]}
                                    size="small"
                                >
                                    {getActivityKeyLabel(activity.category)}
                                </Badge>
                            ))
                        )
                    ) : (
                        <Badge
                            shape="squared"
                            variant="neutral"
                            size="small"
                            onClick={onExpandCollapse}
                            css={{cursor: "pointer"}}
                        >
                            {activity.similarUids.length + " " + t("common.activities")}
                            <Icon name={isCollapsed ? "arrowRight" : "arrowDown"} ml={1} />
                        </Badge>
                    )}
                </>
            )}
        </>
    );

    function handleTransportLinkClicked() {
        const transportUid = transports[0].uid;
        window.open(`/app/transports/${transportUid}`, "_blank");
    }
}
