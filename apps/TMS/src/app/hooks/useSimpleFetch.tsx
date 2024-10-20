import {apiService} from "@dashdoc/web-common";
import {APIVersion} from "dashdoc-utils";
import {useEffect, useState} from "react";

export default function useSimpleFetch<ReturnType = any>(
    url: string,
    additionalDependencies: Array<unknown> = [],
    apiVersion?: APIVersion,
    initialState: ReturnType = {} as ReturnType,
    method: "GET" | "POST" = "GET"
) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [data, setData] = useState<ReturnType>(initialState);
    const [errorData, setErrorData] = useState<unknown>(null);

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            try {
                const response =
                    method === "GET"
                        ? await apiService.get(url, {apiVersion: apiVersion})
                        : await apiService.post(url, {}, {apiVersion: apiVersion});
                setData(response);
                setIsLoading(false);
            } catch (e) {
                try {
                    const errorData = await e.json();
                    setErrorData(errorData);
                } catch {
                    setErrorData(null);
                } finally {
                    setHasError(true);
                    setIsLoading(false);
                }
            }
        })();
    }, [url, ...additionalDependencies, apiVersion]);

    return {isLoading, hasError, data, errorData, setData};
}
