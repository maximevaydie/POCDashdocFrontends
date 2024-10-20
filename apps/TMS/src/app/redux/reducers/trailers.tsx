import {searchReducer, searchSuccessReducer} from "@dashdoc/web-common";
import cloneDeep from "rfdc/default";

import {
    REQUEST_TRAILERS_SEARCH,
    REQUEST_TRAILERS_SEARCH_SUCCESS,
} from "app/redux/actions/company/fetch-trailers-search";

export const initialTrailersSearchQuery = {text: ""};
const initialTrailersState = {
    results: {},
    query: {initial: initialTrailersSearchQuery},
    items: {},
};

export default function trailers(state: any = cloneDeep(initialTrailersState), action: any) {
    switch (action.type) {
        case "ADD_TRAILER_SUCCESS":
        case "RETRIEVE_TRAILER_SUCCESS":
        case "UPDATE_TRAILER_SUCCESS":
            return {
                ...state,
                items: {...state.items, [action.trailer.pk]: action.trailer},
            };
        case "DELETE_TRAILER_SUCCESS":
            return cloneDeep(initialTrailersState);
        case REQUEST_TRAILERS_SEARCH:
            return searchReducer(state, action);
        case REQUEST_TRAILERS_SEARCH_SUCCESS:
            return searchSuccessReducer(state, action);
        default:
            return state;
    }
}
