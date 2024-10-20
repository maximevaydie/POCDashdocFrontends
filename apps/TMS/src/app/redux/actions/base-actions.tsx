import {apiService} from "@dashdoc/web-common";
import {
    getErrorMessage,
    getSuccessMessage,
    ErrorMessage,
    SuccessMessage,
} from "@dashdoc/web-common/src/redux/utils";
import {toast} from "@dashdoc/web-ui";
import {APIVersion} from "dashdoc-utils";
import {Dispatch} from "react";

/*
 * TODO:
 * - Replace `dispatch` types by redux `Dispatch<S>`, where S should be our redux' state definition (TBD)
 */

// @guidedtour[epic=redux, seq=12] Base actions
// Here we define some helpers to make it easier to write actions.
// For basic API calls, we can then just call `fetchAdd`, `fetchUpdate`, `fetchDelete` and `fetchRetrieve`.
// The helpers will take care of dispatching the right actions and calling the API.

function baseAction(action: string, objName: string, obj: any) {
    return {
        type: `${action}_${objName.toUpperCase()}`,
        [objName]: obj,
    };
}

function getAction(action: string, objName: string, uid: string) {
    return {
        type: `${action}_${objName.toUpperCase()}`,
        uid,
    };
}

function successAction(action: string, objName: string, obj: any) {
    return {
        type: `${action}_${objName.toUpperCase()}_SUCCESS`,
        [objName]: obj,
    };
}

export function deleteSuccessAction(action: string, objName: string, pk: string) {
    return {
        type: `${action}_${objName.toUpperCase()}_SUCCESS`,
        pk,
    };
}

function errorAction(action: string, objName: string, error: any) {
    return {
        type: `${action}_${objName.toUpperCase()}_ERROR`,
        error,
    };
}

export function fetchAdd(
    urlBase: string,
    objName: string,
    obj: any,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage | ((error: any) => ErrorMessage),
    apiVersion?: APIVersion
) {
    const action = "ADD";
    return function (dispatch: Dispatch<any>) {
        dispatch(baseAction(action, objName, obj));

        return apiService.post(`/${urlBase}/`, obj, {apiVersion}).then(
            (response: any) => {
                // @ts-ignore
                toast.success(getSuccessMessage(successMessage));
                return dispatch(successAction(action, objName, response));
            },
            async (error: any) => {
                if (typeof errorMessage === "function") {
                    const clone = error.clone();
                    const errorJson = clone.json && (await clone.json());
                    toast.error(errorMessage(errorJson));
                } else {
                    // @ts-ignore
                    toast.error(getErrorMessage(error, errorMessage));
                }
                return dispatch(errorAction(action, objName, error));
            }
        );
    };
}

export function fetchRetrieve(
    urlBase: string,
    objName: string,
    uid: string,
    errorMessage?: ErrorMessage,
    apiVersion?: APIVersion
) {
    const action = "RETRIEVE";
    return function (dispatch: Dispatch<any>) {
        dispatch(getAction(action, objName, uid));

        return apiService.get(`/${urlBase}/${uid}/`, {apiVersion}).then(
            (response: any) => {
                return dispatch(successAction(action, objName, response));
            },
            (error: any) => {
                // @ts-ignore
                toast.error(getErrorMessage(error, errorMessage));
                return dispatch(errorAction(action, objName, error));
            }
        );
    };
}

export function fetchUpdate(
    urlBase: string,
    objName: string,
    obj: any,
    objId: string | number,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage | ((error: any) => ErrorMessage),
    apiVersion?: APIVersion,
    showMessage = true
) {
    const action = "UPDATE";
    return function (dispatch: Dispatch<any>) {
        dispatch(baseAction(action, objName, obj));

        return apiService.patch(`/${urlBase}/${objId}/`, obj, {apiVersion}).then(
            (response: any) => {
                // @ts-ignore
                showMessage && toast.success(getSuccessMessage(successMessage));
                return dispatch(successAction(action, objName, response));
            },
            async (error: any) => {
                if (showMessage) {
                    if (typeof errorMessage === "function") {
                        const errorJson = error.json && (await error.json());
                        toast.error(errorMessage(errorJson));
                    } else {
                        // @ts-ignore
                        toast.error(getErrorMessage(error, errorMessage));
                    }
                }
                return dispatch(errorAction(action, objName, error));
            }
        );
    };
}

export function fetchDelete(
    urlBase: string,
    objName: string,
    obj: any,
    successMessage?: SuccessMessage,
    errorMessage?: ErrorMessage,
    apiVersion?: APIVersion
) {
    const action = "DELETE";
    return function (dispatch: Dispatch<any>) {
        dispatch(baseAction(action, objName, obj));

        return apiService.delete(`/${urlBase}/${obj.pk}/`, {apiVersion}).then(
            () => {
                // @ts-ignore
                toast.success(getSuccessMessage(successMessage));
                return dispatch(deleteSuccessAction(action, objName, obj.pk));
            },
            (error: any) => {
                // @ts-ignore
                toast.error(getErrorMessage(error, errorMessage));
                return dispatch(errorAction(action, objName, error));
            }
        );
    };
}
