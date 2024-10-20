import {useCallback, useEffect, useState} from "react";

import {
    UpdateEmissionRateInformation,
    emissionRatesApiService,
} from "app/services/carbon-footprint/emissionRateApi.service";

export type Period = {
    start: Date;
    end: Date;
};

export const useCollectTonneKilometer = (emissionRateUid: string, defaultPeriod: Period) => {
    const [referencePeriod] = useState<Period>(defaultPeriod);

    const [collectResult, setCollectResult] = useState<UpdateEmissionRateInformation | null>(null);

    const fetchData = useCallback(async (emissionRateUid: string, referencePeriod: Period) => {
        setCollectResult(null);
        const collectResult = await emissionRatesApiService.collectInformationDeprecated(
            emissionRateUid,
            referencePeriod
        );
        setCollectResult(collectResult);
    }, []);

    useEffect(() => {
        fetchData(emissionRateUid, referencePeriod);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emissionRateUid]);

    return {
        collectLoading: collectResult === null,
        collectResult: collectResult ?? {
            tonne_kilometer: 0,
            transport_with_error_count: 0,
            transport_count: 0,
        },
        referencePeriod,
    };
};
