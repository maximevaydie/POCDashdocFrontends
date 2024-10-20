import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";

import {apiService} from "../../services/api.service";

export const UPDATE_ADDRESS = "UPDATE_ADDRESS";

function updateAddress(address: Partial<Address>) {
    return {
        type: UPDATE_ADDRESS,
        address,
    };
}

export const UPDATE_ADDRESS_SUCCESS = "UPDATE_ADDRESS_SUCCESS";

function updateAddressSuccess(address: Address) {
    return (dispatch: Function) => {
        toast.success(t("common.updateSaved"));
        dispatch({
            type: UPDATE_ADDRESS_SUCCESS,
            address,
            receivedAt: Date.now(),
        });
    };
}

export const UPDATE_ADDRESS_ERROR = "UPDATE_ADDRESS_ERROR";

function updateAddressError(address: Partial<Address>, error: any) {
    return () => {
        return {
            type: UPDATE_ADDRESS_ERROR,
            address,
            error,
        };
    };
}

export function fetchUpdateAddress(addressPk: number, address: Partial<Address>) {
    return async (dispatch: Function) => {
        dispatch(updateAddress(address));
        try {
            const response: Address = await apiService.patch(`/addresses/${addressPk}/`, address);
            dispatch(updateAddressSuccess(response));
            return response;
        } catch (error) {
            dispatch(updateAddressError(address, error));
            const errorJson = await error.json();
            return errorJson;
        }
    };
}
