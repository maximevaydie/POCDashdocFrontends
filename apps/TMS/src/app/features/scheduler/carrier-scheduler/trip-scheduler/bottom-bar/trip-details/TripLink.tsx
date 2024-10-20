import {t} from "@dashdoc/web-core";
import {Link, Text} from "@dashdoc/web-ui";
import React, {useContext} from "react";

import {SelectTripContext} from "app/features/scheduler/carrier-scheduler/trip-scheduler/context/SelectTripContext";
import {getRelatedTripTransport} from "app/features/scheduler/carrier-scheduler/trip-scheduler/hooks/useTripSelection";
import {Trip} from "app/features/trip/trip.types";

export function TripLink({trip}: {trip: Trip}) {
    const transportUid = getRelatedTripTransport(trip);

    const onTripSelected = useContext(SelectTripContext);

    return (
        <>
            <Text variant="caption" ellipsis>
                <Link
                    data-testid="open-trip-or-transport"
                    onClick={() => onTripSelected(trip.uid)}
                >
                    {transportUid ? t("scheduler.openTransport") : t("scheduler.openTrip")}
                </Link>
            </Text>
        </>
    );
}
