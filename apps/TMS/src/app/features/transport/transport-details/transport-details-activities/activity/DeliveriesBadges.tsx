import {t} from "@dashdoc/web-core";
import {Badge, Flex} from "@dashdoc/web-ui";
import React from "react";

import {complexTransportForm} from "app/features/transport/transport-form/complex-section/complexTransportForm.service";

import type {Activity, Delivery} from "app/types/transport";
type Props = {
    activity: Activity;
    deliveries: Delivery[];
};
export function DeliveriesBadges({activity, deliveries}: Props) {
    const orderedDeliveries = deliveries.sort((d1, d2) =>
        d1.sequential_id < d2.sequential_id ? -1 : 1
    );
    const loadingDeliveries = orderedDeliveries.filter((d) => d.origin.uid === activity.site.uid);
    const unloadingDeliveries = orderedDeliveries.filter(
        (d) => d.destination.uid === activity.site.uid
    );
    if (!["loading", "unloading"].includes(activity.type)) {
        return null;
    }
    return (
        <Flex style={{gap: "4px"}} flexWrap="wrap" justifyContent="flex-end">
            {loadingDeliveries.map((delivery) => (
                <Badge
                    key={delivery.uid}
                    variant="none"
                    backgroundColor={`${getDeliveryColor(delivery)}.ultralight`}
                    borderColor={`${getDeliveryColor(delivery)}.dark`}
                    shape="squared"
                    size="small"
                >
                    {t("common.pickup")}
                </Badge>
            ))}
            {unloadingDeliveries.map((delivery) => (
                <Badge
                    key={delivery.uid}
                    variant="none"
                    backgroundColor={`${getDeliveryColor(delivery)}.ultralight`}
                    borderColor={`${getDeliveryColor(delivery)}.dark`}
                    borderRadius={1}
                    size="small"
                >
                    {t("common.delivery")}
                </Badge>
            ))}
        </Flex>
    );

    function getDeliveryColor(delivery: Delivery) {
        return complexTransportForm.getColorByDeliveryIndex(
            orderedDeliveries.findIndex((d) => d.uid === delivery.uid)
        );
    }
}
