import {Text} from "@dashdoc/web-ui";
import React from "react";

import {SimilarActivityWithTransportData} from "app/features/trip/trip.types";

export function ShipperName({activity}: {activity: SimilarActivityWithTransportData}) {
    return (
        <Text variant="subcaption">
            {activity.transports
                .map((transport) => transport?.shipper?.name)
                .filter((n) => !!n)
                .join(", ")}
        </Text>
    );
}
