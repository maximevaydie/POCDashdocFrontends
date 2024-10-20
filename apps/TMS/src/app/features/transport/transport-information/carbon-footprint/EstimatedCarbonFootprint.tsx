import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React from "react";

import {CompleteComputationDetails} from "app/features/transport/transport-information/carbon-footprint/CompleteComputationDetails";
import {EmissionValueDescription} from "app/features/transport/transport-information/carbon-footprint/EmissionValueDescription";
import {FailedComputationDetails} from "app/features/transport/transport-information/carbon-footprint/FailedComputationDetails";

import type {Transport} from "app/types/transport";

type EstimatedCarbonFootprintProps = {
    transport: Transport;
    computation: TransportCarbonFootprintResponse;
    readOnly?: boolean;
    refreshCarbonFootprint: (params?: {
        distance?: number | null;
        transportOperationCategory?: Transport["transport_operation_category"];
    }) => Promise<void>;
    distanceOverride?: number | null;
    onDistanceOverrideChange?: (distance: number | null) => void;
};

export function EstimatedCarbonFootprint({
    transport,
    computation,
    readOnly,
    refreshCarbonFootprint,
    distanceOverride,
    onDistanceOverrideChange,
}: EstimatedCarbonFootprintProps) {
    if (computation.estimated_method.emission_value === null) {
        return (
            <>
                <EmissionValueDescription
                    computation={computation}
                    transport={transport}
                    useManualEmissionValueIfPossible={readOnly}
                    displayDescriptionOnFailure={readOnly}
                    refreshCarbonFootprint={refreshCarbonFootprint}
                />
                {!readOnly && (
                    <FailedComputationDetails
                        transport={transport}
                        errors={computation.estimated_method.errors}
                        distanceOverride={distanceOverride}
                        onDistanceOverrideChange={onDistanceOverrideChange}
                    />
                )}
            </>
        );
    }
    return (
        <>
            <EmissionValueDescription
                computation={computation}
                transport={transport}
                useManualEmissionValueIfPossible={readOnly}
                displayDescriptionOnFailure={readOnly}
                refreshCarbonFootprint={refreshCarbonFootprint}
            />
            <CompleteComputationDetails
                computation={computation.estimated_method}
                addSuccessMention={!readOnly}
                addExpiredEmissionRateMention={!readOnly}
            />
        </>
    );
}
