import {apiService} from "@dashdoc/web-common";

export const REQUEST_CURRENT_SUBSCRIPTION = "REQUEST_CURRENT_SUBSCRIPTION";

function requestCurrentSubscription() {
    return {
        type: REQUEST_CURRENT_SUBSCRIPTION,
    };
}

export const REQUEST_CURRENT_SUBSCRIPTION_SUCCESS = "REQUEST_CURRENT_SUBSCRIPTION_SUCCESS";

function requestCurrentSubscriptionSuccess(subscription: any) {
    return {
        type: REQUEST_CURRENT_SUBSCRIPTION_SUCCESS,
        subscription,
    };
}

export const REQUEST_CURRENT_SUBSCRIPTION_ERROR = "REQUEST_CURRENT_SUBSCRIPTION_ERROR";

function requestCurrentSubscriptionError(error: any) {
    return {
        type: REQUEST_CURRENT_SUBSCRIPTION_ERROR,
        error,
    };
}

export function fetchCurrentSubscription() {
    return (dispatch: Function) => {
        dispatch(requestCurrentSubscription());

        return apiService.get("/billing/").then(
            (subscription: any) => {
                return dispatch(requestCurrentSubscriptionSuccess(subscription));
            },
            (error: any) => {
                return error.json().then((errorJson: any) => {
                    dispatch(requestCurrentSubscriptionError(error));
                    return Promise.reject(errorJson);
                });
            }
        );
    };
}
