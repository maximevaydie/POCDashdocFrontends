import {ConfirmationDocumentsCounts} from "dashdoc-utils";

export interface CountsState {
    transports: {[key: string]: number};
    orders: {[key: string]: number};
    companies: {[key: string]: number};
    confirmationDocuments: {} | ConfirmationDocumentsCounts;
}

const initialState: CountsState = {
    transports: {},
    orders: {},
    companies: {},
    confirmationDocuments: {},
};

export function counts(
    state: CountsState = initialState,
    action: {type: string; query?: any; response: any}
) {
    switch (action.type) {
        case "REQUEST_COUNTERS_SUCCESS":
            return {
                ...state,
                ...action.response,
            };
        case "COMPANIES-COUNT_ADDRESS_SUCCESS":
            return {
                ...state,
                companies: {
                    ...state.companies,
                    [$.param(action.query)]: action.response.count,
                },
            };
        case "REQUEST_CONFIRMATION_DOCUMENTS_COUNTS_SUCCESS":
        case "CONFIRMATION_DOCUMENTS_COUNTS_UPDATED":
            return {
                ...state,
                confirmationDocuments: action.response,
            };
        default:
            return state;
    }
}
