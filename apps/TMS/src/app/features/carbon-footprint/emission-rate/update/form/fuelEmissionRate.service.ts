import {FuelType} from "dashdoc-utils";

import {NullableFuelConsumption} from "app/features/carbon-footprint/types";
import {GenericFuelEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";

function computeTotalEmissionsFromEnergy(
    fuelConsumptions: NullableFuelConsumption[],
    emissionRatePerFuel: Record<FuelType, GenericFuelEmissionRate>
): number {
    return fuelConsumptions.reduce((total, {fuel, quantity}) => {
        if (fuel === null || quantity === null) {
            return total;
        }
        const emissionRate = emissionRatePerFuel[fuel].value;
        return total + emissionRate * quantity;
    }, 0);
}

function computeNewEmissionRate(
    fuelConsumptions: NullableFuelConsumption[],
    emissionRatePerFuel: Record<FuelType, GenericFuelEmissionRate>,
    totalTonneKilometers: number
): number | null {
    const totalEmissionsFromEnergy = computeTotalEmissionsFromEnergy(
        fuelConsumptions,
        emissionRatePerFuel
    );

    if (totalTonneKilometers === 0 || totalEmissionsFromEnergy === 0) {
        return null;
    }

    return totalEmissionsFromEnergy / totalTonneKilometers;
}

export const fuelEmissionRatesService = {
    computeNewEmissionRate,
};
