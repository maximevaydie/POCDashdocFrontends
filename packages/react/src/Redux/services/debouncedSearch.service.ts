import {queryService, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {APIVersion} from "dashdoc-utils";
import {flatten} from "lodash";
import debounce from "lodash.debounce";
import map from "lodash.map";
import memoize from "lodash.memoize";

import {apiService} from "../../services/api.service";

type OnSuccessCallback = (
    queryName: string,
    query: any,
    results: any,
    page: number | {fromPage: number; toPage: number},
    hasNextPage: boolean,
    count: number
) => any;
type OnErrorCallback = (queryName: string, query: any, error: any, page: number) => any;

async function handleQueryStringTooLongError(error: any) {
    const errorText = await error.text();

    if (errorText && errorText.search("Request Line is too large") !== -1) {
        toast.error(t("common.search.queryTooLong"));
    }
}

function makeRequest(
    baseUrl: string,
    query?: any,
    method: "GET" | "POST" = "GET",
    page?: number,
    apiVersion?: APIVersion
) {
    let url = baseUrl;
    const options = {
        apiVersion,
    };

    if (method === "GET") {
        if (query) {
            url += `?${queryService.toQueryString(query)}`;
            if (page) {
                url += `&page=${page}`;
            }
        } else if (page) {
            url += `?page=${page}`;
        }
        return apiService.get(url, options);
    }

    // If we're using POST, the query is passed in the filters key of the payload
    const filters = query ? {...query} : {};
    if (page) {
        filters.page = page;
    }
    const payload = {filters: queryService.cleanQuery(filters)};

    return apiService.post(url, payload, options);
}

// Call this function like this:
// debouncedSearch("/company-shipments/")(
//     queryName,
//     query,
//     page,
//     dispatch,
//     requestShipmentsSearchSuccess,
//     requestShipmentsSearchError
// );
// The first argument baseUrl is separated so the debounce is per-url
// (enabling us to call /vehicles/ and /trailers/ at the same time for instance)
function debouncedSearchFunction(baseUrl: string, apiVersion?: APIVersion) {
    return debounce(
        (
            queryName: string,
            query: any,
            page: number | {fromPage: number; toPage: number},
            dispatch: Function,
            onSuccess: OnSuccessCallback,
            onError: OnErrorCallback,
            method: "GET" | "POST" = "GET"
        ) => {
            if (!page) {
                return makeRequest(baseUrl, query, method, undefined, apiVersion).then(
                    (json: any) => {
                        let results = (json.results ?? []).map((result: Record<string, any>) => {
                            return {
                                ...result,
                                __partial: true,
                            };
                        });
                        // TODO: remove hack when endpoint will be paginated
                        if (baseUrl === "/scheduler/trips/") {
                            results = json;
                        }
                        return dispatch(
                            // @ts-ignore
                            onSuccess(queryName, query, results, null, null, json.count)
                        );
                    },
                    (error: any) => {
                        handleQueryStringTooLongError(error);

                        // @ts-ignore
                        return dispatch(onError(queryName, query, error, null));
                    }
                );
            } else if (typeof page === "number") {
                return makeRequest(baseUrl, query, method, page, apiVersion).then(
                    (json: any) => {
                        const results = (json.results ?? []).map((result: Record<string, any>) => {
                            return {
                                ...result,
                                __partial: true,
                            };
                        });
                        const hasNextPage = json.next !== null;
                        return dispatch(
                            onSuccess(queryName, query, results, page, hasNextPage, json.count)
                        );
                    },
                    (error: any) => {
                        handleQueryStringTooLongError(error);
                        return dispatch(onError(queryName, query, error, page));
                    }
                );
            } else {
                // get several pages data and update all state at once
                return Promise.all(
                    Array.from(
                        {length: page?.toPage - page?.fromPage + 1},
                        (_, i) => page?.fromPage + i
                    ).map((p) => {
                        return apiService
                            .get(`${baseUrl}?${queryService.toQueryString(query)}&page=${p}`, {
                                apiVersion,
                            })
                            .catch((error) => {
                                handleQueryStringTooLongError(error);
                                return {error: error};
                            });
                    })
                ).then(
                    (results: any) => {
                        const jsonResults = flatten(map(results, "results"));
                        const searchResults = jsonResults.map((result: Record<string, any>) => {
                            return {
                                ...result,
                                __partial: true,
                            };
                        });
                        let hasNextPage = null;
                        let lastFetchPage = 0;
                        let count;
                        results.map((result: any, i: number) => {
                            if (result && !result.error) {
                                count = result.count;
                                lastFetchPage = page?.fromPage + i;
                                hasNextPage = result?.next !== null;
                            }
                        });
                        if (lastFetchPage > 0) {
                            return dispatch(
                                onSuccess(
                                    queryName,
                                    query,
                                    searchResults,
                                    page,
                                    // @ts-ignore
                                    hasNextPage,
                                    count
                                )
                            );
                        }
                        return dispatch(
                            onError(queryName, query, results[0]?.error, page?.fromPage)
                        );
                    },
                    (error: any) => {
                        return dispatch(onError(queryName, query, error, page?.fromPage));
                    }
                );
            }
        },
        300
    );
}

// memoize so that calling debouncedSearch("/company-shipments/") twice yields the same function
export const debouncedSearch = memoize(debouncedSearchFunction);

type OnSuccessPartialCallback = (
    queryName: string,
    query: any,
    results: any,
    partialQuery: any
) => any;

function searchPartialFunction(baseUrl: string, apiVersion?: APIVersion) {
    return (
        queryName: string,
        query: any,
        partialQuery: any,
        dispatch: Function,
        onSuccess: OnSuccessPartialCallback,
        onError: OnErrorCallback
    ) => {
        return apiService
            .get(`${baseUrl}?${queryService.toQueryString({...query, ...partialQuery})}`, {
                apiVersion,
            })
            .then(
                (json: any) => {
                    let results = (json.results ?? []).map((result: Record<string, any>) => {
                        return {
                            ...result,
                            __partial: true,
                        };
                    });
                    // TODO: remove hack when endpoint will be paginated
                    if (baseUrl === "/scheduler/trips/") {
                        results = json;
                    }
                    return dispatch(onSuccess(queryName, query, results, partialQuery));
                },
                (error: any) => {
                    // @ts-ignore
                    return dispatch(onError(queryName, query, error, null));
                }
            );
    };
}

export const searchPartial = memoize(searchPartialFunction);
