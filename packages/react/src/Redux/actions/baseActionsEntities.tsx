import {queryService} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {APIVersion} from "dashdoc-utils";
import {normalize, schema} from "normalizr";

import {apiService} from "../../services/api.service";
import {debouncedSearch, searchPartial} from "../services/debouncedSearch.service";
import {
    ErrorMessage,
    RequestError,
    SuccessMessage,
    getErrorMessage,
    getSuccessMessage,
} from "../utils";

/*
 * TODO:
 * - Replace `dispatch` types by redux `Dispatch<S>`, where S should be our redux' state definition (TBD)
 */

// @guidedtour[epic=redux, seq=13] Base actions for entities
// We define here the same base actions as in `base-actions.tsx`, but for entities where we use normalizr.
// The normalizr schema is passed as a parameter to the helpers.

async function handleError({
    error,
    errorMessage,
    errorAction,
    dispatch,
    action,
    objName,
    toastId = "error-toast",
    showToast = true,
}: {
    error: RequestError;
    errorMessage?: ErrorMessage | undefined;
    errorAction: (
        action: string | undefined,
        objName: string,
        error: RequestError | undefined
    ) => any;
    dispatch: Function;
    action: string | undefined;
    objName: string;
    toastId?: string;
    showToast?: boolean;
}) {
    if (showToast) {
        toast.error(await getErrorMessage(error, errorMessage), {toastId});
    }

    dispatch(errorAction(action, objName, error));
    throw error;
}

function baseAction(action: string, objName: string, obj: any) {
    return {
        type: `${action}_${objName.toUpperCase()}`,
        [objName]: obj,
    };
}

function getAction(action: string, uid: string | number, objName?: string) {
    return {
        type: `${action.toUpperCase()}_${objName ? objName.toUpperCase() : "ENTITIES"}`,
        uid,
    };
}

function searchAction(
    _action: string,
    _objName: string,
    queryName: string,
    query: any,
    page: number | {fromPage: number; toPage: number}
) {
    return {
        type: "SEARCH_ENTITIES",
        query,
        queryName,
        page,
    };
}

export function searchPartialAction(queryName: string, query: any) {
    return {
        type: "SEARCH_PARTIAL_ENTITIES",
        query,
        queryName,
    };
}
export function resetSearchAction(queryName: string, query: any) {
    return {
        type: "RESET_SEARCH_RESULTS",
        query,
        queryName,
    };
}
function searchPartialActionByUid(
    _action: string,
    _objName: string,
    queryName: string,
    query: any,
    partialQuery: any
) {
    return {
        type: "SEARCH_PARTIAL_ENTITIES_BY_UID",
        query,
        queryName,
        partialQuery,
    };
}

function searchSuccessAction(
    queryName: string,
    query: any,
    response: any,
    page: number | {fromPage: number; toPage: number},
    hasNextPage: boolean,
    count: number
) {
    return {
        type: "SEARCH_ENTITIES_SUCCESS",
        response,
        query,
        queryName,
        page,
        hasNextPage,
        count,
        receivedAt: Date.now(),
    };
}

export function searchErrorAction(queryName: string, query: any, error: any) {
    return {
        type: "SEARCH_ENTITIES_ERROR",
        error,
        queryName,
        query,
    };
}
export function searchPartialSuccessAction(queryName: string, query: any, response: any) {
    return {
        type: "SEARCH_PARTIAL_ENTITIES_SUCCESS",
        response,
        query,
        queryName,
        receivedAt: Date.now(),
    };
}
function searchByUidsSuccessAction(queryName: string, query: any, response: any, uids: string[]) {
    return {
        type: "SEARCH_BY_UIDS_ENTITIES_SUCCESS",
        response,
        query,
        queryName,
        uids,
        receivedAt: Date.now(),
    };
}

export function successAction(action: string, response: any, objName = "") {
    if (["vehicle", "trailer"].includes(objName)) {
        return {
            type: `${action.toUpperCase()}_${objName.toUpperCase()}_SUCCESS`,
            [objName]: response,
        };
    }
    return {
        type: `${action.toUpperCase()}_${objName.toUpperCase() || "ENTITIES"}_SUCCESS`,
        response,
    };
}

function deleteSuccessAction(
    action: string,
    objName: string,
    pk: string | number,
    deliveryUid?: string,
    transportUid?: string
) {
    return {
        type: `${action.toUpperCase()}_${objName.toUpperCase()}_SUCCESS`,
        pk,
        deliveryUid,
        transportUid,
    };
}

function errorAction(action: string, objName: string, error: any) {
    return {
        type: `${action.toUpperCase()}_${objName.toUpperCase()}_ERROR`,
        error,
    };
}

export function fetchSearch(
    urlBase: string,
    objName: string,
    objSchema: any,
    queryName: string,
    query: any,
    page: number | {fromPage: number; toPage: number},
    apiVersion?: APIVersion,
    onError?: (error: any) => void,
    method: "GET" | "POST" = "GET"
) {
    const action = "SEARCH";

    return function (dispatch: Function) {
        dispatch(searchAction(action, objName, queryName, query, page));

        /* Here, the promise returned by debouncedSearch resolves immediately after launching the debouncing,
           which returns undefined if there's nothing in the redux store yet. However, when we dispatch the
           fetchSearch action, we'd expect it to return the search results. This is why we wrap the call to
           debouncedSearch in a new Promise and resolve it when the onSuccess callback is called. */

        return new Promise((resolve, reject) => {
            debouncedSearch(`/${urlBase}/`, apiVersion)(
                queryName,
                query,
                page,
                dispatch,
                (
                    queryName_: string,
                    query_: any,
                    items: any,
                    page_: number | {fromPage: number; toPage: number},
                    hasNextPage: boolean,
                    count: any
                ) => {
                    const response: any = normalize(items, new schema.Array(objSchema));
                    const resultAction = searchSuccessAction(
                        queryName_,
                        query_,
                        response,
                        page_,
                        hasNextPage,
                        count
                    );
                    resolve(resultAction); // resolve the result to complete the await of the the initial debounced dispatch
                    return resultAction; // still return the action for it to be dispatched to redux (for caching, etc)
                },
                (queryName_: string, query_: any, error_: any) => {
                    onError?.(error_);

                    const resultAction = searchErrorAction(queryName_, query_, error_);
                    reject(resultAction); // resolve the result to complete the await of the the initial debounced dispatch
                    return resultAction; // still return the action for it to be dispatched to redux (for caching, etc)
                },
                method
            );
        });
    };
}

export function fetchSearchByUids(
    urlBase: string,
    objName: string,
    objSchema: any,
    queryName: string,
    query: any,
    uids: string[],
    apiVersion?: APIVersion
) {
    const action = "SEARCH";

    return function (dispatch: Function) {
        dispatch(searchPartialActionByUid(action, objName, queryName, query, {uid__in: uids}));
        return searchPartial(`/${urlBase}/`, apiVersion)(
            queryName,
            query,
            {uid__in: uids},
            dispatch,
            (queryName_: string, query_: any, items: any, partialQuery) => {
                const response: any = normalize(items, new schema.Array(objSchema));
                return searchByUidsSuccessAction(
                    queryName_,
                    query_,
                    response,
                    partialQuery.uid__in
                );
            },
            (queryName_: string, query_: any, error_: any) =>
                searchErrorAction(queryName_, query_, error_)
        );
    };
}

export function fetchRetrieve(
    urlBase: string,
    objName: string,
    objSchema: any,
    uid: string | number,
    errorMessage?: ErrorMessage,
    apiVersion?: APIVersion,
    omitCredentials?: boolean,
    queryParams?: string,
    showToast = true
) {
    const action = "RETRIEVE";
    return function (dispatch: Function) {
        dispatch(getAction(action, uid));
        /** @guidedtour[epic=redux] Data loading policy: loading
         *  We dispatch an action to indicate that we are loading the entity.
         */
        dispatch({
            type: `ENTITY_LOADING`,
            id: uid,
            entity: objSchema.key,
        });
        return apiService
            .get(`/${urlBase}/${uid}/${queryParams ?? ""}`, {
                apiVersion,
                credentials: omitCredentials ? "omit" : "same-origin",
            })
            .then(
                (response: any) => {
                    response.__partial = false;
                    /** @guidedtour[epic=redux] Data loading policy: loaded
                     *  We dispatch an action to indicate that we have loaded the entity.
                     */
                    dispatch({
                        type: `ENTITY_LOADED`,
                        id: uid,
                        entity: objSchema.key,
                    });
                    return dispatch(successAction(action, normalize(response, objSchema)));
                },
                async (error: any) =>
                    await handleError({
                        error,
                        errorMessage,
                        errorAction,
                        dispatch,
                        action,
                        objName,
                        showToast,
                    })
            );
    };
}

export function fetchAdd(
    urlBase: string,
    objName: string,
    obj: any,
    objSchema: any,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage | ((error: Response) => Promise<ErrorMessage>),
    apiVersion?: APIVersion
) {
    const action = "ADD";
    return function (dispatch: Function) {
        dispatch(baseAction(action, objName, obj));

        return apiService.post(`/${urlBase}/`, obj, {apiVersion}).then(
            (response: any) => {
                toast.success(getSuccessMessage(successMessage));
                dispatch(successAction(action, normalize(response, objSchema), objName));
                return response;
            },
            async (error: any) => {
                if (typeof errorMessage === "function") {
                    errorMessage = await errorMessage(error);
                }
                return await handleError({
                    error,
                    errorMessage,
                    errorAction,
                    dispatch,
                    action,
                    objName,
                });
            }
        );
    };
}

export function fetchUpdate({
    urlBase,
    objName,
    uid,
    obj,
    objSchema,
    successMessage,
    successToastId,
    errorMessage,
    apiVersion,
}: {
    urlBase: string;
    objName: string;
    uid: string | number;
    obj: any;
    objSchema: any;
    successMessage?: SuccessMessage;
    successToastId?: string;
    errorMessage?: ErrorMessage;
    apiVersion?: APIVersion;
}) {
    const action = "UPDATE";
    return function (dispatch: Function) {
        dispatch(baseAction(action, objName, obj));

        return apiService.patch(`/${urlBase}/${uid}/`, obj, {apiVersion}).then(
            (response: any) => {
                toast.success(getSuccessMessage(successMessage), {toastId: successToastId});
                dispatch(
                    successAction(
                        action,
                        normalize(response, objSchema),
                        ["delivery", "manager"].includes(objName) ? objName : undefined
                    )
                );
                return response;
            },
            async (error: any) =>
                await handleError({
                    error,
                    errorMessage,
                    errorAction,
                    dispatch,
                    action,
                    objName,
                })
        );
    };
}

export function fetchDelete(
    urlBase: string,
    objName: string,
    uid: string | number,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage,
    deliveryUid?: string,
    transportUid?: string,
    apiVersion?: APIVersion
) {
    const action = "DELETE";
    return function (dispatch: Function) {
        dispatch(baseAction(action, objName, uid));

        return apiService.delete(`/${urlBase}/${uid}/`, {apiVersion}).then(
            (response: any) => {
                toast.success(getSuccessMessage(successMessage));
                dispatch(deleteSuccessAction(action, objName, uid, deliveryUid, transportUid));
                return response;
            },
            async (error: any) =>
                await handleError({error, errorMessage, errorAction, dispatch, action, objName})
        );
    };
}

export function fetchListAction(
    urlBase: string,
    objName: string,
    action: string | null,
    method: "POST" | "GET" | "PATCH" | "DELETE",
    filters: any,
    payload: any,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage | ((error: any) => void),
    apiVersion?: APIVersion,
    objSchema?: schema.Entity | schema.Array | null,
    skipInitialAction?: boolean,
    successActionAdditionalData?: any,
    successCallback?: () => unknown
) {
    return function (dispatch: Function) {
        const actionName = `${action ? action.toUpperCase() : "REQUEST"}_${objName.toUpperCase()}`;
        if (!skipInitialAction) {
            dispatch({type: actionName});
        }

        let url = `/${urlBase}/`;
        if (action) {
            url = `${url}${action}/`;
        }
        if (filters) {
            url = `${url}?${queryService.toQueryString(filters)}`;
        }
        let requestPromise;
        if (method === "POST") {
            requestPromise = apiService.post(url, payload, {apiVersion});
        } else if (method === "GET") {
            requestPromise = apiService.get(url, {apiVersion});
        } else if (method === "PATCH") {
            requestPromise = apiService.patch(url, payload, {apiVersion});
        } else if (method === "DELETE") {
            requestPromise = apiService.delete(url, {apiVersion});
        } else {
            throw new Error(`Invalid method: ${method}`);
        }
        return requestPromise.then(
            (response: any) => {
                if (successMessage) {
                    toast.success(getSuccessMessage(successMessage));
                }
                if (successCallback) {
                    successCallback();
                }
                if (objSchema) {
                    response = normalize(response, objSchema);
                }
                return dispatch({
                    type: `${actionName}_SUCCESS`,
                    query: filters,
                    response,
                    ...successActionAdditionalData,
                });
            },
            async (error: any) => {
                if (typeof errorMessage === "function") {
                    errorMessage(error);
                    await handleError({
                        error,
                        errorAction,
                        dispatch,
                        action: actionName,
                        objName,
                        showToast: false,
                    });
                } else {
                    await handleError({
                        error,
                        errorMessage,
                        errorAction,
                        dispatch,
                        action: actionName,
                        objName,
                    });
                }
            }
        );
    };
}

export function fetchDetailAction(
    urlBase: string,
    objName: string,
    action: string,
    method: "POST" | "PATCH" | "DELETE",
    query: Record<string, any> | null,
    objUid: string,
    payload: any,
    objSchema: schema.Entity | null,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage,
    apiVersion?: APIVersion,
    successToastId = "success-toast",
    errorToastId = "error-toast"
) {
    return function (dispatch: Function) {
        dispatch({type: `${action.toUpperCase()}_${objName.toUpperCase()}`});

        let url = `/${urlBase}/${objUid}/${action}/`;
        if (query) {
            url += `?${queryService.toQueryString(query)}`;
        }

        let requestPromise;
        if (method === "POST") {
            requestPromise = apiService.post(url, payload, {apiVersion});
        } else if (method === "PATCH") {
            requestPromise = apiService.patch(url, payload, {apiVersion});
        } else if (method === "DELETE") {
            requestPromise = apiService.delete(url, {apiVersion});
        } else {
            throw new Error(`Invalid method: ${method}`);
        }

        return requestPromise.then(
            (response: any) => {
                toast.success(getSuccessMessage(successMessage), {toastId: successToastId});
                if (objSchema) {
                    response = normalize(response, objSchema);
                }
                dispatch(
                    successAction(
                        "UPDATE",
                        response,
                        ["vehicle", "trailer"].includes(objName) ? objName : undefined
                    )
                );
                return response;
            },
            async (error: any) =>
                await handleError({
                    error,
                    errorMessage,
                    errorAction,
                    dispatch,
                    action,
                    objName,
                    toastId: errorToastId,
                })
        );
    };
}
