import {t} from "@dashdoc/web-core";
import {Box, ClickableUpdateRegion, Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {TruckerIndicator} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/indicator/TruckerIndicator";
import {VehicleIndicator} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/indicator/VehicleIndicator";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {PlanAction} from "app/features/transportation-plan/plan-or-subcontract/plan/PlanAction";
import {canEditTripMeans} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";

import {DataInfo} from "../../generic/DataInfo";

type Props = {
    trip: CompactTrip;
    view: TripSchedulerView;
    editable: boolean;
};
export function TripMeans({trip, view, editable}: Props) {
    const [isEditing, openEdition, closeEdition] = useToggle();

    const means = {
        trucker: trip.trucker,
        trailer: trip.trailer,
        vehicle: trip.vehicle,
    };
    const truckerLabel = <TruckerIndicator trucker={trip.trucker} withWarning />;
    const vehicleLabel = <VehicleIndicator vehicle={trip.vehicle} withWarning />;
    const trailerLabel = trip.trailer?.license_plate ? (
        <VehicleLabel
            color="grey.dark"
            vehicle={{
                license_plate: trip.trailer.license_plate,
                fleet_number: trip.trailer.fleet_number,
            }}
        />
    ) : (
        t("components.noTrailer")
    );
    return (
        <>
            <Box width="fit-content" minWidth="400px" my={-1}>
                <ClickableUpdateRegion
                    clickable={editable && canEditTripMeans(trip)}
                    onClick={openEdition}
                    data-testid="edit-trip-means"
                >
                    <Flex style={{gap: "12px"}}>
                        {view !== "trucker" && <DataInfo icon="trucker" label={truckerLabel} />}
                        {view !== "vehicle" && <DataInfo icon="truck" label={vehicleLabel} />}
                        {view !== "trailer" && <DataInfo icon="trailer" label={trailerLabel} />}
                    </Flex>
                </ClickableUpdateRegion>
            </Box>
            {isEditing && (
                <PlanAction
                    means={means}
                    disabled={trip.is_prepared}
                    sentToTrucker={trip.trucker_status === "trucker_assigned"}
                    tripUid={trip.uid}
                    onClose={closeEdition}
                    forceEdit
                    hideEditionField={view}
                />
            )}
        </>
    );
}
