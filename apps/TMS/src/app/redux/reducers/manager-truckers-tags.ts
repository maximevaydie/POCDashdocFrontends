import {FleetTag} from "dashdoc-utils";
import cloneDeep from "rfdc/default";

export default function managerTruckersTags(state: FleetTag[] = [], action: any) {
    let newState;
    switch (action.type) {
        case "ADD_MANAGER-TRUCKERS_TAGS_SUCCESS":
        case "UPDATE_MANAGER-TRUCKERS_TAGS_SUCCESS":
            return action["manager-truckers_tags"];
        case "DELETE_MANAGER-TRUCKERS_TAGS_SUCCESS":
            newState = cloneDeep(state);
            const deletedItemIndex = state.findIndex((item) => item.name === action.pk);
            newState.splice(deletedItemIndex, 1);
            return newState;
        case "REQUEST_MANAGER-TRUCKERS_TAGS_SUCCESS":
            return action.response;
        default:
            return state;
    }
}
