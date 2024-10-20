import {t} from "@dashdoc/web-core";
import {SelectOption} from "@dashdoc/web-ui";
import {FuelType} from "dashdoc-utils";

export type FuelUnits = {
    emissionRateUnit: string;
    quantityUnit: string;
};

// This has to be a function instead fo a constant as `t` is not initialized yet
function getTranslationMapping(): Record<FuelType, string> {
    return {
        GO: t("common.fuel_type.diesel"),
        CNG: t("common.fuel_type.compressed_natural_gas"),
        LNG: t("common.fuel_type.liquefied_natural_gas"),
        EL: t("common.fuel_type.electric"),
        BIO: t("common.fuel_type.bio"),
        BIOCNG: t("common.fuel_type.biogas"),
    };
}

function getFuelUnitsMapping(): Record<FuelType, FuelUnits> {
    return {
        GO: {
            emissionRateUnit: t("fuel.unit.kg_per_liter"),
            quantityUnit: t("fuel.unit.liter"),
        },
        CNG: {
            emissionRateUnit: t("fuel.unit.kg_per_kg"),
            quantityUnit: t("fuel.unit.kg"),
        },
        LNG: {
            emissionRateUnit: t("fuel.unit.kg_per_liter"),
            quantityUnit: t("fuel.unit.liter"),
        },
        EL: {
            emissionRateUnit: t("fuel.unit.kg_per_kwh"),
            quantityUnit: t("fuel.unit.kwh"),
        },
        BIO: {
            emissionRateUnit: t("fuel.unit.kg_per_liter"),
            quantityUnit: t("fuel.unit.liter"),
        },
        BIOCNG: {
            emissionRateUnit: t("fuel.unit.kg_per_kg"),
            quantityUnit: t("fuel.unit.kg"),
        },
    };
}

function fuelTypeToSelectOption(fuelType: FuelType): SelectOption<FuelType> {
    return {
        value: fuelType,
        label: translateFuelType(fuelType),
    };
}

function translateFuelType(fuelType: FuelType) {
    return getTranslationMapping()[fuelType];
}

function getFuelTypeList(): FuelType[] {
    return Object.keys(getTranslationMapping()) as FuelType[];
}

function getFuelTypeSelectOptions() {
    return getFuelTypeList().map(fuelTypeToSelectOption);
}

function getFuelUnits(fuelType: FuelType): FuelUnits {
    return getFuelUnitsMapping()[fuelType];
}

export const fuelTypeService = {
    translateFuelType,
    getFuelTypeList,
    getFuelTypeSelectOptions,
    getFuelUnits,
};
