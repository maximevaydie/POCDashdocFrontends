import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";

// @guidedtour[epic=redux, seq=10] Legacy actions
// This is the way that we used to write actions when we started using redux.
// It's very verbose so we decided to add some helpers to make it easier to write actions.
// To create an helper, you need to create a function that return:
// `((dispatch: Function) => { ....; dispatch(...); ... })`
// With this pattern, we wrap the boilerplate in a convenient way.
// For each action, we had to write 4 functions:
// - one to dispatch the action
// - one to dispatch a success action
// - one to dispatch an error action
// - one to fetch the data from the API and call the actions above

export const UPDATE_PDF = "UPDATE_PDF";

function updatePdf() {
    return {
        type: UPDATE_PDF,
    };
}

export const UPDATE_PDF_SUCCESS = "UPDATE_PDF_SUCCESS";

function updatePdfSuccess(uid: string) {
    return (dispatch: Function) => {
        toast.success(t("pdf.updateSuccess"));
        return dispatch({
            type: UPDATE_PDF_SUCCESS,
            uid,
        });
    };
}

export const UPDATE_PDF_ERROR = "UPDATE_PDF_ERROR";

function updatePdfError(uid: string) {
    return (dispatch: Function) => {
        toast.error(t("pdf.updateError"));
        return dispatch({
            type: UPDATE_PDF_ERROR,
            uid,
        });
    };
}

export function fetchUpdatePdf(deliveryUid: string) {
    // @guidedtour[epic=redux, seq=11] Thunks
    // Notice that we are returning a function instead of an object.
    // This is a thunk, which is a function that returns another function.
    // This works because of the redux-thunk middleware that is defined in
    // LINK frontend/src/app/redux/services/store.service.ts#redux-thunk

    return (dispatch: Function) => {
        dispatch(updatePdf());

        return apiService.post(`/deliveries/${deliveryUid}/force-pdf-update/`).then(
            () => {
                return dispatch(updatePdfSuccess(deliveryUid));
            },
            () => {
                return dispatch(updatePdfError(deliveryUid));
            }
        );
    };
}
