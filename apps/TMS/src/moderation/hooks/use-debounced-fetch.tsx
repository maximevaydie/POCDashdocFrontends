import debounce from "lodash.debounce";
import {useEffect, useRef, useState} from "react";

import {Api} from "../Api";

export function useDebouncedFetch(url: string, param: string) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState<any>(null);

    const debouncedGet = useRef(
        debounce(async (value: string) => {
            try {
                setIsLoading(true);
                const response = await Api.get(value, {basePath: "moderation", apiVersion: null});
                setData(response);
                setIsLoading(false);
            } catch (e) {
                setHasError(true);
                setIsLoading(false);
            }
        }, 500)
    );

    useEffect(() => {
        if (param === "") {
            return;
        }
        debouncedGet.current(url + param);
    }, [url, param]);

    return {isLoading, hasError, data};
}
