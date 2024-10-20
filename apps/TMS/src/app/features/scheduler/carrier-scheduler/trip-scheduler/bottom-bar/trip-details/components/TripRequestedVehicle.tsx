import {Box, ClickableUpdateRegion} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {DataInfo} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/generic/DataInfo";
import {SelectRequestedVehicleModal} from "app/features/transport/transport-details/transport-details-activities/SelectRequestedVehicleModal";
import {TripTransport} from "app/features/trip/trip.types";

type Props = {
    transports: TripTransport[];
    editable: boolean;
};
export function TripRequestedVehicle({transports, editable}: Props) {
    const [isOpen, open, close] = useToggle();
    const requestedVehicleLabel = transports
        .map((t) => t.requested_vehicle?.label)
        .filter((v) => !!v)
        .join(" - ");

    return (
        <Box width="fit-content" minWidth="400px">
            <ClickableUpdateRegion
                clickable={editable && transports.length === 1}
                onClick={open}
                data-testid="edit-requested-vehicle"
            >
                <DataInfo icon="truck" label={requestedVehicleLabel} />
            </ClickableUpdateRegion>
            {isOpen && (
                <SelectRequestedVehicleModal
                    transportUid={transports[0].uid}
                    isModifyingFinalInfo={false}
                    requestedVehicle={transports[0].requested_vehicle}
                    onClose={close}
                />
            )}
        </Box>
    );
}
