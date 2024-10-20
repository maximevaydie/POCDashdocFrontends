import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import {formatEstimatedDrivingTime} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";

import {DataInfo} from "../../generic/DataInfo";

export function TripData({trip}: {trip: CompactTrip}) {
    return (
        <Flex flexDirection="column" style={{gap: "8px"}}>
            <DataInfo
                icon="euro"
                label={
                    trip.turnover
                        ? formatNumber(trip.turnover, {
                              style: "currency",
                              currency: "EUR",
                          })
                        : "--"
                }
            />
            <DataInfo icon="address" label={`${trip.activities.length}`} />
            <DataInfo
                icon="truck"
                label={
                    trip.estimated_distance
                        ? trip.estimated_distance + " " + t("pricingMetrics.unit.distance.short")
                        : "--"
                }
            />
            <DataInfo
                icon="truck"
                label={
                    trip.estimated_driving_time
                        ? formatEstimatedDrivingTime(trip.estimated_driving_time)
                        : "--"
                }
            />
            <DataInfo
                icon="ecologyLeaf"
                label={
                    trip.estimated_carbon_footprint
                        ? formatNumber(trip.estimated_carbon_footprint, {
                              maximumFractionDigits: 2,
                          }) +
                          " " +
                          t("components.carbonFootprint.unit")
                        : "--"
                }
            />
        </Flex>
    );
}
