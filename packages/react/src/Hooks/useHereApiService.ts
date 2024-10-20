import H from "@here/maps-api-for-javascript";
import {useMemo} from "react";

import {HereApiKey} from "../constants/constants";

export type SearchMode = "discover" | "autocomplete" | "geocode";

export const useHereApiService = () => {
    const searchService = useMemo(() => {
        const platform = new H.service.Platform({
            apikey: HereApiKey as string,
        });
        return platform.getSearchService();
    }, []);

    const hereAutoCompleteBaseUrl = new URL(
        "https://autocomplete.search.hereapi.com/v1/autocomplete"
    );
    hereAutoCompleteBaseUrl.searchParams.set("xnlp", "CL_JSMv3.1.46.0");
    hereAutoCompleteBaseUrl.searchParams.set("apikey", HereApiKey);

    const autoComplete = async (params: H.service.ServiceParameters) => {
        Object.entries(params).forEach(([key, value]) => {
            hereAutoCompleteBaseUrl.searchParams.set(key, value);
        });

        return await fetch(hereAutoCompleteBaseUrl, {
            method: "GET",
            cache: "no-cache",
        });
    };

    const search = async (
        mode: SearchMode,
        params: H.service.ServiceParameters,
        onResult: (result: Object) => void,
        onError: (error: Error) => void
    ) => {
        if (mode === "autocomplete") {
            try {
                const result = await autoComplete(params);
                const json = await result.json();
                onResult(json);
            } catch (error) {
                onError(error);
            }
        } else {
            searchService[mode](params, onResult, onError);
        }
    };

    return {search};
};
