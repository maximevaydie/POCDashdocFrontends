import {t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, NumberInput} from "@dashdoc/web-ui";
import {FuelType} from "dashdoc-utils";
import React from "react";

import {GenericFuelEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";
import {fuelTypeService} from "app/services/transport/fuelType.service";

import {EnergyEmissionRateSourceSelect} from "./EnergyEmissionRateSourceSelect";

type Props = {
    fuel: FuelType | null;
    quantity: number | null;

    fuelError?: string | string[];
    quantityError?: string | string[];

    onChange(fuel: FuelType | null, quantity: number | null): void;
    onDelete: (() => void) | null;

    fuelEmissionRates: Record<FuelType, GenericFuelEmissionRate>;
};

export function FuelTypeConsumptionInputs({
    fuel,
    quantity,
    fuelError,
    quantityError,
    onChange,
    fuelEmissionRates,
    onDelete,
}: Props) {
    const quantityUnit = fuel
        ? fuelTypeService.getFuelUnits(fuel).quantityUnit
        : t("fuel.unit.liter");
    return (
        <Flex>
            <Box width="50%" maxWidth="300px">
                <EnergyEmissionRateSourceSelect
                    required
                    onChange={(newFuel) => onChange(newFuel, quantity)}
                    emissionRates={fuelEmissionRates}
                    value={fuel}
                    error={fuelError ? t("common.field_required") : undefined}
                />
            </Box>
            <Box width="50%" maxWidth="200px" ml={4}>
                <NumberInput
                    required
                    min={0}
                    label={t("carbonFootprint.emissionRateModal.quantityLabel")}
                    units={quantityUnit}
                    value={quantity}
                    onChange={(newQuantity: number | null) => onChange(fuel, newQuantity)}
                    error={quantityError ? t("common.field_required") : undefined}
                />
            </Box>
            {onDelete ? (
                <Flex justifyContent="center" alignItems="center" ml={2}>
                    <IconButton
                        type="button"
                        name="bin"
                        fontSize={3}
                        color="grey.dark"
                        onClick={onDelete}
                    />
                </Flex>
            ) : (
                <Box ml={2} width="36px" />
            )}
        </Flex>
    );
}
