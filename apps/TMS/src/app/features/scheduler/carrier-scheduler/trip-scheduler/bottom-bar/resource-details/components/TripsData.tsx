import {useTimezone} from "@dashdoc/web-common";
import {Flex} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import sumBy from "lodash.sumby";
import React from "react";

import {resourceService} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/resource.service";
import {CompactTrip} from "app/features/trip/trip.types";

import {DataInfo} from "../../generic/DataInfo";

export function TripsData({
    trips,
    startDate,
    endDate,
}: {
    trips: CompactTrip[];
    startDate: Date;
    endDate: Date;
}) {
    const timezone = useTimezone();
    const price = sumBy(trips, (trip) => (trip.turnover ? Number(trip.turnover) : 0));
    const activitiesNumber = sumBy(
        trips,
        (trip) =>
            resourceService.getActivitiesInRange(trip.activities, startDate, endDate, timezone)
                .length
    );

    return (
        <Flex flexDirection="column" style={{gap: "8px"}}>
            <DataInfo
                icon="euro"
                label={
                    price
                        ? formatNumber(price, {
                              style: "currency",
                              currency: "EUR",
                          })
                        : "--"
                }
            />
            <DataInfo icon="address" label={`${activitiesNumber}`} />
        </Flex>
    );
}
