import {FuelType} from "dashdoc-utils";
import {useEffect, useState} from "react";

import {NullableFuelConsumption} from "app/features/carbon-footprint/types";
import {
    GenericFuelEmissionRate,
    genericEmissionRatesApiService,
} from "app/services/carbon-footprint/genericEmissionRateApi.service";

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

export const useFuelEmissionRates = () => {
    const [fuelEmissionRates, setEnergies] = useState<Record<
        FuelType,
        GenericFuelEmissionRate
    > | null>(null);

    useEffect(() => {
        async function fetchData() {
            const energies = await genericEmissionRatesApiService.getGenericFuelEmissionRates();
            setEnergies(energies.results);
        }

        fetchData();
    }, []);

    return {
        fuelEmissionRates,
        computeEmissionRate: (
            fuelConsumptions: NullableFuelConsumption[],
            totalTonneKilometers: number
        ) => {
            if (fuelEmissionRates === null) {
                return null;
            }

            return computeNewEmissionRate(
                fuelConsumptions,
                fuelEmissionRates,
                totalTonneKilometers
            );
        },
    };
};
