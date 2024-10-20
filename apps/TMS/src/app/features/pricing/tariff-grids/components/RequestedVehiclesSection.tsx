import {t} from "@dashdoc/web-core";
import {BadgeList, Callout, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {EditRequestedVehiclesAction} from "app/features/pricing/tariff-grids/actions/EditRequestedVehiclesAction";
import {ShowMoreRequestedVehiclesAction} from "app/features/pricing/tariff-grids/actions/ShowMoreRequestedVehiclesAction";

import {TariffGrid, TariffGridRequestedVehicle} from "../types";

interface Props {
    tariffGrid: TariffGrid;
    onChange: (value: TariffGridRequestedVehicle[]) => void;
}

export function RequestedVehiclesSection({tariffGrid, onChange}: Props) {
    return (
        <Flex data-testid="tariff-grid-requested-vehicle-section" flexDirection="column" p={3}>
            <Text variant="h1" mb={3}>
                {t("components.requestedVehicle")}
            </Text>

            {tariffGrid.requested_vehicles.length > 0 ? (
                <BadgeList
                    isMultiLine={true}
                    values={tariffGrid.requested_vehicles.map(({label}) => label).slice(0, 4)}
                    showMoreButton={
                        <ShowMoreRequestedVehiclesAction
                            requestedVehicles={tariffGrid.requested_vehicles}
                        />
                    }
                    data-testid="tariff-grid-requested-vehicles-badges"
                />
            ) : (
                <Callout iconDisabled>{t("tariffGrids.noRequestedVehicle")}</Callout>
            )}

            <EditRequestedVehiclesAction tariffGrid={tariffGrid} onChange={onChange} />
        </Flex>
    );
}
