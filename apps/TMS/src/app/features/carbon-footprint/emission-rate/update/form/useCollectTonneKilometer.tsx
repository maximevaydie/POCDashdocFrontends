import {useEffect, useState} from "react";

import {
    UpdateEmissionRateInformation,
    emissionRatesApiService,
} from "app/services/carbon-footprint/emissionRateApi.service";

export function useCollectTonneKilometer(emissionRateUid: string, start: string, end: string) {
    const [collectResult, setCollectResult] = useState<UpdateEmissionRateInformation | null>(null);

    useEffect(() => {
        async function fetchData(emissionRateUid: string) {
            setCollectResult(null);
            const collectResult = await emissionRatesApiService.collectInformation(
                emissionRateUid,
                start,
                end
            );
            setCollectResult(collectResult);
        }
        fetchData(emissionRateUid);
    }, [emissionRateUid, start, end]);

    return {
        collectLoading: collectResult === null,
        collectResult: collectResult ?? {
            tonne_kilometer: 0,
            transport_with_error_count: 0,
            transport_count: 0,
        },
    };
}
