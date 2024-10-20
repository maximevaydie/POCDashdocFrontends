import {debouncedSearch} from "@dashdoc/web-common";
import {Vehicle} from "dashdoc-utils";

export const REQUEST_VEHICLES_SEARCH = "REQUEST_VEHICLES_SEARCH";

function requestVehiclesSearch(queryName: string, query: any, page: number) {
    return {
        type: REQUEST_VEHICLES_SEARCH,
        query,
        queryName,
        page,
    };
}

export const REQUEST_VEHICLES_SEARCH_SUCCESS = "REQUEST_VEHICLES_SEARCH_SUCCESS";

function requestVehiclesSearchSuccess(
    queryName: string,
    query: any,
    vehicles: Vehicle[],
    page: number,
    hasNextPage: boolean
) {
    return {
        type: REQUEST_VEHICLES_SEARCH_SUCCESS,
        items: vehicles,
        query,
        queryName,
        page,
        hasNextPage,
    };
}

export const REQUEST_VEHICLES_SEARCH_ERROR = "REQUEST_VEHICLES_SEARCH_ERROR";

function requestVehiclesSearchError(queryName: string, query: any, error: any, page: number) {
    return {
        type: REQUEST_VEHICLES_SEARCH_ERROR,
        error,
        query,
        queryName,
        page,
    };
}

export function fetchVehiclesSearch(queryName: string, query: any, page = 1) {
    return (dispatch: Function) => {
        dispatch(requestVehiclesSearch(queryName, query, page));
        return debouncedSearch("/vehicles/")(
            queryName,
            query,
            page,
            dispatch,
            requestVehiclesSearchSuccess,
            requestVehiclesSearchError
        );
    };
}
