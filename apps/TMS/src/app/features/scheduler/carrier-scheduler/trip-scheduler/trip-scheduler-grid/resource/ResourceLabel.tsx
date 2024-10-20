import {Flex} from "@dashdoc/web-ui";
import React from "react";

import TruckerLabel from "app/features/fleet/trucker/TruckerLabel";
import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {
    TripResource,
    TripSchedulerView,
    TruckerForScheduler,
    VehicleOrTrailerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

export function ResourceLabel({
    resource,
    view,
    displayLinkedResources,
}: {
    resource: TripResource;
    view: TripSchedulerView | CharteringView | DedicatedResourcesView;
    displayLinkedResources: boolean;
}) {
    switch (view) {
        case "trucker": {
            const trucker = resource as TruckerForScheduler;
            const linkedVehicle = trucker.means_combination?.vehicle;
            const linkedTrailer = trucker.means_combination?.trailer;
            const name = `${trucker.user?.last_name} ${trucker.user?.first_name}`;
            return (
                <>
                    {name}
                    {displayLinkedResources ? (
                        <Flex flexWrap="wrap" mt={1} data-testid="resource-linked-means">
                            {linkedVehicle && (
                                <VehicleLabel vehicle={linkedVehicle} icon="truck" fontSize={0} />
                            )}
                            {linkedTrailer && (
                                <VehicleLabel
                                    vehicle={linkedTrailer}
                                    icon="trailer"
                                    fontSize={0}
                                />
                            )}
                        </Flex>
                    ) : null}
                </>
            );
        }
        case "vehicle": {
            const vehicle = resource as VehicleOrTrailerForScheduler;
            const linkedTrailer = vehicle.means_combination?.trailer;
            const linkedTrucker = vehicle.means_combination?.trucker;
            return (
                <>
                    <VehicleLabel vehicle={vehicle} flexWrap="wrap" fontSize="inherit" />
                    {displayLinkedResources ? (
                        <Flex flexWrap="wrap" mt={1} data-testid="resource-linked-means">
                            {linkedTrucker ? (
                                <TruckerLabel text={linkedTrucker.display_name} />
                            ) : null}
                            {linkedTrailer ? (
                                <VehicleLabel
                                    vehicle={linkedTrailer}
                                    icon="trailer"
                                    fontSize={0}
                                    alignItems="center"
                                />
                            ) : null}
                        </Flex>
                    ) : null}
                </>
            );
        }
        case "trailer": {
            const trailer = resource as VehicleOrTrailerForScheduler;
            const linkedVehicle = trailer.means_combination?.vehicle;
            const linkedTrucker = trailer.means_combination?.trucker;
            return (
                <>
                    <VehicleLabel vehicle={trailer} flexWrap="wrap" fontSize="inherit" />
                    {displayLinkedResources ? (
                        <Flex flexWrap="wrap" mt={1} data-testid="resource-linked-means">
                            {linkedTrucker ? (
                                <TruckerLabel text={linkedTrucker.display_name} />
                            ) : null}
                            {linkedVehicle ? (
                                <VehicleLabel
                                    vehicle={linkedVehicle}
                                    icon="truck"
                                    fontSize={0}
                                    alignItems="center"
                                />
                            ) : null}
                        </Flex>
                    ) : null}
                </>
            );
        }
    }
    return null;
}
