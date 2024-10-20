import {debouncedSearch} from "@dashdoc/web-common";
import {Trailer} from "dashdoc-utils";

export const REQUEST_TRAILERS_SEARCH = "REQUEST_TRAILERS_SEARCH";

function requestTrailersSearch(queryName: string, query: any, page: number) {
    return {
        type: REQUEST_TRAILERS_SEARCH,
        query,
        queryName,
        page,
    };
}

export const REQUEST_TRAILERS_SEARCH_SUCCESS = "REQUEST_TRAILERS_SEARCH_SUCCESS";

function requestTrailersSearchSuccess(
    queryName: string,
    query: any,
    trailers: Trailer[],
    page: number,
    hasNextPage: boolean
) {
    return {
        type: REQUEST_TRAILERS_SEARCH_SUCCESS,
        items: trailers,
        query,
        queryName,
        page,
        hasNextPage,
    };
}

export const REQUEST_TRAILERS_SEARCH_ERROR = "REQUEST_TRAILERS_SEARCH_ERROR";

function requestTrailersSearchError(queryName: string, query: any, error: any, page: number) {
    return {
        type: REQUEST_TRAILERS_SEARCH_ERROR,
        error,
        query,
        queryName,
        page,
    };
}

export function fetchTrailersSearch(queryName: string, query: any, page = 1) {
    return (dispatch: Function) => {
        dispatch(requestTrailersSearch(queryName, query, page));
        return debouncedSearch("/trailers/")(
            queryName,
            query,
            page,
            dispatch,
            requestTrailersSearchSuccess,
            requestTrailersSearchError
        );
    };
}
