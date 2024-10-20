import {Flex, Box, HorizontalLine} from "@dashdoc/web-ui";
import {uniqBy} from "lodash";
import React from "react";

import {TripRequestedVehicle} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/components/TripRequestedVehicle";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {CompactTrip, TripTransport} from "app/features/trip/trip.types";

import {DataInfo} from "../../generic/DataInfo";

import {TripData} from "./TripData";
import {TripInstructions} from "./TripInstructions";
import {TripMeans} from "./TripMeans";
import {TripTags} from "./TripTags";

export function TransportInformation({
    trip,
    view,
    editable,
}: {
    trip: CompactTrip;
    view: TripSchedulerView;
    editable: boolean;
}) {
    const transports = uniqBy(
        trip.activities.flatMap((a) => a.transports).filter((t) => t !== null) as TripTransport[],
        (t) => t.uid
    );

    return (
        <Flex p={2} flex={1} overflowY="auto">
            <Box flex={1} borderRight="1px solid" borderColor="grey.light" mr={4} pr={4}>
                <TripData trip={trip} />
            </Box>
            <Flex flex={6} flexDirection="column" style={{gap: "8px"}}>
                <DataInfo
                    icon="shipper"
                    label={transports
                        .map((t) => t.shipper?.name)
                        .filter((n) => !!n)
                        .join(" - ")}
                />
                <DataInfo
                    icon="tag"
                    label={<TripTags transports={transports} editable={editable} />}
                />
                <HorizontalLine marginY={1} />

                <TripRequestedVehicle transports={transports} editable={editable} />
                <TripMeans trip={trip} view={view} editable={editable} />

                <TripInstructions
                    transports={transports}
                    editable={editable}
                    tripStatus={trip.status}
                />
            </Flex>
        </Flex>
    );
}
