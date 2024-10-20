import {useEffect, useState} from "react";

import {
    GenericVehicleEmissionRate,
    genericEmissionRatesApiService,
} from "app/services/carbon-footprint/genericEmissionRateApi.service";

export const useVehicleEmissionRateSourceOptions = (
    onLoaded: (
        default_generic_emission_rate_uid: string,
        sources: GenericVehicleEmissionRate[]
    ) => void
): {
    loading: boolean;
    emissionRateSources: GenericVehicleEmissionRate[];
} => {
    const [loading, setLoading] = useState(true);
    const [emissionRateSources, setEmissionRateSources] = useState<GenericVehicleEmissionRate[]>(
        []
    );

    useEffect(() => {
        setLoading(true);
        genericEmissionRatesApiService
            .getGenericVehicleEmissionRates()
            .then(({results, default_generic_emission_rate_uid}) => {
                setLoading(false);
                setEmissionRateSources(results);
                onLoaded(default_generic_emission_rate_uid, results);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        loading,
        emissionRateSources,
    };
};
