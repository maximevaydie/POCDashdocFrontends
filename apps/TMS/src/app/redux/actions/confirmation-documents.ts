import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";

export function fetchConfirmationDocumentsCounts() {
    return async (dispatch: Function) => {
        try {
            const response = await apiService.ConfirmationDocuments.getCounts();
            dispatch({type: "REQUEST_CONFIRMATION_DOCUMENTS_COUNTS_SUCCESS", response});
        } catch {
            toast.error(t("common.error"));
        }
    };
}
