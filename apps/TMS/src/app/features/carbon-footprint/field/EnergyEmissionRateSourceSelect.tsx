import {t} from "@dashdoc/web-core";
import {Flex, Select, SelectOption, Text} from "@dashdoc/web-ui";
import {FuelType, formatNumber} from "dashdoc-utils";
import React from "react";

import {carbonFootprintConstants} from "app/services/carbon-footprint/constants.service";
import {GenericFuelEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";
import {fuelTypeService} from "app/services/transport/fuelType.service";

function EmissionRateSourceOption({emissionRate, fuel}: {emissionRate: number; fuel: FuelType}) {
    const unit = fuelTypeService.getFuelUnits(fuel).emissionRateUnit;
    return (
        <Flex flexDirection="column" className="option-wrapper">
            <Text color="inherit" mr={2}>
                {fuelTypeService.translateFuelType(fuel)}
            </Text>
            <Text
                flex={1}
                color="inherit"
                variant="caption"
                className="hide-under-value-container"
            >
                {formatNumber(emissionRate, {
                    maximumFractionDigits: carbonFootprintConstants.emissionRateMaxDigits,
                })}{" "}
                {unit}
            </Text>
        </Flex>
    );
}

type Props = {
    error?: string;
    onChange: (value: FuelType | null) => void;
    emissionRates: Record<FuelType, GenericFuelEmissionRate>;
    value?: FuelType | null;
} & Omit<Parameters<typeof Select>[0], "value" | "onChange">;

export function EnergyEmissionRateSourceSelect({
    error,
    emissionRates,
    onChange,
    value,
    ...props
}: Props) {
    const fuelOptions = fuelTypeService.getFuelTypeSelectOptions();
    return (
        <Select
            label={t("common.primaryEnergy")}
            error={error}
            options={fuelOptions}
            formatOptionLabel={({value: fuel}: SelectOption<FuelType>) => {
                if (!fuel) {
                    return null;
                }
                return (
                    <EmissionRateSourceOption
                        fuel={fuel}
                        emissionRate={emissionRates[fuel].value}
                    />
                );
            }}
            onChange={(option: SelectOption<FuelType>) => onChange(option?.value ?? null)}
            value={fuelOptions.find((option) => option.value === value) || null}
            placeholder={t("common.fuel_type.placeholder")}
            styles={{
                valueContainer: (provided) => ({
                    ...provided,
                    "& .hide-under-value-container": {
                        display: "none",
                    },
                }),
                menu: (provided) => ({
                    ...provided,
                    maxHeight: "400px",
                }),
            }}
            {...props}
        />
    );
}
