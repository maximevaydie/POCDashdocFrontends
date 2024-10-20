import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Text} from "@dashdoc/web-ui";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React from "react";

import {
    TransportOperationCategoryOption,
    TransportOperationCategorySelect,
} from "app/features/carbon-footprint/transport-operation-category/TransportOperationCategorySelect";

import {useCarbonFootprintContext} from "./CarbonFootprintContext";

interface CarbonFootprintEmissionsBySourceProps {
    emissions_by_source: TransportCarbonFootprintResponse["estimated_method"]["emissions_by_source"];
}

export const CarbonFootprintEmissionsBySource: React.FC<CarbonFootprintEmissionsBySourceProps> = ({
    emissions_by_source,
}) => {
    const {
        canEditTransportOperationCategory,
        transportOperationCategory,
        onChangeTransportOperationCategory,
        refreshCarbonFootprint,
    } = useCarbonFootprintContext();

    return (
        <Box flex={1}>
            <Text variant="h1" color="grey.ultradark" mb={5}>
                {t("carbonFootprint.calculationDetails")}
            </Text>
            <Box>
                {emissions_by_source.own_fleet && (
                    <Box>
                        <Flex justifyContent="space-between" alignItems="center" mb={3}>
                            <Text variant="h2" color="grey.dark">
                                {emissions_by_source.own_fleet.emission_value}{" "}
                                {t("components.carbonFootprint.unit")}
                            </Text>
                            <Badge variant="blue">{t("carbonFootprint.ownFleet")}</Badge>
                        </Flex>

                        <ul>
                            {emissions_by_source.own_fleet.distance !== null && (
                                <li>
                                    {t("carbonFootprint.totalDistance")}:{" "}
                                    {emissions_by_source.own_fleet.distance}{" "}
                                    {t("pricingMetrics.unit.distance.short")}
                                </li>
                            )}
                            {emissions_by_source.own_fleet.tonne_kilometer !== null && (
                                <li>
                                    {t("carbonFootprint.tonnekilometer")}:{" "}
                                    {emissions_by_source.own_fleet.tonne_kilometer}{" "}
                                    {t("carbonFootprint.tonnekilometerUnit")}
                                </li>
                            )}
                            {emissions_by_source.own_fleet.emission_rate !== null && (
                                <li>
                                    {t("carbonFootprint.emissionRate")}:{" "}
                                    {emissions_by_source.own_fleet.emission_rate}{" "}
                                    {t("components.carbonFootprint.unit")}
                                </li>
                            )}
                            {emissions_by_source.own_fleet.hub_emission_value !== null &&
                                emissions_by_source.own_fleet.hub_emission_value !== 0 && (
                                    <li>
                                        {t("carbonFootprint.total_emission_value_hub_operations")}:{" "}
                                        {emissions_by_source.own_fleet.hub_emission_value}{" "}
                                        {t("components.carbonFootprint.unit")}
                                    </li>
                                )}
                        </ul>
                        {canEditTransportOperationCategory && (
                            <Flex flex={1} maxWidth="300px" mr={4} mb={4}>
                                <Box width="100%">
                                    <TransportOperationCategorySelect
                                        value={transportOperationCategory}
                                        onChange={(category: TransportOperationCategoryOption) => {
                                            onChangeTransportOperationCategory(category);
                                            refreshCarbonFootprint &&
                                                refreshCarbonFootprint({
                                                    transportOperationCategory: category,
                                                });
                                        }}
                                        onSetDefaultValue={onChangeTransportOperationCategory}
                                    />
                                </Box>
                            </Flex>
                        )}
                    </Box>
                )}
                {emissions_by_source.carrier_data && (
                    <Box>
                        <Flex justifyContent="space-between" alignItems="center" mb={3}>
                            <Text variant="h2" color="grey.dark">
                                {emissions_by_source.carrier_data.emission_value}{" "}
                                {t("components.carbonFootprint.unit")}
                            </Text>
                            <Badge variant="turquoise">
                                {t("carbonFootprint.charteredCarrierData")}
                            </Badge>
                        </Flex>
                    </Box>
                )}
                {emissions_by_source.requested_vehicle && (
                    <Box>
                        <Flex justifyContent="space-between" alignItems="center" mb={3}>
                            <Text variant="h2" color="grey.dark">
                                {emissions_by_source.requested_vehicle.emission_value}{" "}
                                {t("components.carbonFootprint.unit")}
                            </Text>
                            <Badge variant="pink">
                                {t("carbonFootprint.requestedVehicleData")}
                            </Badge>
                        </Flex>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
