import {guid} from "@dashdoc/core";
import {Logger, queryService} from "@dashdoc/web-core";
import {RequestOptions} from "dashdoc-utils/dist/api/scopes/ApiScope";
import flatten from "lodash.flatten";
import map from "lodash.map";
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from "react";

import {apiService} from "../services/api.service";

type State<T> = {
    bucket: string;
    items: T[];
    hasNext: boolean;
    isLoading: boolean;
    page: number;
    totalCount: number | undefined;
    hash: string;
    loadAllActivated: boolean;
};

function createInitialState<T>(bucket: string, forceRefresh = false): State<T> {
    return {
        bucket,
        items: [] as T[],
        /* let `loadSeveralPagesItems` decide the new hasNext */
        hasNext: false,
        isLoading: true,
        page: 1,
        totalCount: undefined as number | undefined,
        hash: forceRefresh ? guid() : "_",
        loadAllActivated: false,
    };
}

/**
 * Interface for paginated results sur as those obtained via `usePaginatedFetch`:
 * -    `items:`: the list of items that were loaded
 * -    `hasNext`: is there another page to load
 * -    `isLoading`: are we currently loading a page
 * -    `loadNext`: function to call to trigger the loading of the next page
 * -    `loadAll`: function to call to trigger the loading of all the next pages
 * -    `totalCount`: the total number of items
 * -    `reload` function to call to reload the elements
 */
export interface PaginatedResult<T> {
    items: T[];
    hasNext: boolean;
    isLoading: boolean;
    loadNext: () => void;
    loadAll: () => void;
    totalCount: number;
    reload: (reset?: boolean) => void;
    updateItems: (updatedItems: T[]) => void;
}

/**
 * Hook for fetching data in pages
 * @param url The URL to fetch from
 * @param params The URL params
 * @returns {items: T[]; hasNext: boolean; isLoading: boolean, loadNext: () => void}
 * @returns {Object.items} dict the items that were loaded
 * @returns {Object.hasNext} is there another page to load
 * @returns {Object.isLoading} are we currently loading a page
 * @returns {Object.loadNext} function to call to trigger the loading of the next page
 * @returns {Object.loadAll} function to call to trigger the loading of all the next pages
 * @returns {Object.totalCount} the total number of items
 * @returns {Object.reload} function to call to reload the elements fetched
 **/
export function usePaginatedFetch<T>(
    url: string,
    params: Record<string, any>,
    requestOptions: RequestOptions = {apiVersion: "v4"}
): PaginatedResult<T> {
    // we identify items in a "bucket" to make sure there is no race condition when we change the url
    const bucket = `${url}?${queryService.toQueryString(params)}`;
    const [state, setState] = useState<State<T>>(() => createInitialState<T>(bucket));
    const {items, hasNext, isLoading, page, totalCount} = state;

    const path = `${url}?${queryService.toQueryString({...params, page})}`;

    useEffect(() => {
        // This check prevents unnecessary calls to the API.
        if (state.bucket === bucket) {
            loadItems({
                bucket,
                path,
                hash: state.hash,
                requestOptions,
                setState,
            });
        } else {
            // We know that the bucket changed when the prevBucket is different from the bucket.
            setState(createInitialState<T>(bucket, true));
        }
        /** We ignore following deps :
         * state.bucket: we assume that the stored bucket could not change excepted if loadItems reset the state.
         * requestOptions: we assume that the apiVersion will not change during the lifecycle of the component.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, bucket, state.hash]);

    const loadNext = useCallback(() => {
        setState((prev) => {
            return prev.hasNext
                ? {
                      ...prev,
                      page: prev.page + 1,
                      /* let `loadSeveralPagesItems` decide the new hasNext */
                      hasNext: false,
                  }
                : prev;
        });
    }, []);

    const loadAll = useCallback(() => {
        setState((prev) =>
            prev.hasNext ? {...prev, page: prev.page + 1, loadAllActivated: true} : prev
        );
    }, []);

    const reload = (reset = true) => {
        if (reset) {
            setState(createInitialState<T>(bucket, true));
        } else {
            loadSeveralPagesItems({
                bucket,
                getPath,
                lastPage: page,
                hash: state.hash,
                requestOptions,
                setState,
            });
        }
    };

    return {
        items,
        hasNext,
        isLoading,
        loadNext,
        loadAll,
        // @ts-ignore
        totalCount,
        reload,
    };

    function getPath(page: number) {
        return `${url}?${queryService.toQueryString({...params, page})}`;
    }
}
/**
 * Load items from the API.
 *
 * 🐉🐉🐉🐉🐉🐉🐉🐉🐉
 *
 *  **Here be dragons**
 *
 * 🐉🐉🐉🐉🐉🐉🐉🐉🐉
 *
 * We need to be careful with the lifecycle of this hook.
 *
 * When this function is triggered, we:
 * -    set the state to loading
 * -    load items
 * -    update the state with the loaded items
 *
 *
 * When the `bucket` is updated by the hook user,
 * there is a diff between the `state.bucket` and the `bucket`.
 *
 * This diff could happen during the loadItems of before... anyway, we need to handle it:
 * - for each step of the loadItems, we check if the `bucket` is still the same
 * - if the `bucket` is not the same, we ignore the current and following steps
 * - we let the final setState reset the state. This reset will retrigger the loadItems with an aligned `bucket`.
 *
 * When the `bucket` evolved, we reset the state to the initial state (the loaded items does not match the `bucket` and should be purged).
 * The `bucket` can changed during a loadItems, this is why we check the `bucket` at each setState.
 * We stop everything when a diff is detected between the `bucket` and the `state.bucket`.
 * We let the final setState reset the state and retrigger this loadItems with a createInitialState.
 */
async function loadItems<T>({
    bucket,
    path,
    hash,
    requestOptions,
    setState,
}: {
    bucket: string;
    path: string;
    hash: string;
    requestOptions: RequestOptions;
    setState: Dispatch<SetStateAction<State<T>>>;
}) {
    setState((prev) => {
        // the bucket may changed during the loadItems
        if (prev.bucket === bucket) {
            return {...prev, isLoading: true};
        } else {
            // the bucket changed, ignore the current function and let the final setState reset the state.
            return prev;
        }
    });
    try {
        const response = await apiService.get(path, requestOptions);
        setState((prev) => {
            // the bucket may changed during the loadItems
            if (prev.bucket === bucket && prev.hash === hash) {
                return {
                    ...prev,
                    hasNext: !!response.next,
                    items: [...prev.items, ...response.results],
                    isLoading: false,
                    totalCount: response.count,
                    page: prev.loadAllActivated && !!response.next ? prev.page + 1 : prev.page,
                };
            } else {
                // the bucket changed, ignore the current function and let the final setState reset the state.
                return prev;
            }
        });
        // else
        // ignore the current and following steps
    } catch (e) {
        Logger.error(e);
        setState((prev) => {
            // the bucket may changed during the loadItems
            if (prev.bucket === bucket) {
                return {...prev, isLoading: false, loadAllActivated: false};
            } else {
                // the bucket changed, ignore the current function and let the final setState reset the state.
                return prev;
            }
        });
    }
    // reset the state when the persisted bucket is not the same as the bucket in the state.
    setState((prev) => {
        if (prev.bucket !== bucket) {
            // the bucket changed, reset the state.
            return createInitialState<T>(bucket, true);
        } else {
            return prev;
        }
    });
}
async function loadSeveralPagesItems<T>({
    bucket,
    getPath,
    lastPage,
    hash,
    requestOptions,
    setState,
}: {
    bucket: string;
    getPath: (page: number) => string;
    lastPage: number;
    hash: string;
    requestOptions: RequestOptions;
    setState: Dispatch<SetStateAction<State<T>>>;
}) {
    setState((prev) => {
        // the bucket may changed during the loadItems
        if (prev.bucket === bucket) {
            return {...prev, isLoading: true};
        } else {
            // the bucket changed, ignore the current function and let the final setState reset the state.
            return prev;
        }
    });

    Promise.all(
        Array.from({length: lastPage}, (_, i) => 1 + i).map((p) => {
            return apiService.get(getPath(p), requestOptions);
        })
    )
        .then((responses) => {
            const items = flatten(map(responses, "results"));
            const lastResponse = responses[responses.length - 1];

            setState((prev) => {
                // the bucket may changed during the loadItems
                if (prev.bucket === bucket && prev.hash === hash) {
                    return {
                        ...prev,
                        hasNext: !!lastResponse.next,
                        items: items,
                        isLoading: false,
                        totalCount: lastResponse.count,
                        page: lastPage,
                    };
                } else {
                    // the bucket changed, ignore the current function and let the final setState reset the state.
                    return prev;
                }
            });
        })
        .catch((e) => {
            Logger.error(e);
            setState((prev) => {
                // the bucket may changed during the loadItems
                if (prev.bucket === bucket) {
                    return {...prev, isLoading: false, loadAllActivated: false};
                } else {
                    // the bucket changed, ignore the current function and let the final setState reset the state.
                    return prev;
                }
            });
        });
}
