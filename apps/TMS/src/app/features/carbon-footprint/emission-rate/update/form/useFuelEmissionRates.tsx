import {FuelType} from "dashdoc-utils";
import {useEffect, useState} from "react";

import {
    GenericFuelEmissionRate,
    genericEmissionRatesApiService,
} from "app/services/carbon-footprint/genericEmissionRateApi.service";

export const useFuelEmissionRates = () => {
    const [fuelEmissionRates, setFuelEmissionRates] = useState<Record<
        FuelType,
        GenericFuelEmissionRate
    > | null>(null);

    useEffect(() => {
        async function fetchData() {
            const energies = await genericEmissionRatesApiService.getGenericFuelEmissionRates();
            setFuelEmissionRates(energies.results);
        }

        fetchData();
    }, []);

    return fuelEmissionRates;
};
