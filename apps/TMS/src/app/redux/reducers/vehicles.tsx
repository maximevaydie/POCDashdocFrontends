import {searchReducer, searchSuccessReducer} from "@dashdoc/web-common";
import cloneDeep from "rfdc/default";

import {
    REQUEST_VEHICLES_SEARCH,
    REQUEST_VEHICLES_SEARCH_SUCCESS,
} from "app/redux/actions/company/fetch-vehicles-search";

export const initialVehiclesSearchQuery = {text: ""};
const initialVehiclesState = {
    results: {},
    query: {initial: initialVehiclesSearchQuery},
    items: {},
};

export default function vehicles(state: any = cloneDeep(initialVehiclesState), action: any) {
    switch (action.type) {
        case "ADD_VEHICLE_SUCCESS":
        case "RETRIEVE_VEHICLE_SUCCESS":
        case "UPDATE_VEHICLE_SUCCESS":
            if (action.vehicle?.pk) {
                return {
                    ...state,
                    items: {...state.items, [action.vehicle.pk]: action.vehicle},
                };
            }
            return state;
        case "DELETE_VEHICLE_SUCCESS":
            return cloneDeep(initialVehiclesState);
        case REQUEST_VEHICLES_SEARCH:
            return searchReducer(state, action);
        case REQUEST_VEHICLES_SEARCH_SUCCESS:
            return searchSuccessReducer(state, action);
        default:
            return state;
    }
}
