import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";

import {apiService} from "../../services/api.service";
import {getErrorMessageFromServerError} from "../../services/errors.service";

export const ADD_ADDRESS = "ADD_ADDRESS";

function addAddress(address: Partial<Address>) {
    return {
        type: ADD_ADDRESS,
        address,
    };
}

export const ADD_ADDRESS_SUCCESS = "ADD_ADDRESS_SUCCESS";

function addAddressSuccess(address: Partial<Address>) {
    return (dispatch: Function) => {
        toast.success(t("components.logisticPointSuccessfullyCreated"));
        dispatch({
            type: ADD_ADDRESS_SUCCESS,
            address,
            receivedAt: Date.now(),
        });
    };
}

export const ADD_ADDRESS_ERROR = "ADD_ADDRESS_ERROR";

function addAddressError(address: Partial<Address>, error: any) {
    return async (dispatch: Function) => {
        Logger.error(error);
        const errorMessage = await getErrorMessageFromServerError(
            error,
            t("components.error.couldNotAddAddress")
        );
        toast.error(errorMessage);
        dispatch({
            type: ADD_ADDRESS_ERROR,
            address,
            error,
        });
    };
}

export function fetchAddAddress(address: Partial<Address>) {
    return async (dispatch: Function) => {
        dispatch(addAddress(address));
        try {
            const response: Address = await apiService.post("/addresses/", address);
            dispatch(addAddressSuccess(response));
            return response;
        } catch (error) {
            dispatch(addAddressError(address, error));
            const errorJson = await error.clone().json();
            return errorJson;
        }
    };
}
