import {Meta, Story} from "@storybook/react/types-6-0";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React from "react";

import {CarbonFootprintProvider} from "app/features/transport/transport-information/carbon-footprint/CarbonFootprintContext";
import {
    CarbonFootprintModal as CarbonFootprintModalComponent,
    EditableCarbonFootprintModalContent as EditableCarbonFootprintModalContentComponent,
    ReadOnlyCarbonFootprintModalContent as ReadOnlyCarbonFootprintModalContentComponent,
} from "app/features/transport/transport-information/carbon-footprint/CarbonFootprintModal";
import {aTransport} from "app/services/transport/__mocks__/transportMocks";

import {withReduxStore} from "../../../../../../../.storybook/decorators";

import type {Transport} from "app/types/transport";

type Args = {
    readOnly: boolean;
    manualEmissionValue: null;
    methodUsed: TransportCarbonFootprintResponse["estimated_method"]["method_used"];
    errors: TransportCarbonFootprintResponse["estimated_method"]["errors"][0]["error_type"][];
    isUsingExpiredEmissionRate: boolean;
};

export default {
    title: "app/features/carbon-footprint",
    component: CarbonFootprintModalComponent,
    args: {
        readOnly: false,
        manualEmissionValue: null,
        methodUsed: "iso.14083:2023",
        errors: [],
        isUsingExpiredEmissionRate: false,
    } as Args,
    argTypes: {
        methodUsed: {
            control: {
                type: "select",
                options: ["iso.14083:2023", "dashdoc.shipper", "dashdoc.legacy"],
            },
        },
        errors: {
            control: {
                type: "check",
                options: [
                    "weight_missing",
                    "distance_not_found",
                    "missing_address",
                    "address_without_geo_coords",
                ],
            },
        },
        manualEmissionValue: {
            control: {
                type: "number",
                nullable: true,
            },
        },
    },
} as Meta;

export const SuccessfulComputation: Story<Omit<Args, "errors">> = ({
    readOnly,
    manualEmissionValue,
    methodUsed,
    isUsingExpiredEmissionRate,
}) => {
    const computation: TransportCarbonFootprintResponse = {
        manual_method: {
            emission_value: manualEmissionValue,
        },
        estimated_method: {
            emission_rate: 0.115,
            emission_value: 3043.6,
            method_used: methodUsed,
            errors: [],
            is_using_expired_emission_rate: isUsingExpiredEmissionRate,
            emissions_by_source: {
                own_fleet: {
                    emission_value: 3000,
                    hub_emission_value: 21.1,
                    distance: 100,
                    tonne_kilometer: 200,
                    emission_rate: 0.1,
                },
                requested_vehicle: {
                    emission_value: 32.1,
                },
                carrier_data: {
                    emission_value: 11.5,
                },
            },
        },
    };

    if (readOnly) {
        return (
            <CarbonFootprintProvider transport={aTransport} refreshCarbonFootprint={() => {}}>
                <ReadOnlyCarbonFootprintModalContentComponent
                    transport={{...aTransport, requested_vehicle: {label: "Tractor"}} as Transport}
                    onClose={() => {}}
                    computation={computation}
                    refreshCarbonFootprint={async () => {}}
                />
            </CarbonFootprintProvider>
        );
    }
    return (
        <CarbonFootprintProvider transport={aTransport} refreshCarbonFootprint={() => {}}>
            <EditableCarbonFootprintModalContentComponent
                transport={{...aTransport, requested_vehicle: {label: "Tractor"}} as Transport}
                onClose={() => {}}
                computation={computation}
                refreshCarbonFootprint={async () => {}}
            />
        </CarbonFootprintProvider>
    );
};

SuccessfulComputation.parameters = {
    controls: {exclude: ["errors"]},
};
SuccessfulComputation.decorators = [
    withReduxStore({
        account: {
            company: {
                pk: aTransport?.carrier_address?.company.pk,
                managed_by_name: null,
                name: "On the road SARL",
            },
            groupViews: [],
        },
    }),
];

export const FailedComputation: Story<Omit<Args, "methodUsed">> = ({
    readOnly,
    manualEmissionValue,
    errors,
}) => {
    const mockedComputation: TransportCarbonFootprintResponse = {
        manual_method: {
            emission_value: manualEmissionValue,
        },
        estimated_method: {
            errors: errors.map((error) => ({
                error_type: error,
                activity_uid: aTransport.deliveries[0].origin.uid,
                address_id: aTransport.deliveries[0].origin.address?.pk,
            })) as TransportCarbonFootprintResponse["estimated_method"]["errors"],
            emission_rate: null,
            emission_value: null,
            is_using_expired_emission_rate: false,
            method_used: "iso.14083:2023",
            emissions_by_source: {
                own_fleet: {
                    emission_value: null,
                    hub_emission_value: null,
                    distance: null,
                    tonne_kilometer: null,
                    emission_rate: null,
                },
                requested_vehicle: {
                    emission_value: null,
                },
                carrier_data: {
                    emission_value: null,
                },
            },
        },
    };

    if (readOnly) {
        return (
            <ReadOnlyCarbonFootprintModalContentComponent
                transport={{...aTransport, requested_vehicle: {label: "Tractor"}} as Transport}
                onClose={() => {}}
                computation={mockedComputation}
                refreshCarbonFootprint={async () => {}}
            />
        );
    }
    return (
        <EditableCarbonFootprintModalContentComponent
            transport={{...aTransport, requested_vehicle: {label: "Tractor"}} as Transport}
            onClose={() => {}}
            computation={mockedComputation}
            refreshCarbonFootprint={async () => {}}
        />
    );
};

FailedComputation.parameters = {
    controls: {exclude: ["methodUsed", "isUsingExpiredEmissionRate"]},
};
